import { supabase } from "@/lib/supabase";
import { isPossibleEquipmentClient, normalizeEquipmentClient } from "@/utils/equipmentReference.mjs";

const COLUMNS = "id, source_sheet, source_row, client_name, equipment_type, chassis_vin, chassis_brand, equipment_model, module_serial, manufacture_year, auxiliary_brand, auxiliary_model, auxiliary_serial";

function withCategory(query, category) {
  if (category === "hidro") return query.ilike("equipment_type", "%hidro%");
  if (category === "barredora") return query.ilike("equipment_type", "%barredora%");
  if (category === "camara") return query.ilike("equipment_type", "%camara%");
  return query;
}

export async function getEquipmentReferencesForClient(client, { category = "" } = {}) {
  if (normalizeEquipmentClient(client).length < 3) return [];
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const query = supabase.from("equipment_reference_catalog")
      .select(COLUMNS).eq("active", true).order("id").range(offset, offset + pageSize - 1);
    const { data, error } = await withCategory(query, category);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  const exact = normalizeEquipmentClient(client);
  return rows.filter((row) => isPossibleEquipmentClient(client, row.client_name))
    .sort((a, b) => Number(normalizeEquipmentClient(b.client_name) === exact) - Number(normalizeEquipmentClient(a.client_name) === exact)
      || String(a.client_name || "").localeCompare(String(b.client_name || ""), "es")
      || String(a.source_sheet || "").localeCompare(String(b.source_sheet || ""), "es")
      || a.source_row - b.source_row);
}

export async function searchEquipmentReferences(value, { category = "", limit = 20 } = {}) {
  const search = String(value || "").replace(/[,%()"']/g, " ").trim();
  if (search.length < 3) return [];
  let query = supabase.from("equipment_reference_catalog")
    .select(COLUMNS)
    .eq("active", true)
    .or(["client_name", "equipment_type", "chassis_vin", "chassis_brand", "equipment_model", "module_serial", "auxiliary_serial"]
      .map((field) => `${field}.ilike.%${search}%`).join(","))
    .order("client_name", { ascending: true })
    .order("source_sheet", { ascending: true })
    .order("source_row", { ascending: true })
    .limit(limit);
  query = withCategory(query, category);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
