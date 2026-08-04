import { supabase } from "@/lib/supabase";
import { generateConfiguratorPdfBlob, getConfiguratorPdfFilename } from "@/app/vehiculos/configurador/configuratorPdf";

const BUCKET = "informe";
const STATUS_SAVED = "guardada";
const STATUS_PDF_PENDING = "pdf_pendiente";

const MODEL_SPRITES = {
  "2100i": { col: 0, row: 0 },
  "water-recycler": { col: 1, row: 0 },
  impact: { col: 2, row: 0 },
  "2100i-cb": { col: 3, row: 0 },
  "ramjet-truck": { col: 0, row: 1 },
  "ramjet-trailer": { col: 1, row: 1 },
  ace: { col: 2, row: 1 },
  truvac: { col: 3, row: 1 },
};

function sanitizePathPart(value) {
  return String(value || "cotizacion").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildDbPayload(payload, userId) {
  const dbPayload = {
    quote_number: payload.quote.number,
    customer: payload.quote.customer,
    end_customer: payload.quote.endCustomer,
    sales_person: payload.quote.salesPerson,
    model_id: payload.selectedModel.id,
    model_name: payload.selectedModel.name,
    model_family: payload.selectedModel.family,
    price_summary: payload.priceSummary,
    config: payload.config,
    toggles: payload.toggles,
    items: payload.items || [],
    status: STATUS_SAVED,
  };

  if (userId) dbPayload.user_id = userId;

  return dbPayload;
}

async function uploadQuotePdf(recordId, payload) {
  const blob = await generateConfiguratorPdfBlob(payload);
  const filename = getConfiguratorPdfFilename(payload);
  const path = `configurador/${recordId}/${Date.now()}-${sanitizePathPart(filename)}`;

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

function buildPdfPayloadFromRecord(record, hideValues = false) {
  return {
    quote: {
      number: record.quote_number || "cotizacion-vactor",
      customer: record.customer || "Cliente por definir",
      endCustomer: record.end_customer || "Cliente final",
      salesPerson: record.sales_person || "ASTAP",
    },
    selectedModelId: record.model_id,
    selectedModel: {
      id: record.model_id,
      name: record.model_name || "Vactor",
      family: record.model_family || "Vactor",
      fallbackImage: "/hidro-base.png",
      sprite: MODEL_SPRITES[record.model_id],
    },
    config: record.config || {},
    toggles: record.toggles || {},
    priceSummary: record.price_summary || {},
    items: record.items || [],
    hideValues,
  };
}

async function markPdfPending(record, error) {
  const pdfError = getErrorMessage(error);
  const { data, error: updateError } = await supabase
    .from("vactor_configurator_quotes")
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
      .from("vactor_configurator_quotes")
      .update({ ...pdfInfo, status: STATUS_SAVED, pdf_error: null, updated_at: new Date().toISOString() })
      .eq("id", record.id)
      .select("*")
      .maybeSingle();

    if (updateError) throw updateError;
    return updated;
  } catch (error) {
    console.error("Error adjuntando PDF del configurador:", error);
    return markPdfPending(record, error);
  }
}

export async function saveConfiguratorQuote(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Debes iniciar sesión para guardar la cotización.");
  }

  const { data: record, error } = await supabase
    .from("vactor_configurator_quotes")
    .insert(buildDbPayload(payload, user.id))
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return attachPdfOrMarkPending(record, payload);
}

export async function updateConfiguratorQuote(id, payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Debes iniciar sesión para actualizar la cotización.");
  }

  const { data: record, error } = await supabase
    .from("vactor_configurator_quotes")
    .update({ ...buildDbPayload(payload), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!record) throw new Error("No se encontró la cotización para actualizar.");

  return attachPdfOrMarkPending(record, payload);
}

export async function regenerateConfiguratorQuotePdf(id, { hideValues = false } = {}) {
  const record = await getConfiguratorQuoteById(id);
  if (!record) throw new Error("No se encontró la cotización para regenerar el PDF.");

  return attachPdfOrMarkPending(record, buildPdfPayloadFromRecord(record, hideValues));
}

export async function getConfiguratorQuoteHistory({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("vactor_configurator_quotes")
    .select("id, quote_number, customer, end_customer, sales_person, model_name, model_family, price_summary, pdf_url, status, pdf_error, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getConfiguratorQuoteById(id) {
  const { data, error } = await supabase
    .from("vactor_configurator_quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
