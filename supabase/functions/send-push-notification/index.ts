import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeEmail = (email: unknown) => String(email || "").trim().toLowerCase();
const SUPER_ADMIN_EMAIL = "smaviles@astap.com";
const SUPERVISOR_OPERACIONES_EMAILS = new Set(["kamhez@astap.com"]);
const SUPERVISOR_PROYECTO_EMAILS = new Set(["abriones@astap.com"]);

type PushSendResult = {
  ok: boolean;
  endpoint: string;
  statusCode: number | null;
};

type SupabaseAdminClient = any;
type DbRow = Record<string, unknown>;

function scopedTypeMatches(ruleTipo: unknown, recordTipo: unknown, recordSubtipo: unknown) {
  const [tipo, subtipo = ""] = String(ruleTipo || "todos").trim().toLowerCase().split(":");
  const normalizedTipo = String(recordTipo || "todos").trim().toLowerCase();
  const normalizedSubtipo = String(recordSubtipo || "").trim().toLowerCase();

  return (
    tipo === "todos" ||
    (tipo === normalizedTipo && (!subtipo || !normalizedSubtipo || subtipo === normalizedSubtipo))
  );
}

function scopeMatches(rule: Record<string, unknown>, record: Record<string, unknown>) {
  const ruleArea = String(rule.area || "todos").trim().toLowerCase();
  const recordArea = String(record.area || "vehiculos").trim().toLowerCase();

  return (
    (ruleArea === "todos" || ruleArea === recordArea) &&
    scopedTypeMatches(rule.tipo, record.tipo, record.subtipo)
  );
}

function permissionMatchesRecord(permission: Record<string, unknown>, record: Record<string, unknown>) {
  const data = (record.data || {}) as Record<string, unknown>;
  const ownerEmail = normalizeEmail(data.tecnicoCorreo || data.correoTecnico);
  const permissionOwnerEmail = normalizeEmail(permission.owner_email);
  const ownerMatches = permission.owner_user_id === record.user_id || (permissionOwnerEmail && permissionOwnerEmail === ownerEmail);

  return ownerMatches && scopeMatches(permission, record) && permission.can_edit === true;
}

function allTargetsAreRequester({
  targetUserIds,
  targetEmails,
  requesterId,
  requesterEmail,
}: {
  targetUserIds: Set<string>;
  targetEmails: Set<string>;
  requesterId: string;
  requesterEmail: string;
}) {
  const userIdsOk = Array.from(targetUserIds).every((id) => id === requesterId);
  const emailsOk = Array.from(targetEmails).every((email) => normalizeEmail(email) === requesterEmail);

  return userIdsOk && emailsOk && (targetUserIds.size > 0 || targetEmails.size > 0);
}

async function getRequesterContext(supabaseAdmin: SupabaseAdminClient, requesterId: string, authEmail: string) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email, role")
    .eq("id", requesterId)
    .maybeSingle();

  const requesterEmail = normalizeEmail(authEmail || profile?.email);
  const isSuperAdmin = requesterEmail === SUPER_ADMIN_EMAIL || profile?.role === "super_admin";

  return { requesterEmail, isSuperAdmin };
}

