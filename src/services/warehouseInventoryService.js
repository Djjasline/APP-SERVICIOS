import { supabase } from "@/lib/supabase";

const LIST_METADATA_COLUMNS = "image_url, unit, weight_kg, stock_minimum, brand, model, category, system, compatible_equipment";
const SELECT_COLUMNS = `id, product_code, description, physical_stock, physical_location, cutoff_date, source_file, notes, area, updated_at, ${LIST_METADATA_COLUMNS}`;
const VEHICLE_REFERENCE_COLUMNS = `id, product_code, description, sheet_name, reference_stock, last_cost, last_supplier, last_purchase_date, last_sale_date, last_client, last_comment, source_file, area, updated_at, ${LIST_METADATA_COLUMNS}`;
const QUOTE_STOCK_COLUMNS = "id, product_code, description, physical_stock, physical_location, area, updated_at";
const QUOTE_REFERENCE_COLUMNS = "id, product_code, description, reference_stock, last_cost, last_supplier, source_file, area, updated_at";
const ITEM_METADATA_COLUMNS = "image_url, unit, weight_kg, brand, model, category, system, compatible_equipment, technical_specs, internal_notes";
const STOCK_DETAIL_COLUMNS = `${SELECT_COLUMNS}, ${ITEM_METADATA_COLUMNS}`;
const VEHICLE_REFERENCE_DETAIL_COLUMNS = `${VEHICLE_REFERENCE_COLUMNS}, ${ITEM_METADATA_COLUMNS}`;
const VEHICLE_SPECIALS_AREA = "Vehículos Especiales";
const FS_DEPOT_SUPPLIER = "FS-DEPOT";
const PIQUERSA_SUPPLIER = "Piquersa";

export const WAREHOUSE_ITEM_SOURCES = {
  stock: "stock",
  vehicleReference: "vehicle-reference",
};

