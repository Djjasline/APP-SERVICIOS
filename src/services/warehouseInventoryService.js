import { supabase } from "@/lib/supabase";

const SELECT_COLUMNS = "id, product_code, description, physical_stock, physical_location, cutoff_date, source_file, notes, area, updated_at";
const VEHICLE_REFERENCE_COLUMNS = "id, product_code, description, sheet_name, reference_stock, last_cost, last_supplier, last_purchase_date, last_sale_date, last_client, last_comment, source_file, area, updated_at";
const ITEM_METADATA_COLUMNS = "image_url, unit, weight_kg, brand, model, category, system, compatible_equipment, technical_specs, internal_notes";
const STOCK_DETAIL_COLUMNS = `${SELECT_COLUMNS}, ${ITEM_METADATA_COLUMNS}`;
const VEHICLE_REFERENCE_DETAIL_COLUMNS = `${VEHICLE_REFERENCE_COLUMNS}, ${ITEM_METADATA_COLUMNS}`;
const VEHICLE_SPECIALS_AREA = "Vehículos Especiales";
const FS_DEPOT_SUPPLIER = "FS-DEPOT";

export const WAREHOUSE_ITEM_SOURCES = {
  stock: "stock",
  vehicleReference: "vehicle-reference",
};

const SOURCE_CONFIG = {
  [WAREHOUSE_ITEM_SOURCES.stock]: {
    table: "warehouse_inventory",
    columns: STOCK_DETAIL_COLUMNS,
    normalize: normalizeWarehouseInventoryRow,
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

const STOCK_CREATE_FIELDS = [
  "product_code",
  "description",
  "physical_stock",
  "physical_location",
  "cutoff_date",
  "source_file",
  "notes",
  ...EDITABLE_METADATA_FIELDS,
];

const VEHICLE_REFERENCE_CREATE_FIELDS = [
  "product_code",
  "description",
  "sheet_name",
  "reference_stock",
  "last_cost",
  "last_supplier",
  "last_purchase_date",
  "last_sale_date",
  "last_client",
  "last_comment",
  "source_file",
  ...EDITABLE_METADATA_FIELDS,
];

const NUMERIC_FIELDS = new Set(["physical_stock", "reference_stock", "last_cost", "weight_kg"]);
const DATE_FIELDS = new Set(["cutoff_date", "last_purchase_date", "last_sale_date"]);
const MOVEMENT_COLUMNS = "id, item_source, item_id, movement_type, quantity, unit_cost, area, related_party, document_ref, notes, created_by, created_at";
const MOVEMENT_NUMERIC_FIELDS = new Set(["quantity", "unit_cost"]);

export const WAREHOUSE_MOVEMENT_TYPES = ["entrada", "salida", "reserva", "devolucion", "ajuste", "uso", "cotizacion"];

function normalizeSearch(value) {
  return String(value || "").replace(/[,%]/g, " ").trim();
}

function normalizeProductCode(value) {
  return String(value || "").trim().replace(/^[`'"‘’´]+/, "");
}

function isFsDepotVehicleCode(productCode) {
  return /-30$/i.test(normalizeProductCode(productCode));
}

function applyFsDepotVehicleRule(item) {
  if (!item || !isFsDepotVehicleCode(item.product_code)) return item;

  return {
    ...item,
    area: item.area || VEHICLE_SPECIALS_AREA,
    last_supplier: item.last_supplier || FS_DEPOT_SUPPLIER,
  };
}

function normalizeVehicleReferenceRow(item) {
  return applyFsDepotVehicleRule({
    ...item,
    product_code: normalizeProductCode(item.product_code),
  });
}

function normalizeWarehouseInventoryRow(item) {
  return applyFsDepotVehicleRule({
    ...item,
    product_code: normalizeProductCode(item.product_code),
  });
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

function normalizeCreatePayload(source, payload, userId) {
  const fields = source === WAREHOUSE_ITEM_SOURCES.stock ? STOCK_CREATE_FIELDS : VEHICLE_REFERENCE_CREATE_FIELDS;
  const normalized = fields.reduce((acc, field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return acc;
    const value = payload[field];

    if (NUMERIC_FIELDS.has(field)) {
      acc[field] = value === "" || value === null || value === undefined ? null : Number(value);
      return acc;
    }

    if (DATE_FIELDS.has(field)) {
      acc[field] = value || null;
      return acc;
    }

    acc[field] = String(value || "").trim() || null;
    return acc;
  }, { updated_at: new Date().toISOString() });

  normalized.product_code = normalizeProductCode(normalized.product_code);
  if (!normalized.product_code || !normalized.description) {
    throw new Error("Código y descripción son obligatorios.");
  }

  if (source === WAREHOUSE_ITEM_SOURCES.stock) {
    normalized.physical_stock = normalized.physical_stock ?? 0;
  } else {
    normalized.reference_stock = normalized.reference_stock ?? 0;
    normalized.active = true;
  }

  if (isFsDepotVehicleCode(normalized.product_code)) {
    normalized.area = normalized.area || VEHICLE_SPECIALS_AREA;
    if (source === WAREHOUSE_ITEM_SOURCES.vehicleReference) {
      normalized.last_supplier = normalized.last_supplier || FS_DEPOT_SUPPLIER;
    }
  }

  if (userId) normalized.created_by = userId;
  return normalized;
}

function normalizeMovementPayload({ source, itemId, payload, userId }) {
  if (!source || !itemId) throw new Error("Artículo de bodega no válido.");
  if (!WAREHOUSE_MOVEMENT_TYPES.includes(payload.movement_type)) throw new Error("Tipo de movimiento no válido.");

  const row = ["movement_type", "quantity", "unit_cost", "area", "related_party", "document_ref", "notes"].reduce((acc, field) => {
    const value = payload[field];

    if (MOVEMENT_NUMERIC_FIELDS.has(field)) {
      acc[field] = value === "" || value === null || value === undefined ? null : Number(value);
      return acc;
    }

    acc[field] = String(value || "").trim() || null;
    return acc;
  }, {
    item_source: source,
    item_id: itemId,
  });

  row.quantity = row.quantity ?? 0;
  if (userId) row.created_by = userId;
  return row;
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
  return (data || []).map(normalizeWarehouseInventoryRow);
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

export async function createWarehouseItem({ source, payload, userId }) {
  const config = getSourceConfig(source);
  const row = normalizeCreatePayload(source, payload, userId);
  const { data, error } = await supabase
    .from(config.table)
    .insert(row)
    .select(config.columns)
    .single();

  if (error) throw error;
  return config.normalize(data);
}

export async function getWarehouseItemMovements({ source, itemId, limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("warehouse_item_movements")
    .select(MOVEMENT_COLUMNS)
    .eq("item_source", source)
    .eq("item_id", itemId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function createWarehouseItemMovement({ source, itemId, payload, userId }) {
  const row = normalizeMovementPayload({ source, itemId, payload, userId });
  const { data, error } = await supabase
    .from("warehouse_item_movements")
    .insert(row)
    .select(MOVEMENT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function getWarehouseRecentMovements({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("warehouse_item_movements")
    .select(MOVEMENT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
