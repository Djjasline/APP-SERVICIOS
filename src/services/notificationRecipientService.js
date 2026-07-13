import { supabase } from "@/lib/supabase";

const normalize = (value) => String(value || "").trim().toLowerCase();

function ruleMatchesScope(rule, area, tipo, subtipo = "") {
  const ruleArea = normalize(rule.area || "todos");
  const [ruleTipo, ruleSubtipo = ""] = normalize(rule.tipo || "todos").split(":");
  const recordArea = normalize(area || "todos");
  const recordTipo = normalize(tipo || "todos");
  const recordSubtipo = normalize(subtipo || "");

  const areaMatches = ruleArea === "todos" || ruleArea === recordArea;
  const tipoMatches =
    ruleTipo === "todos" ||
    (ruleTipo === recordTipo && (!ruleSubtipo || !recordSubtipo || ruleSubtipo === recordSubtipo));

  return areaMatches && tipoMatches && rule.active !== false;
}

export async function getAllNotificationRecipientRules() {
  const { data, error } = await supabase
    .from("notification_recipient_rules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveNotificationRecipientRule(rule) {
  const profile = await getProfileById(rule.recipient_user_id);

  const payload = {
    recipient_user_id: rule.recipient_user_id,
    recipient_email: profile?.email || rule.recipient_email || "",
    recipient_name: profile?.full_name || rule.recipient_name || "",
    area: rule.area || "todos",
    tipo: rule.tipo || "todos",
    active: rule.active !== false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("notification_recipient_rules")
    .upsert(payload, {
      onConflict: "recipient_user_id,area,tipo",
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteNotificationRecipientRule(id) {
  const { error } = await supabase
    .from("notification_recipient_rules")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function getNotificationRecipientsForRecord({ area, tipo, subtipo }) {
  const { data, error } = await supabase
    .from("notification_recipient_rules")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Error cargando destinatarios de notificaciones:", error);
    return [];
  }

  const matchingRules = (data || []).filter((rule) => ruleMatchesScope(rule, area, tipo, subtipo));
  if (matchingRules.length === 0) return [];

  const userIds = Array.from(new Set(matchingRules.map((rule) => rule.recipient_user_id).filter(Boolean)));
  const profilesById = await getProfilesByIds(userIds);
  const emails = new Set();

  matchingRules.forEach((rule) => {
    const profileEmail = profilesById.get(rule.recipient_user_id)?.email;
    const email = normalize(profileEmail || rule.recipient_email);
    if (email) emails.add(email);
  });

  return Array.from(emails);
}

async function getProfileById(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error cargando perfil destinatario:", error);
    return null;
  }

  return data;
}

async function getProfilesByIds(ids) {
  if (!ids.length) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", ids);

  if (error) {
    console.error("Error cargando perfiles destinatarios:", error);
    return new Map();
  }

  return new Map((data || []).map((profile) => [profile.id, profile]));
}
