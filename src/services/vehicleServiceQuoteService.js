import { supabase } from "@/lib/supabase";

const HISTORY_COLUMNS = "id, quote_number, client, reference, totals, status, created_at, updated_at";

function buildPayload({ offer, lines, totals }, userId) {
  const row = {
    quote_number: offer.proformaNo || null,
    client: offer.client || null,
    reference: offer.reference || null,
    offer: offer || {},
    lines: lines || [],
    totals: totals || {},
    status: "borrador",
    updated_at: new Date().toISOString(),
  };

  if (userId) row.user_id = userId;
  return row;
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
  return data;
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
  return data;
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
