import { supabase } from "@/lib/supabase";

const SELECT_COLUMNS = "id, product_code, description, physical_stock, physical_location, cutoff_date, source_file, notes, updated_at";
const VEHICLE_REFERENCE_COLUMNS = "id, product_code, description, sheet_name, reference_stock, last_cost, last_supplier, last_purchase_date, last_sale_date, last_client, last_comment, source_file, updated_at";
const ITEM_METADATA_COLUMNS = "area, image_url, unit, weight_kg, brand, model, category, system, compatible_equipment, technical_specs, internal_notes";
const STOCK_DETAIL_COLUMNS = `${SELECT_COLUMNS}, ${ITEM_METADATA_COLUMNS}`;
const VEHICLE_REFERENCE_DETAIL_COLUMNS = `${VEHICLE_REFERENCE_COLUMNS}, ${ITEM_METADATA_COLUMNS}`;

export const WAREHOUSE_ITEM_SOURCES = {
  stock: "stock",
  vehicleReference: "vehicle-reference",
};

const SOURCE_CONFIG = {
  [WAREHOUSE_ITEM_SOURCES.stock]: {
    table: "warehouse_inventory",
    columns: STOCK_DETAIL_COLUMNS,
    normalize: (item) => item,
  },
  [WAREHOUSE_ITEM_SOURCES.vehicleReference]: {
    table: "vehicle_reference_catalog",
    columns: VEHICLE_REFERENCE_DETAIL_COLUMNS,
    normalize: normalizeVehicleReferenceRow,
  },
};

const EDITABLE_METADATA_FIELDS = [
  "image_url",
  "area",
  "unit",
  "weight_kg",
  "brand",
  "model",
  "category",
  "system",
  "compatible_equipment",
  "technical_specs",
  "internal_notes",
];

function normalizeSearch(value) {
  return String(value || "").replace(/[,%]/g, " ").trim();
}

function normalizeProductCode(value) {
  return String(value || "").trim().replace(/^[`'"‘’´]+/, "");
}

function normalizeVehicleReferenceRow(item) {
  return {
    ...item,
    product_code: normalizeProductCode(item.product_code),
  };
}

function getSourceConfig(source) {
  const config = SOURCE_CONFIG[source];
  if (!config) throw new Error("Fuente de bodega no soportada.");
  return config;
}

function normalizeMetadataPayload(payload) {
  return EDITABLE_METADATA_FIELDS.reduce((acc, field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return acc;
    const value = payload[field];

    if (field === "weight_kg") {
      acc[field] = value === "" || value === null || value === undefined ? null : Number(value);
      return acc;
    }

    acc[field] = String(value || "").trim() || null;
    return acc;
  }, { updated_at: new Date().toISOString() });
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
  return (data || []).map(normalizeVehicleReferenceRow);
}

export async function getWarehouseItemDetail({ source, id }) {
  const config = getSourceConfig(source);
  const { data, error } = await supabase
    .from(config.table)
    .select(config.columns)
    .eq("id", id)
    .single();

  if (error) throw error;
  return config.normalize(data);
}

export async function updateWarehouseItemMetadata({ source, id, payload }) {
  const config = getSourceConfig(source);
  const metadata = normalizeMetadataPayload(payload);
  const { data, error } = await supabase
    .from(config.table)
    .update(metadata)
    .eq("id", id)
    .select(config.columns)
    .single();

  if (error) throw error;
  return config.normalize(data);
}