async function canSendChatNotification({
  supabaseAdmin,
  requesterId,
  conversationId,
  targetUserIds,
  targetEmails,
}: {
  supabaseAdmin: SupabaseAdminClient;
  requesterId: string;
  conversationId: string;
  targetUserIds: Set<string>;
  targetEmails: Set<string>;
}) {
  const { data, error } = await supabaseAdmin
    .from("chat_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);

  if (error) throw error;

  const participants = (data || []) as DbRow[];
  const participantIds = new Set(participants.map((participant) => String(participant.user_id)));
  if (!participantIds.has(requesterId) || !Array.from(targetUserIds).every((id) => participantIds.has(id))) {
    return false;
  }

  if (targetEmails.size === 0) return true;

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .in("id", Array.from(participantIds));

  if (profilesError) throw profilesError;

  const participantProfiles = (profiles || []) as DbRow[];
  const participantEmails = new Set(participantProfiles.map((profile) => normalizeEmail(profile.email)).filter(Boolean));
  return Array.from(targetEmails).every((email) => participantEmails.has(normalizeEmail(email)));
}

async function requesterCanNotifyRecord({
  supabaseAdmin,
  requesterId,
  requesterEmail,
  record,
}: {
  supabaseAdmin: SupabaseAdminClient;
  requesterId: string;
  requesterEmail: string;
  record: Record<string, unknown>;
}) {
  const data = (record.data || {}) as Record<string, unknown>;
  const ownerEmail = normalizeEmail(data.tecnicoCorreo || data.correoTecnico);
  const area = String(record.area || "").trim().toLowerCase();

  if (record.user_id === requesterId || (ownerEmail && ownerEmail === requesterEmail)) return true;
  if (area === "operaciones" && SUPERVISOR_OPERACIONES_EMAILS.has(requesterEmail)) return true;
  if (area === "vehiculos" && SUPERVISOR_PROYECTO_EMAILS.has(requesterEmail)) return true;

  const { data: permissions, error } = await supabaseAdmin
    .from("record_access_permissions")
    .select("owner_user_id, owner_email, area, tipo, can_edit, active")
    .eq("grantee_user_id", requesterId)
    .eq("active", true)
    .eq("can_edit", true);

  if (error) throw error;

  return ((permissions || []) as DbRow[]).some((permission) => permissionMatchesRecord(permission, record));
}

async function canSendRecordNotification({
  supabaseAdmin,
  requesterId,
  requesterEmail,
  recordId,
  targetUserIds,
  targetEmails,
}: {
  supabaseAdmin: SupabaseAdminClient;
  requesterId: string;
  requesterEmail: string;
  recordId: string;
  targetUserIds: Set<string>;
  targetEmails: Set<string>;
}) {
  const { data: record, error: recordError } = await supabaseAdmin
    .from("registros")
    .select("id, user_id, area, tipo, subtipo, data")
    .eq("id", recordId)
    .maybeSingle();

  if (recordError) throw recordError;
  if (!record) return false;

  const canNotify = await requesterCanNotifyRecord({
    supabaseAdmin,
    requesterId,
    requesterEmail,
    record,
  });

  if (!canNotify) return false;

  const { data: rules, error: rulesError } = await supabaseAdmin
    .from("notification_recipient_rules")
    .select("recipient_user_id, recipient_email, area, tipo, active")
    .eq("active", true);

  if (rulesError) throw rulesError;

  const matchingRules = ((rules || []) as DbRow[]).filter((rule) => scopeMatches(rule, record));
  const allowedUserIds = new Set(matchingRules.map((rule) => String(rule.recipient_user_id || "")).filter(Boolean));
  const allowedEmails = new Set(matchingRules.map((rule) => normalizeEmail(rule.recipient_email)).filter(Boolean));

  if (targetEmails.size > 0 && allowedUserIds.size > 0) {
    const { data: recipientProfiles, error: recipientProfilesError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .in("id", Array.from(allowedUserIds));

    if (recipientProfilesError) throw recipientProfilesError;

    ((recipientProfiles || []) as DbRow[])
      .map((profile) => normalizeEmail(profile.email))
      .filter(Boolean)
      .forEach((email) => allowedEmails.add(email));
  }

  return (
    Array.from(targetUserIds).every((id) => allowedUserIds.has(id)) &&
    Array.from(targetEmails).every((email) => allowedEmails.has(normalizeEmail(email)))
  );
}

async function validateNotificationRequest({
  supabaseAdmin,
  requesterId,
  requesterEmail,
  targetUserIds,
  targetEmails,
  recordType,
  recordId,
}: {
  supabaseAdmin: SupabaseAdminClient;
  requesterId: string;
  requesterEmail: string;
  targetUserIds: Set<string>;
  targetEmails: Set<string>;
  recordType: string;
  recordId: string | null;
}) {
  if (allTargetsAreRequester({ targetUserIds, targetEmails, requesterId, requesterEmail })) return true;

  if (recordType === "chat" && recordId) {
    return canSendChatNotification({
      supabaseAdmin,
      requesterId,
      conversationId: recordId,
      targetUserIds,
      targetEmails,
    });
  }

  if (recordId) {
    return canSendRecordNotification({
      supabaseAdmin,
      requesterId,
      requesterEmail,
      recordId,
      targetUserIds,
      targetEmails,
    });
  }

  return false;
}

function getPushStatusCode(error: unknown) {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = Number((error as { statusCode?: unknown }).statusCode);
    return Number.isFinite(statusCode) ? statusCode : null;
  }

  return null;
}

function configureWebPush() {
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
  const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:smaviles@astap.com";

  if (!publicKey || !privateKey) {
    return { ok: false, error: "VAPID keys no configuradas" };
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return { ok: true, error: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "VAPID inválido",
    };
  }
}

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
  const requesterAuthEmail = userData?.user?.email || "";

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

  let targetProfiles: Array<Record<string, unknown>> = [];

  if (targetUserIds.size > 0) {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .in("id", Array.from(targetUserIds));

    if (profilesError) {
      return jsonResponse({ error: profilesError.message }, 500);
    }

    targetProfiles = profiles || [];
    targetProfiles
      .map((profile) => normalizeEmail(profile.email))
      .filter(Boolean)
      .forEach((email) => targetEmails.add(email));
  }

  const emailByUserId = new Map(
    targetProfiles.map((profile) => [String(profile.id), normalizeEmail(profile.email)])
  );

  const { requesterEmail, isSuperAdmin } = await getRequesterContext(
    supabaseAdmin,
    requesterId,
    requesterAuthEmail
  );

  if (!isSuperAdmin) {
    try {
      const authorized = await validateNotificationRequest({
        supabaseAdmin,
        requesterId,
        requesterEmail,
        targetUserIds,
        targetEmails,
        recordType: String(record_type || ""),
        recordId: record_id ? String(record_id) : null,
      });

      if (!authorized) {
        return jsonResponse({ error: "No autorizado para enviar notificaciones a esos destinatarios." }, 403);
      }
    } catch (authorizationError) {
      const message = authorizationError instanceof Error ? authorizationError.message : "Error validando permisos";
      return jsonResponse({ error: message }, 500);
    }
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

  const vapid = configureWebPush();
  if (!vapid.ok) {
    return jsonResponse({
      enviados: 0,
      fallidos: 0,
      notificaciones: notificationsInserted,
      warning: `Push omitido: ${vapid.error}`,
    });
  }

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

  const resultados: PushSendResult[] = await Promise.all(
    (suscripciones || []).map(async (sub) => {
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

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );

        return { ok: true, endpoint: sub.endpoint, statusCode: null };
      } catch (error) {
        return { ok: false, endpoint: sub.endpoint, statusCode: getPushStatusCode(error) };
      }
    })
  );

  const staleEndpoints = resultados
    .filter((result) => !result.ok && [404, 410].includes(result.statusCode || 0))
    .map((result) => result.endpoint);

  if (staleEndpoints.length > 0) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .in("endpoint", staleEndpoints);
  }

  return jsonResponse({
    enviados: resultados.filter((r) => r.ok).length,
    fallidos: resultados.filter((r) => !r.ok).length,
    suscripciones_eliminadas: staleEndpoints.length,
    notificaciones: notificationsInserted,
  });
});
