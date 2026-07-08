import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeEmail = (email: unknown) => String(email || "").trim().toLowerCase();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

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
    return jsonResponse({ error: "No autorizado" }, 401);
  }

  const {
    user_ids,
    recipient_emails,
    titulo,
    mensaje,
    url,
    record_type = "",
    record_id = null,
    save_notification = false,
  } = await req.json();

  const targetUserIds = new Set<string>();
  const targetEmails = new Set<string>();

  if (Array.isArray(user_ids)) {
    user_ids.filter(Boolean).forEach((id) => targetUserIds.add(String(id)));
  }

  if (Array.isArray(recipient_emails) && recipient_emails.length > 0) {
    const normalizedEmails = recipient_emails
      .map((email) => normalizeEmail(email))
      .filter(Boolean);

    normalizedEmails.forEach((email) => targetEmails.add(email));

    if (normalizedEmails.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, email");

      if (profilesError) {
        return jsonResponse({ error: profilesError.message }, 500);
      }

      const emailSet = new Set(normalizedEmails);

      (profiles || [])
        .filter((profile) => emailSet.has(String(profile.email || "").trim().toLowerCase()))
        .forEach((profile) => targetUserIds.add(profile.id));
    }
  }

  if (targetUserIds.size > 0 && targetEmails.size === 0) {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .in("id", Array.from(targetUserIds));

    if (profilesError) {
      return jsonResponse({ error: profilesError.message }, 500);
    }

    (profiles || [])
      .map((profile) => normalizeEmail(profile.email))
      .filter(Boolean)
      .forEach((email) => targetEmails.add(email));
  }

  let notificationsInserted = 0;

  if (save_notification && targetEmails.size > 0) {
    const { data: notifications, error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert(
        Array.from(targetEmails).map((recipientEmail) => ({
          recipient_email: recipientEmail,
          title: titulo || "App Servicios",
          message: mensaje || "Nueva notificación",
          record_type,
          record_id,
          read: false,
          created_at: new Date().toISOString(),
        }))
      )
      .select("id");

    if (notificationError) {
      return jsonResponse({ error: notificationError.message }, 500);
    }

    notificationsInserted = notifications?.length || 0;
  }

  if (targetUserIds.size === 0) {
    return jsonResponse({
      enviados: 0,
      fallidos: 0,
      notificaciones: notificationsInserted,
      warning: "No se encontraron usuarios/suscripciones push para los destinatarios.",
    });
  }

  const { data: targetProfiles, error: targetProfilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .in("id", Array.from(targetUserIds));

  if (targetProfilesError) {
    return jsonResponse({ error: targetProfilesError.message }, 500);
  }

  const emailByUserId = new Map(
    (targetProfiles || []).map((profile) => [profile.id, normalizeEmail(profile.email)])
  );

  const unreadCountByEmail = new Map<string, number>();

  if (targetEmails.size > 0) {
    await Promise.all(
      Array.from(targetEmails).map(async (email) => {
        const { count } = await supabaseAdmin
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .ilike("recipient_email", email)
          .eq("read", false);

        unreadCountByEmail.set(email, count || 0);
      })
    );
  }

  const query = supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", Array.from(targetUserIds));

  const { data: suscripciones, error } = await query;

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const resultados = await Promise.allSettled(
    (suscripciones || []).map((sub) => {
      const recipientEmail = emailByUserId.get(sub.user_id) || "";
      const badgeCount = unreadCountByEmail.get(recipientEmail) || 1;
      const payload = JSON.stringify({
        title: titulo || "App Servicios",
        body: mensaje || "Nueva notificación",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: url || "/notifications", badgeCount },
        badgeCount,
      });

      return webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
    })
  );

  return jsonResponse({
    enviados: resultados.filter((r) => r.status === "fulfilled").length,
    fallidos: resultados.filter((r) => r.status === "rejected").length,
    notificaciones: notificationsInserted,
  });
});
