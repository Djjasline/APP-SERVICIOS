import { supabase } from "@/lib/supabase";
import { generateConfiguratorPdfBlob, getConfiguratorPdfFilename } from "@/app/vehiculos/configurador/configuratorPdf";

const BUCKET = "informe";

function sanitizePathPart(value) {
  return String(value || "cotizacion").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildDbPayload(payload, userId) {
  return {
    user_id: userId,
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
    status: "guardada",
  };
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

  const pdfInfo = await uploadQuotePdf(record.id, payload);

  const { data: updated, error: updateError } = await supabase
    .from("vactor_configurator_quotes")
    .update({ ...pdfInfo, updated_at: new Date().toISOString() })
    .eq("id", record.id)
    .select("*")
    .maybeSingle();

  if (updateError) throw updateError;
  return updated;
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
    .update({ ...buildDbPayload(payload, user.id), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!record) throw new Error("No se encontró la cotización para actualizar.");

  const pdfInfo = await uploadQuotePdf(record.id, payload);

  const { data: updated, error: updateError } = await supabase
    .from("vactor_configurator_quotes")
    .update({ ...pdfInfo, updated_at: new Date().toISOString() })
    .eq("id", record.id)
    .select("*")
    .maybeSingle();

  if (updateError) throw updateError;
  return updated;
}

export async function getConfiguratorQuoteHistory({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("vactor_configurator_quotes")
    .select("id, quote_number, customer, end_customer, sales_person, model_name, model_family, price_summary, pdf_url, status, created_at, updated_at")
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
