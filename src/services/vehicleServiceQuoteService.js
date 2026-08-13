import { supabase } from "@/lib/supabase";
import { generateVehicleServiceQuotePdfBlob, getVehicleServiceQuotePdfFilename } from "@/app/vehiculos/cotizador/vehicleServiceQuotePdf";

const BUCKET = "informe";
const STATUS_DRAFT = "borrador";
const STATUS_PDF_PENDING = "pdf_pendiente";
const HISTORY_COLUMNS = "id, quote_number, client, reference, totals, status, pdf_url, pdf_error, created_at, updated_at";

function sanitizePathPart(value) {
  return String(value || "cotizacion-servicios").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "cotizacion-servicios";
}

function buildPayload({ offer, lines, totals }, userId) {
  const row = {
    quote_number: offer.proformaNo || null,
    client: offer.client || null,
    reference: offer.reference || null,
    offer: offer || {},
    lines: lines || [],
    totals: totals || {},
    status: STATUS_DRAFT,
    updated_at: new Date().toISOString(),
  };

  if (userId) row.user_id = userId;
  return row;
}

async function uploadQuotePdf(recordId, payload) {
  const blob = await generateVehicleServiceQuotePdfBlob(payload);
  const filename = getVehicleServiceQuotePdfFilename(payload);
  const path = `cotizador/${recordId}/${Date.now()}-${sanitizePathPart(filename)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { pdf_path: path, pdf_url: data.publicUrl };
}

function getErrorMessage(error) {
  return String(error?.message || "No se pudo generar o subir el PDF.").slice(0, 500);
}

async function markPdfPending(record, error) {
  const pdfError = getErrorMessage(error);
  const { data, error: updateError } = await supabase
    .from("vehicle_service_quotes")
    .update({
      status: STATUS_PDF_PENDING,
      pdf_error: pdfError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", record.id)
    .select("*")
    .maybeSingle();

  if (updateError) throw updateError;
  return data || { ...record, status: STATUS_PDF_PENDING, pdf_error: pdfError };
}

async function attachPdfOrMarkPending(record, payload) {
  try {
    const pdfInfo = await uploadQuotePdf(record.id, payload);
    const { data: updated, error: updateError } = await supabase
      .from("vehicle_service_quotes")
      .update({ ...pdfInfo, status: STATUS_DRAFT, pdf_error: null, updated_at: new Date().toISOString() })
      .eq("id", record.id)
      .select("*")
      .maybeSingle();

    if (updateError) throw updateError;
    return updated || { ...record, ...pdfInfo, status: STATUS_DRAFT, pdf_error: null };
  } catch (error) {
    console.error("Error adjuntando PDF del cotizador:", error);
    return markPdfPending(record, error);
  }
}

function buildPdfPayloadFromRecord(record) {
  return {
    offer: record.offer || {},
    lines: record.lines || [],
    totals: record.totals || {},
  };
}

export async function saveVehicleServiceQuote(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Debes iniciar sesión para guardar la cotización.");

  const { data, error } = await supabase
    .from("vehicle_service_quotes")
    .insert(buildPayload(payload, user.id))
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return attachPdfOrMarkPending(data, payload);
}

export async function updateVehicleServiceQuote(id, payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Debes iniciar sesión para actualizar la cotización.");

  const { data, error } = await supabase
    .from("vehicle_service_quotes")
    .update(buildPayload(payload))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No se encontró la cotización para actualizar.");
  return attachPdfOrMarkPending(data, payload);
}

export async function regenerateVehicleServiceQuotePdf(id) {
  const record = await getVehicleServiceQuoteById(id);
  if (!record) throw new Error("No se encontró la cotización para regenerar el PDF.");

  return attachPdfOrMarkPending(record, buildPdfPayloadFromRecord(record));
}

export async function getVehicleServiceQuoteHistory({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("vehicle_service_quotes")
    .select(HISTORY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getVehicleServiceQuoteById(id) {
  const { data, error } = await supabase
    .from("vehicle_service_quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
