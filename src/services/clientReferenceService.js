import { supabase } from "@/lib/supabase";

const CLIENT_REFERENCE_COLUMNS = "id, name, tax_id, address, source_file, updated_at";
const CLIENT_REFERENCE_DETAIL_COLUMNS = `${CLIENT_REFERENCE_COLUMNS}, active`;

function normalizeSearch(value) {
  return String(value || "").replace(/[,%()"']/g, " ").trim();
}

function normalizeClientReferenceRow(row) {
  return {
    ...row,
    name: String(row?.name || "").trim(),
    tax_id: String(row?.tax_id || "").trim(),
    address: String(row?.address || "").trim(),
  };
}

export async function getClientReferenceCatalog({ search = "", limit = 10 } = {}) {
  let query = supabase
    .from("client_reference_catalog")
    .select(CLIENT_REFERENCE_COLUMNS)
    .eq("active", true)
    .order("name", { ascending: true })
    .limit(limit);

  const safeSearch = normalizeSearch(search);
  if (safeSearch) {
    query = query.or(`name.ilike.%${safeSearch}%,tax_id.ilike.%${safeSearch}%,address.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeClientReferenceRow);
}

export async function getClientReferenceAdminList({ search = "", includeInactive = true, limit = 500 } = {}) {
  let query = supabase
    .from("client_reference_catalog")
    .select(CLIENT_REFERENCE_DETAIL_COLUMNS)
    .order("name", { ascending: true })
    .limit(limit);

  if (!includeInactive) query = query.eq("active", true);

  const safeSearch = normalizeSearch(search);
  if (safeSearch) {
    query = query.or(`name.ilike.%${safeSearch}%,tax_id.ilike.%${safeSearch}%,address.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeClientReferenceRow);
}

function normalizeClientPayload(payload = {}) {
  const row = {
    name: String(payload.name || "").trim(),
    tax_id: String(payload.tax_id || "").trim() || null,
    address: String(payload.address || "").trim() || null,
    source_file: String(payload.source_file || "Manual").trim() || "Manual",
    active: payload.active !== false,
    updated_at: new Date().toISOString(),
  };

  if (!row.name) throw new Error("El nombre del cliente es obligatorio.");
  return row;
}

export async function createClientReference(payload) {
  const { data, error } = await supabase
    .from("client_reference_catalog")
    .insert(normalizeClientPayload(payload))
    .select(CLIENT_REFERENCE_DETAIL_COLUMNS)
    .single();

  if (error) throw error;
  return normalizeClientReferenceRow(data);
}

export async function updateClientReference(id, payload) {
  if (!id) throw new Error("Cliente inválido.");

  const { data, error } = await supabase
    .from("client_reference_catalog")
    .update(normalizeClientPayload(payload))
    .eq("id", id)
    .select(CLIENT_REFERENCE_DETAIL_COLUMNS)
    .single();

  if (error) throw error;
  return normalizeClientReferenceRow(data);
}

export async function deleteClientReference(id) {
  if (!id) throw new Error("Cliente inválido.");
  const { error } = await supabase.from("client_reference_catalog").delete().eq("id", id);
  if (error) throw error;
  return true;
}
