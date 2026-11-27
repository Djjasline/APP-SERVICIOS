import { supabase } from "@/lib/supabase";

const COLUMNS = "id, source_sheet, source_row, client_name, equipment_type, chassis_vin, chassis_brand, equipment_model, module_serial, manufacture_year, auxiliary_brand, auxiliary_model, auxiliary_serial";

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
  if (category === "hidro") query = query.ilike("equipment_type", "%hidro%");
  if (category === "barredora") query = query.ilike("equipment_type", "%barredora%");
  if (category === "camara") query = query.ilike("equipment_type", "%camara%");
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
