import { supabase } from "@/lib/supabase";

export const SURVEY_STATUS_LABELS = {
  pendiente: "Pendiente",
  enviada: "Enviada",
  respondida: "Respondida",
  revisada: "Revisada",
  requiere_seguimiento: "Requiere seguimiento",
};

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildSurveyPayload(record, userId) {
  const data = record?.data || {};

  return {
    record_id: record.id,
    area: record.area || "sin_area",
    tipo: record.tipo || "informe",
    subtipo: record.subtipo || data.tipoInforme || null,
    report_code: data.codInf || data.codigo || data.pedidoDemanda || record.id,
    client_name: data.cliente || data.contacto || data.empresa || "Sin cliente",
    technician_name: data.tecnicoNombre || data.tecnicoResponsable || data.responsable || null,
    service_date: safeDate(data.fecha || data.fechaServicio || data.fechaMantenimiento || record.updated_at || record.created_at),
    created_by: userId || null,
    status: "pendiente",
  };
}

export function getSurveyPublicUrl(token) {
  if (!token) return "";
  return `${window.location.origin}/encuesta/cliente/${token}`;
}

export async function getSurveyForRecord(recordId) {
  if (!recordId) return null;

  const { data, error } = await supabase
    .from("customer_satisfaction_surveys")
    .select("*")
    .eq("record_id", recordId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOrCreateSurveyForRecord(record, userId) {
  if (!record?.id) throw new Error("No se encontró el registro del informe.");

  const existing = await getSurveyForRecord(record.id);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("customer_satisfaction_surveys")
    .insert(buildSurveyPayload(record, userId))
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markSurveySent(surveyId) {
  if (!surveyId) return null;

  const { data, error } = await supabase
    .from("customer_satisfaction_surveys")
    .update({ status: "enviada", updated_at: new Date().toISOString() })
    .eq("id", surveyId)
    .neq("status", "respondida")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPublicSurveyByToken(token) {
  const { data, error } = await supabase.rpc("get_customer_satisfaction_survey_by_token", {
    p_token: token,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}

export async function submitPublicSurvey(token, payload) {
  const { data, error } = await supabase.rpc("submit_customer_satisfaction_survey", {
    p_token: token,
    p_respondent: payload.respondent || {},
    p_ratings: payload.ratings || {},
    p_answers: payload.answers || {},
    p_comments: payload.comments || "",
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}
