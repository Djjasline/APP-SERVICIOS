import { supabase } from "@/lib/supabase";

const CLIENT_REFERENCE_COLUMNS = "id, name, tax_id, address, source_file, updated_at";

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