export const WAREHOUSE_AVAILABILITY_STATUS = {
  stock: "stock",
  reference: "reference",
  order: "order",
  unavailable: "unavailable",
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

const BASE_METADATA_FIELDS = [
  "image_url",
  "area",
  "unit",
  "weight_kg",
  "stock_minimum",
  "brand",
  "model",
  "category",
  "system",
  "compatible_equipment",
  "technical_specs",
  "internal_notes",
];

const EDITABLE_METADATA_FIELDS = BASE_METADATA_FIELDS;

const VEHICLE_REFERENCE_METADATA_FIELDS = [
  ...BASE_METADATA_FIELDS,
  "last_supplier",
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

const NUMERIC_FIELDS = new Set(["physical_stock", "reference_stock", "last_cost", "weight_kg", "stock_minimum"]);
const DATE_FIELDS = new Set(["cutoff_date", "last_purchase_date", "last_sale_date"]);
const MOVEMENT_COLUMNS = "id, item_source, item_id, movement_type, quantity, unit_cost, stock_before, stock_after, area, related_party, responsible, service_ref, equipment, client, document_ref, evidence_url, notes, created_by, created_at";
const MOVEMENT_NUMERIC_FIELDS = new Set(["quantity", "unit_cost"]);

export const WAREHOUSE_MOVEMENT_TYPES = ["entrada", "salida", "reserva", "devolucion", "ajuste", "uso", "cotizacion"];

function normalizeSearch(value) {
  return String(value || "").replace(/[,%()"']/g, " ").trim();
}

function uniqueSearchTerms(values) {
  return Array.from(new Set(values.map(normalizeSearch).filter((value) => value.length >= 3))).slice(0, 25);
}

function itemSearchTerms(item) {
  return uniqueSearchTerms([item?.label, item?.value, item?.key]);
}

function rowScore(row, terms) {
  const haystack = `${row.product_code || ""} ${row.description || ""}`.toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0);
}

function findBestRow(rows, terms, quantityField) {
  return rows
    .map((row) => ({ row, score: rowScore(row, terms), quantity: Number(row[quantityField]) || 0 }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || b.quantity - a.quantity)[0]?.row || null;
}

function normalizeProductCode(value) {
  return String(value || "").trim().replace(/^[`'"‘’´]+/, "");
}

function isFsDepotVehicleCode(productCode) {
  return /-30$/i.test(normalizeProductCode(productCode));
}

function isPiquersaDescription(description) {
  return /piquersa/i.test(String(description || ""));
}

function getWarehouseClassificationFields(item, { includeSupplier = true } = {}) {
  if (!item) return {};

  if (isPiquersaDescription(item.description)) {
    const fields = {
      area: VEHICLE_SPECIALS_AREA,
    };
    if (includeSupplier) fields.last_supplier = PIQUERSA_SUPPLIER;
    return fields;
  }

  if (!isFsDepotVehicleCode(item.product_code)) return {};

  const fields = {
    area: VEHICLE_SPECIALS_AREA,
  };
  if (includeSupplier) fields.last_supplier = item.last_supplier || FS_DEPOT_SUPPLIER;
  return fields;
}

function applyWarehouseClassificationRules(item, options) {
  if (!item) return item;

  return {
    ...item,
    ...getWarehouseClassificationFields(item, options),
  };
}

function normalizeVehicleReferenceRow(item) {
  return applyWarehouseClassificationRules({
    ...item,
    product_code: normalizeProductCode(item.product_code),
  });
}

function normalizeWarehouseInventoryRow(item) {
  return applyWarehouseClassificationRules({
    ...item,
    product_code: normalizeProductCode(item.product_code),
  });
}

function getSourceConfig(source) {
  const config = SOURCE_CONFIG[source];
  if (!config) throw new Error("Fuente de bodega no soportada.");
  return config;
}

function normalizeMetadataPayload(source, payload) {
  const fields = source === WAREHOUSE_ITEM_SOURCES.vehicleReference ? VEHICLE_REFERENCE_METADATA_FIELDS : EDITABLE_METADATA_FIELDS;
  const metadata = fields.reduce((acc, field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return acc;
    const value = payload[field];

    if (NUMERIC_FIELDS.has(field)) {
      acc[field] = value === "" || value === null || value === undefined ? null : Number(value);
      return acc;
    }

    acc[field] = String(value || "").trim() || null;
    return acc;
  }, { updated_at: new Date().toISOString() });

  return {
    ...metadata,
    ...getWarehouseClassificationFields({ ...payload, ...metadata }, { includeSupplier: source === WAREHOUSE_ITEM_SOURCES.vehicleReference }),
  };
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

  Object.assign(normalized, getWarehouseClassificationFields(normalized, { includeSupplier: source === WAREHOUSE_ITEM_SOURCES.vehicleReference }));

  if (userId) normalized.created_by = userId;
  return normalized;
}

function normalizeMovementPayload({ source, itemId, payload, userId }) {
  if (!source || !itemId) throw new Error("Artículo de bodega no válido.");
  if (!WAREHOUSE_MOVEMENT_TYPES.includes(payload.movement_type)) throw new Error("Tipo de movimiento no válido.");

  const row = ["movement_type", "quantity", "unit_cost", "area", "related_party", "responsible", "service_ref", "equipment", "client", "document_ref", "evidence_url", "notes"].reduce((acc, field) => {
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

export async function getWarehouseAvailabilityForQuoteItems(items = []) {
  const searchableItems = items.map((item) => ({ item, terms: itemSearchTerms(item) })).filter(({ terms }) => terms.length > 0);
  const allTerms = uniqueSearchTerms(searchableItems.flatMap(({ terms }) => terms));

  if (allTerms.length === 0) {
    return items.map((item) => ({ ...item, availability: buildAvailability(WAREHOUSE_AVAILABILITY_STATUS.unavailable) }));
  }

  const filters = allTerms.flatMap((term) => [`product_code.ilike.%${term}%`, `description.ilike.%${term}%`]).join(",");
  const [stockResult, referenceResult] = await Promise.all([
    supabase.from("warehouse_inventory").select(QUOTE_STOCK_COLUMNS).or(filters).limit(200),
    supabase.from("vehicle_reference_catalog").select(QUOTE_REFERENCE_COLUMNS).eq("active", true).or(filters).limit(200),
  ]);

  if (stockResult.error) throw stockResult.error;
  if (referenceResult.error) throw referenceResult.error;

  const stockRows = (stockResult.data || []).map(normalizeWarehouseInventoryRow);
  const referenceRows = (referenceResult.data || []).map(normalizeVehicleReferenceRow);

  return items.map((item) => {
    const terms = itemSearchTerms(item);
    if (terms.length === 0) return { ...item, availability: buildAvailability(WAREHOUSE_AVAILABILITY_STATUS.unavailable) };

    const stockMatch = findBestRow(stockRows, terms, "physical_stock");
    if (stockMatch && Number(stockMatch.physical_stock) > 0) {
      return { ...item, availability: buildAvailability(WAREHOUSE_AVAILABILITY_STATUS.stock, stockMatch) };
    }

    const referenceMatch = findBestRow(referenceRows, terms, "reference_stock");
    if (referenceMatch) {
      return { ...item, availability: buildAvailability(WAREHOUSE_AVAILABILITY_STATUS.reference, referenceMatch) };
    }

    return { ...item, availability: buildAvailability(WAREHOUSE_AVAILABILITY_STATUS.order) };
  });
}

function buildAvailability(status, row = null) {
  if (status === WAREHOUSE_AVAILABILITY_STATUS.stock) {
    return {
      status,
      label: "Disponible en bodega",
      source: WAREHOUSE_ITEM_SOURCES.stock,
      itemId: row.id,
      productCode: row.product_code,
      quantity: Number(row.physical_stock) || 0,
      area: row.area || "",
      location: row.physical_location || "",
      note: row.physical_location ? `Stock físico: ${row.physical_stock} · ${row.physical_location}` : `Stock físico: ${row.physical_stock}`,
    };
  }

  if (status === WAREHOUSE_AVAILABILITY_STATUS.reference) {
    return {
      status,
      label: "Solo referencia histórica",
      source: WAREHOUSE_ITEM_SOURCES.vehicleReference,
      itemId: row.id,
      productCode: row.product_code,
      quantity: Number(row.reference_stock) || 0,
      area: row.area || "",
      supplier: row.last_supplier || "",
      lastCost: row.last_cost ?? null,
      note: row.last_supplier ? `Referencia histórica · ${row.last_supplier}` : "Referencia histórica",
    };
  }

  if (status === WAREHOUSE_AVAILABILITY_STATUS.order) {
    return { status, label: "Bajo pedido / validar", note: "Sin coincidencia en stock ni referencia histórica." };
  }

  return { status, label: "Sin datos de bodega", note: "No se pudo consultar disponibilidad." };
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
  const { data: current, error: currentError } = await supabase
    .from(config.table)
    .select("product_code, description")
    .eq("id", id)
    .single();

  if (currentError) throw currentError;

  const metadata = normalizeMetadataPayload(source, { ...current, ...payload });
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
  const { data, error } = await supabase.rpc("register_warehouse_item_movement", {
    p_item_source: row.item_source,
    p_item_id: row.item_id,
    p_movement_type: row.movement_type,
    p_quantity: row.quantity,
    p_unit_cost: row.unit_cost,
    p_area: row.area,
    p_related_party: row.related_party,
    p_responsible: row.responsible,
    p_service_ref: row.service_ref,
    p_equipment: row.equipment,
    p_client: row.client,
    p_document_ref: row.document_ref,
    p_evidence_url: row.evidence_url,
    p_notes: row.notes,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
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
