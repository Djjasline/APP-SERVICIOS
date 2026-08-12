import { supabase } from "@/lib/supabase";

const SELECT_COLUMNS = "id, product_code, description, physical_stock, physical_location, cutoff_date, source_file, notes, updated_at";
const VEHICLE_REFERENCE_COLUMNS = "id, product_code, description, sheet_name, reference_stock, last_cost, last_supplier, last_purchase_date, last_sale_date, last_client, last_comment, source_file, updated_at";

function normalizeSearch(value) {
  return String(value || "").replace(/[,%]/g, " ").trim();
}

export async function getWarehouseInventory({ search = "", location = "", limit = 1000 } = {}) {
  let query = supabase
    .from("warehouse_inventory")
    .select(SELECT_COLUMNS)
    .order("physical_location", { ascending: true, nullsFirst: false })
    .order("product_code", { ascending: true })
    .limit(limit);

  const safeSearch = normalizeSearch(search);

  if (safeSearch) {
    query = query.or(`product_code.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,physical_location.ilike.%${safeSearch}%`);
  }

  if (location) {
    query = query.eq("physical_location", location);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getWarehouseLocations() {
  const { data, error } = await supabase
    .from("warehouse_inventory")
    .select("physical_location")
    .not("physical_location", "is", null)
    .order("physical_location", { ascending: true });

  if (error) throw error;

  return Array.from(new Set((data || []).map((item) => item.physical_location).filter(Boolean)));
}

export async function getVehicleReferenceCatalog({ search = "", limit = 1000 } = {}) {
  let query = supabase
    .from("vehicle_reference_catalog")
    .select(VEHICLE_REFERENCE_COLUMNS)
    .eq("active", true)
    .order("product_code", { ascending: true })
    .limit(limit);

  const safeSearch = normalizeSearch(search);

  if (safeSearch) {
    query = query.or(`product_code.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,last_supplier.ilike.%${safeSearch}%,last_client.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
