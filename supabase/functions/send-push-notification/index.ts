import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization") || "";

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: userData } = await supabaseUser.auth.getUser();
  const requesterId = userData?.user?.id;

  if (!requesterId) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  const { user_ids, recipient_emails, titulo, mensaje, url } = await req.json();

  const targetUserIds = new Set<string>();

  if (Array.isArray(user_ids)) {
    user_ids.filter(Boolean).forEach((id) => targetUserIds.add(String(id)));
  }

  if (Array.isArray(recipient_emails) && recipient_emails.length > 0) {
    const normalizedEmails = recipient_emails
      .map((email) => String(email || "").trim().toLowerCase())
      .filter(Boolean);

    if (normalizedEmails.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, email");

      if (profilesError) {
        return new Response(JSON.stringify({ error: profilesError.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      const emailSet = new Set(normalizedEmails);

      (profiles || [])
        .filter((profile) => emailSet.has(String(profile.email || "").trim().toLowerCase()))
        .forEach((profile) => targetUserIds.add(profile.id));
    }
  }

  if (targetUserIds.size === 0) {
    return new Response(JSON.stringify({ error: "Debes indicar destinatarios" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const query = supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", Array.from(targetUserIds));

  const { data: suscripciones, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const payload = JSON.stringify({
    title: titulo || "App Servicios",
    body: mensaje || "Nueva notificación",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: url || "/notifications" },
  });

  const resultados = await Promise.allSettled(
    (suscripciones || []).map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );

  return new Response(
    JSON.stringify({
      enviados: resultados.filter((r) => r.status === "fulfilled").length,
      fallidos: resultados.filter((r) => r.status === "rejected").length,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
});
