import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { OPERACIONES_TEXT } from "@/constants/operacionesText";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cleanupWarehouseCatalogData, getVehicleReferenceCatalog, getWarehouseInventory, getWarehouseLocations, getWarehouseRecentMovements, importWarehouseItems, normalizeWarehouseProductCode, normalizeWarehouseSupplierName, prepareWarehouseImportRows } from "@/services/warehouseInventoryService";
import { Activity, AlertTriangle, Database, FileUp, Package, PackagePlus, RefreshCw, Search, ShieldCheck, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOURCE_ALL = "all";
const SOURCE_STOCK = "stock";
const SOURCE_VEHICLE_REFERENCE = "vehicle-reference";
const SORT_ASC = "asc";
const SORT_DESC = "desc";
const FILTER_ALL = "todos";
const FILTER_WITH = "con";
const FILTER_WITHOUT = "sin";
const FILTER_ONLY_30 = "solo-30";

const DEFAULT_FILTERS = {
  area: "",
  provider: "",
  stock: FILTER_ALL,
  cost: FILTER_ALL,
  code: FILTER_ALL,
  ficha: FILTER_ALL,
};

function formatNumber(value) {
  return new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(year, month - 1, day));
  }
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value));
}

function normalizeSortText(value) {
  return String(value || "").trim().toLowerCase();
}

function compareValues(a, b) {
  if (typeof a === "number" || typeof b === "number") {
    return (Number(a) || 0) - (Number(b) || 0);
  }

  return normalizeSortText(a).localeCompare(normalizeSortText(b), "es", { numeric: true });
}

function sortRows(rows, sort, accessors) {
  const accessor = accessors[sort.key];
  if (!accessor) return rows;

  return [...rows].sort((a, b) => {
    const result = compareValues(accessor(a), accessor(b));
    return sort.direction === SORT_ASC ? result : -result;
  });
}

function hasValue(value) {
  return String(value ?? "").trim() !== "";
}

function isDash30Code(value) {
  return /-30$/i.test(String(value || "").trim());
}

function getFichaMissingFields(item, viewingReference) {
  const missing = [];
  if (!hasValue(item.area)) missing.push("área");
  if (!hasValue(item.image_url)) missing.push("imagen");
  if (!hasValue(item.category)) missing.push("categoría");
  if (!hasValue(item.system)) missing.push("sistema");
  if (!hasValue(item.unit)) missing.push("unidad");
  if (!hasValue(item.weight_kg)) missing.push("peso");
  if (viewingReference && !hasValue(item.last_supplier)) missing.push("proveedor");
  if (!viewingReference && !hasValue(item.physical_location)) missing.push("ubicación");
  return missing;
}

function getFichaStatus(item, viewingReference) {
  const missing = getFichaMissingFields(item, viewingReference);
  return {
    complete: missing.length === 0,
    label: missing.length === 0 ? "Ficha completa" : "Ficha incompleta",
    missingCount: missing.length,
    detail: missing.join(", "),
  };
}

function getUniqueOptions(rows, accessor) {
  return Array.from(new Set(rows.map(accessor).filter(hasValue))).sort((a, b) => String(a).localeCompare(String(b), "es", { numeric: true }));
}

function filterRows(rows, filters, viewingReference) {
  return rows.filter((item) => {
    const quantity = Number(viewingReference ? item.reference_stock : item.physical_stock) || 0;
    const cost = Number(item.last_cost) || 0;
    const provider = viewingReference ? item.last_supplier : item.last_supplier;
    const fichaStatus = getFichaStatus(item, viewingReference);

    if (filters.area && item.area !== filters.area) return false;
    if (filters.provider && provider !== filters.provider) return false;
    if (filters.stock === FILTER_WITH && quantity <= 0) return false;
    if (filters.stock === FILTER_WITHOUT && quantity > 0) return false;
    if (filters.cost === FILTER_WITH && cost <= 0) return false;
    if (filters.cost === FILTER_WITHOUT && cost > 0) return false;
    if (filters.code === FILTER_ONLY_30 && !isDash30Code(item.product_code)) return false;
    if (filters.ficha === FILTER_WITH && !fichaStatus.complete) return false;
    if (filters.ficha === FILTER_WITHOUT && fichaStatus.complete) return false;
    return true;
  });
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(";")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line, delimiter) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsvText(text) {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const delimiter = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line, delimiter);
    return headers.reduce((acc, header, index) => {
      acc[header] = cells[index] || "";
      return acc;
    }, {});
  });
}

function buildExportRows(rows, viewingReference) {
  const header = ["Código", "Descripción", "Área", "Cantidad", "Stock mínimo", "Ubicación", "Proveedor", "Último costo", "Origen", "Fecha", "Estado ficha", "Campos faltantes"];
  const body = rows.map((item) => {
    const status = getFichaStatus(item, viewingReference);
    return [
      item.product_code,
      item.description,
      item.area || "",
      viewingReference ? item.reference_stock : item.physical_stock,
      viewingReference ? "" : item.stock_minimum,
      viewingReference ? "" : item.physical_location,
      item.last_supplier || "",
      viewingReference ? item.last_cost : "",
      viewingReference ? (item.sheet_name || item.source_file || "Histórico vehículos") : item.source_file,
      viewingReference ? formatDate(item.last_purchase_date || item.last_sale_date) : formatDate(item.cutoff_date),
      status.label,
      status.detail,
    ];
  });
  return [header, ...body];
}

function buildCombinedExportRows(stockRows, referenceRows) {
  const header = ["Lista", "Código", "Descripción", "Área", "Cantidad", "Stock mínimo", "Ubicación", "Proveedor", "Último costo", "Origen", "Fecha", "Estado ficha", "Campos faltantes"];
  const stockBody = buildExportRows(stockRows, false).slice(1).map((row) => ["Stock actual", ...row]);
  const referenceBody = buildExportRows(referenceRows, true).slice(1).map((row) => ["Referencia histórica vehículos", ...row]);
  return [header, ...stockBody, ...referenceBody];
}

function buildRanking(rows, accessor, quantityAccessor) {
  const grouped = rows.reduce((acc, item) => {
    const key = accessor(item) || "Sin dato";
    if (!acc.has(key)) acc.set(key, { label: key, count: 0, quantity: 0 });
    const current = acc.get(key);
    current.count += 1;
    current.quantity += Number(quantityAccessor(item)) || 0;
    return acc;
  }, new Map());

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count).slice(0, 5);
}

function buildDuplicateCodeCount(rows) {
  const grouped = rows.reduce((acc, item) => {
    const code = normalizeWarehouseProductCode(item.product_code);
    if (!code) return acc;
    acc.set(code, (acc.get(code) || 0) + 1);
    return acc;
  }, new Map());

  return Array.from(grouped.values()).filter((count) => count > 1).length;
}

function countNormalizableRows(rows) {
  return rows.filter((item) => {
    const rawCode = item._raw_product_code ?? item.product_code;
    const rawSupplier = item._raw_last_supplier ?? item.last_supplier;
    const rawArea = item._raw_area ?? item.area;
    const code = normalizeWarehouseProductCode(rawCode);
    const supplier = normalizeWarehouseSupplierName(rawSupplier);
    const expectedArea = isDash30Code(code) || /piquersa/i.test(item.description || "") ? "Vehículos Especiales" : rawArea;
    return code !== String(rawCode || "").trim() || supplier !== String(rawSupplier || "").trim() || expectedArea !== rawArea;
  }).length;
}

function buildDataQuality(items, referenceItems) {
  const rows = [...items.map((item) => ({ item, isReference: false })), ...referenceItems.map((item) => ({ item, isReference: true }))];
  const incomplete = rows.filter((row) => !getFichaStatus(row.item, row.isReference).complete).length;
  const withoutImage = rows.filter((row) => !hasValue(row.item.image_url)).length;
  const withoutArea = rows.filter((row) => !hasValue(row.item.area)).length;
  const withoutSupplier = rows.filter((row) => !hasValue(row.item.last_supplier)).length;
  const lowStock = items.filter((item) => Number(item.stock_minimum) > 0 && (Number(item.physical_stock) || 0) <= Number(item.stock_minimum)).length;
  const duplicateCodes = buildDuplicateCodeCount([...items, ...referenceItems]);
  const normalizableRows = countNormalizableRows([...items, ...referenceItems]);

  return {
    score: rows.length === 0 ? 100 : Math.max(0, Math.round(100 - (((incomplete + duplicateCodes + normalizableRows + lowStock) / rows.length) * 100))),
    cards: [
      { label: "Duplicados", value: duplicateCodes, detail: "Códigos repetidos tras limpiar formato" },
      { label: "Normalizables", value: normalizableRows, detail: "Códigos, proveedores o áreas corregibles" },
      { label: "Fichas incompletas", value: incomplete, detail: "Faltan datos técnicos u operativos" },
      { label: "Sin imagen", value: withoutImage, detail: "Pendientes de foto o URL" },
      { label: "Sin proveedor", value: withoutSupplier, detail: "Afecta compras y rankings" },
      { label: "Bajo mínimo", value: lowStock, detail: "Requieren reposición o revisión" },
      { label: "Sin área", value: withoutArea, detail: "Dificulta filtros por negocio" },
    ],
  };
}

export default function BodegaHome() {
  const { isLight } = useTheme();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [referenceItems, setReferenceItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [source, setSource] = useState(SOURCE_ALL);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentMovements, setRecentMovements] = useState([]);
  const [movementsUnavailable, setMovementsUnavailable] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [stockSort, setStockSort] = useState({ key: "product_code", direction: SORT_ASC });
  const [referenceSort, setReferenceSort] = useState({ key: "product_code", direction: SORT_ASC });
  const [cleanupSaving, setCleanupSaving] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState("");
  const [cleanupError, setCleanupError] = useState("");
  const [importSource, setImportSource] = useState(SOURCE_STOCK);
  const [importPreview, setImportPreview] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);

  const viewingAll = source === SOURCE_ALL;
  const viewingReference = source === SOURCE_VEHICLE_REFERENCE;

  const loadInventory = async () => {
    setLoading(true);
    setError("");

    try {
      const [inventoryRows, locationRows, referenceRows] = await Promise.all([
        getWarehouseInventory({ search: deferredSearch, location: viewingReference ? "" : location }),
        getWarehouseLocations(),
        getVehicleReferenceCatalog({ search: deferredSearch }),
      ]);

      setItems(inventoryRows);
      setLocations(locationRows);
      setReferenceItems(referenceRows);
    } catch (err) {
      console.error("Error cargando inventario de bodega:", err);
      setError(["42P01", "42703"].includes(err?.code) ? "Falta ejecutar el SQL actualizado de bodega en Supabase." : "No se pudo cargar la información de bodega.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [deferredSearch, location, viewingReference]);

  useEffect(() => {
    setImportPreview([]);
    setImportMessage("");
    setImportError("");
  }, [importSource]);

  useEffect(() => {
    let cancelled = false;

    async function loadMovements() {
      try {
        const rows = await getWarehouseRecentMovements({ limit: 100 });
        if (cancelled) return;
        setRecentMovements(rows);
        setMovementsUnavailable(false);
      } catch (err) {
        console.error("Error cargando movimientos recientes de bodega:", err);
        if (!cancelled && ["42P01", "42703", "42883"].includes(err?.code)) setMovementsUnavailable(true);
      }
    }

    loadMovements();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const stock = items.reduce((total, item) => total + (Number(item.physical_stock) || 0), 0);
    const uniqueCodes = new Set(items.map((item) => item.product_code).filter(Boolean)).size;
    const referenceStock = referenceItems.reduce((total, item) => total + (Number(item.reference_stock) || 0), 0);
    const lowStock = items.filter((item) => Number(item.stock_minimum) > 0 && (Number(item.physical_stock) || 0) <= Number(item.stock_minimum)).length;

    return {
      rows: items.length,
      uniqueCodes,
      stock,
      locations: locations.length,
      lowStock,
      referenceRows: referenceItems.length,
      referenceStock,
    };
  }, [items, referenceItems, locations.length]);

  const activeRows = viewingAll ? [...items, ...referenceItems] : viewingReference ? referenceItems : items;
  const areaOptions = useMemo(() => getUniqueOptions(activeRows, (item) => item.area), [activeRows]);
  const providerOptions = useMemo(() => getUniqueOptions(activeRows, (item) => item.last_supplier), [activeRows]);
  const filteredItems = useMemo(() => filterRows(items, filters, false), [items, filters]);
  const filteredReferenceItems = useMemo(() => filterRows(referenceItems, filters, true), [referenceItems, filters]);
  const filteredCount = viewingAll ? filteredItems.length + filteredReferenceItems.length : viewingReference ? filteredReferenceItems.length : filteredItems.length;
  const activeFilterCount = Object.values(filters).filter((value) => value && value !== FILTER_ALL).length;
  const fichaSummary = useMemo(() => {
    const rows = viewingAll
      ? [...items.map((item) => ({ item, isReference: false })), ...referenceItems.map((item) => ({ item, isReference: true }))]
      : (viewingReference ? referenceItems : items).map((item) => ({ item, isReference: viewingReference }));

    return rows.reduce((acc, row) => {
      const status = getFichaStatus(row.item, row.isReference);
      if (status.complete) acc.complete += 1;
      else acc.incomplete += 1;
      return acc;
    }, { complete: 0, incomplete: 0 });
  }, [items, referenceItems, viewingAll, viewingReference]);
  const missingFieldSummary = useMemo(() => {
    const rows = viewingAll
      ? [...items.map((item) => ({ item, isReference: false })), ...referenceItems.map((item) => ({ item, isReference: true }))]
      : (viewingReference ? referenceItems : items).map((item) => ({ item, isReference: viewingReference }));
    const counts = rows.reduce((acc, row) => {
      for (const field of getFichaMissingFields(row.item, row.isReference)) {
        acc.set(field, (acc.get(field) || 0) + 1);
      }
      return acc;
    }, new Map());

    return Array.from(counts.entries())
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [items, referenceItems, viewingAll, viewingReference]);
  const operationalSummary = useMemo(() => {
    const rows = viewingAll
      ? [...items.map((item) => ({ ...item, quantity: item.physical_stock })), ...referenceItems.map((item) => ({ ...item, quantity: item.reference_stock }))]
      : viewingReference
        ? referenceItems.map((item) => ({ ...item, quantity: item.reference_stock }))
        : items.map((item) => ({ ...item, quantity: item.physical_stock }));
    const quantityAccessor = (item) => item.quantity;
    const withCost = rows.filter((item) => Number(item.last_cost) > 0).length;
    const withImage = rows.filter((item) => hasValue(item.image_url)).length;
    const dash30 = rows.filter((item) => isDash30Code(item.product_code)).length;
    const value = rows.reduce((total, item) => total + ((Number(quantityAccessor(item)) || 0) * (Number(item.last_cost) || 0)), 0);

    return {
      value,
      dash30,
      withCost,
      withoutCost: rows.length - withCost,
      withImage,
      withoutImage: rows.length - withImage,
      providerRanking: buildRanking(rows, (item) => item.last_supplier, quantityAccessor),
      areaRanking: buildRanking(rows, (item) => item.area, quantityAccessor),
    };
  }, [items, referenceItems, viewingAll, viewingReference]);
  const dataQuality = useMemo(() => buildDataQuality(items, referenceItems), [items, referenceItems]);
  const validImportRows = importPreview.filter((row) => row.status === "valid");

  const sortedItems = useMemo(() => sortRows(filteredItems, stockSort, {
    product_code: (item) => item.product_code,
    description: (item) => item.description,
    area: (item) => item.area,
    physical_stock: (item) => Number(item.physical_stock) || 0,
    stock_minimum: (item) => Number(item.stock_minimum) || 0,
    physical_location: (item) => item.physical_location,
    last_supplier: (item) => item.last_supplier,
    last_cost: () => 0,
    source_file: (item) => item.source_file,
    cutoff_date: (item) => item.cutoff_date,
  }), [filteredItems, stockSort]);

  const sortedReferenceItems = useMemo(() => sortRows(filteredReferenceItems, referenceSort, {
    product_code: (item) => item.product_code,
    description: (item) => item.description,
    area: (item) => item.area,
    reference_stock: (item) => Number(item.reference_stock) || 0,
    physical_location: () => "",
    last_cost: (item) => Number(item.last_cost) || 0,
    last_supplier: (item) => item.last_supplier,
    last_client: (item) => item.last_client,
    sheet_name: (item) => item.sheet_name || item.source_file,
    last_purchase_date: (item) => item.last_purchase_date || item.last_sale_date,
  }), [filteredReferenceItems, referenceSort]);

  const areaSummary = useMemo(() => {
    const rows = viewingAll
      ? [...items.map((item) => ({ ...item, quantity: item.physical_stock })), ...referenceItems.map((item) => ({ ...item, quantity: item.reference_stock }))]
      : viewingReference
        ? referenceItems.map((item) => ({ ...item, quantity: item.reference_stock }))
        : items.map((item) => ({ ...item, quantity: item.physical_stock }));
    const grouped = rows.reduce((acc, item) => {
      const area = item.area || (viewingReference ? "Vehículos" : "Sin área");
      if (!acc.has(area)) acc.set(area, { area, count: 0, quantity: 0 });
      const current = acc.get(area);
      current.count += 1;
      current.quantity += Number(item.quantity) || 0;
      return acc;
    }, new Map());

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [items, referenceItems, viewingAll, viewingReference]);

  const activitySummary = useMemo(() => {
    const grouped = recentMovements.reduce((acc, movement) => {
      const type = movement.movement_type || "sin_tipo";
      if (!acc.has(type)) acc.set(type, { type, count: 0, quantity: 0 });
      const current = acc.get(type);
      current.count += 1;
      current.quantity += Number(movement.quantity) || 0;
      return acc;
    }, new Map());

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [recentMovements]);

  const toggleStockSort = (key) => {
    setStockSort((current) => ({
      key,
      direction: current.key === key && current.direction === SORT_ASC ? SORT_DESC : SORT_ASC,
    }));
  };

  const toggleReferenceSort = (key) => {
    setReferenceSort((current) => ({
      key,
      direction: current.key === key && current.direction === SORT_ASC ? SORT_DESC : SORT_ASC,
    }));
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const exportRows = viewingAll ? [...sortedItems, ...sortedReferenceItems] : viewingReference ? sortedReferenceItems : sortedItems;
  const handleExportCsv = () => {
    if (exportRows.length === 0) return;
    if (viewingAll) {
      downloadCsv("bodega_todas_las_listas_filtrado.csv", buildCombinedExportRows(sortedItems, sortedReferenceItems));
      return;
    }

    const sourceLabel = viewingReference ? "referencia" : "stock";
    downloadCsv(`bodega_${sourceLabel}_filtrado.csv`, buildExportRows(exportRows, viewingReference));
  };

  const handleCleanupData = async () => {
    if (!isSuperAdmin) return;
    setCleanupSaving(true);
    setCleanupMessage("");
    setCleanupError("");

    try {
      const result = await cleanupWarehouseCatalogData();
      setCleanupMessage(`Normalización completa: ${formatNumber(result.updated)} de ${formatNumber(result.scanned)} registros requerían ajuste.`);
      await loadInventory();
    } catch (err) {
      console.error("Error normalizando bodega:", err);
      setCleanupError(["42P01", "42703"].includes(err?.code) ? "Falta ejecutar los SQL actualizados de bodega en Supabase." : err?.message || "No se pudo normalizar la bodega.");
    } finally {
      setCleanupSaving(false);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportPreview([]);
    setImportMessage("");
    setImportError("");
    if (!file) return;

    try {
      const rows = parseCsvText(await file.text());
      const existingCodes = importSource === SOURCE_VEHICLE_REFERENCE ? referenceItems.map((item) => item.product_code) : items.map((item) => item.product_code);
      const preview = prepareWarehouseImportRows({ source: importSource, rows, existingCodes });
      setImportPreview(preview);
      setImportMessage(`Archivo leído: ${formatNumber(preview.length)} filas, ${formatNumber(preview.filter((row) => row.status === "valid").length)} listas para importar.`);
    } catch (err) {
      console.error("Error leyendo CSV de bodega:", err);
      setImportError(err?.message || "No se pudo leer el archivo CSV.");
    }
  };

  const handleImportRows = async () => {
    if (!isSuperAdmin || validImportRows.length === 0) return;
    setImporting(true);
    setImportError("");

    try {
      const result = await importWarehouseItems({ source: importSource, rows: validImportRows.map((row) => row.payload), userId: user?.id });
      setImportMessage(`Importación completa: ${formatNumber(result.created)} creados${result.errors.length ? `, ${formatNumber(result.errors.length)} con error` : ""}.`);
      setImportPreview(result.errors.length ? importPreview : []);
      await loadInventory();
    } catch (err) {
      console.error("Error importando bodega:", err);
      setImportError(err?.message || "No se pudo importar el archivo.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-3 md:p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`flex items-center gap-2 text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            <Package size={22} className="text-amber-600" /> {OPERACIONES_TEXT.bodega.title}
          </h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            {OPERACIONES_TEXT.bodega.description}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {isSuperAdmin && (
            <button type="button" onClick={() => navigate("/operaciones/bodega/nuevo")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <PackagePlus size={16} /> Nuevo artículo
            </button>
          )}
          <button type="button" onClick={() => navigate("/operaciones")} className="btn-volver-orange">
            Volver
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        <h3 className="font-semibold">Área privada de bodega</h3>
        <p className="mt-2 text-sm leading-6">
          Acceso reservado para superadministrador y usuarios autorizados. El stock actual registra movimientos con trazabilidad y sigue separado de la referencia histórica de Vehículos Especiales.
        </p>
      </section>

      <DataQualityPanel
        quality={dataQuality}
        canEdit={isSuperAdmin}
        saving={cleanupSaving}
        message={cleanupMessage}
        error={cleanupError}
        onCleanup={handleCleanupData}
      />

      {isSuperAdmin && (
        <ImportPanel
          importSource={importSource}
          setImportSource={setImportSource}
          preview={importPreview}
          validCount={validImportRows.length}
          importing={importing}
          message={importMessage}
          error={importError}
          onFile={handleImportFile}
          onImport={handleImportRows}
        />
      )}

      <div className="grid gap-4 md:grid-cols-6">
        <StatCard title="Registros" value={formatNumber(summary.rows)} icon={<Database size={18} />} />
        <StatCard title="Códigos únicos" value={formatNumber(summary.uniqueCodes)} icon={<Package size={18} />} />
        <StatCard title="Stock total" value={formatNumber(summary.stock)} icon={<Warehouse size={18} />} />
        <StatCard title="Ubicaciones" value={formatNumber(summary.locations)} icon={<Warehouse size={18} />} />
        <StatCard title="Bajo mínimo" value={formatNumber(summary.lowStock)} icon={<AlertTriangle size={18} />} />
        <StatCard title="Ref. vehículos" value={formatNumber(summary.referenceRows)} icon={<Package size={18} />} />
      </div>

      {areaSummary.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Resumen por área</h3>
              <p className="text-sm text-slate-500">Vista rápida de la fuente activa: {viewingReference ? "referencia histórica" : "stock actual"}.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {areaSummary.map((item) => (
              <div key={item.area} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{item.area}</p>
                <p className="mt-1 text-sm text-slate-500">{formatNumber(item.count)} códigos</p>
                <p className="text-sm font-semibold text-slate-700">Cantidad: {formatNumber(item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Indicadores operativos</h3>
            <p className="text-sm text-slate-500">Valores calculados sobre la fuente activa: {viewingReference ? "referencia histórica" : "stock actual"}.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MiniMetric label="Valor referencial" value={formatMoney(operationalSummary.value)} />
          <MiniMetric label="Códigos -30" value={formatNumber(operationalSummary.dash30)} />
          <MiniMetric label="Con costo" value={formatNumber(operationalSummary.withCost)} detail={`Sin costo: ${formatNumber(operationalSummary.withoutCost)}`} />
          <MiniMetric label="Con imagen" value={formatNumber(operationalSummary.withImage)} detail={`Sin imagen: ${formatNumber(operationalSummary.withoutImage)}`} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <RankingPanel title="Top proveedores" rows={operationalSummary.providerRanking} empty="Sin proveedores registrados" />
          <RankingPanel title="Top áreas" rows={operationalSummary.areaRanking} empty="Sin áreas registradas" />
        </div>
      </section>

      {(activitySummary.length > 0 || movementsUnavailable) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-amber-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Actividad reciente</h3>
              <p className="text-sm text-slate-500">Movimientos registrados de bodega con stock antes/después cuando aplican a stock real.</p>
            </div>
          </div>
          {movementsUnavailable ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Ejecuta `supabase/sql/warehouse_item_movements.sql` para habilitar movimientos con stock automático.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {activitySummary.map((item) => (
                <div key={item.type} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold capitalize text-slate-900">{item.type.replace("devolucion", "devolución")}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatNumber(item.count)} registros</p>
                  <p className="text-sm font-semibold text-slate-700">Cantidad: {formatNumber(item.quantity)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Inventario y referencia</h3>
            <p className="text-sm text-slate-500">
              {viewingReference
                ? "Consulta histórica de repuestos de Vehículos Especiales para futuras compras o cotizaciones."
                : viewingAll
                  ? "Busca en stock actual y referencia histórica de vehículos desde un solo lugar."
                  : "Consulta de artículos importados desde la base de bodega actual."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar en todas las listas: código, descripción, ubicación, proveedor o cliente"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-400 sm:w-80"
              />
            </label>

            <select value={location} onChange={(event) => setLocation(event.target.value)} disabled={viewingReference} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">Todas las ubicaciones</option>
              {locations.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <button type="button" onClick={loadInventory} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 text-sm">
          <SourceButton active={source === SOURCE_ALL} onClick={() => setSource(SOURCE_ALL)}>
            Todas las listas ({formatNumber(sortedItems.length + sortedReferenceItems.length)})
          </SourceButton>
          <SourceButton active={source === SOURCE_STOCK} onClick={() => setSource(SOURCE_STOCK)}>
            Stock actual ({formatNumber(sortedItems.length)})
          </SourceButton>
          <SourceButton active={source === SOURCE_VEHICLE_REFERENCE} onClick={() => setSource(SOURCE_VEHICLE_REFERENCE)}>
            Referencia histórica vehículos ({formatNumber(sortedReferenceItems.length)})
          </SourceButton>
        </div>

        <div className="border-b border-slate-200 px-4 py-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">Filtros avanzados</h4>
              <p className="text-sm text-slate-500">Filtra todas las listas por área, proveedor, disponibilidad y estado de ficha.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleExportCsv} disabled={exportRows.length === 0} className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                Exportar CSV ({formatNumber(filteredCount)})
              </button>
              <button type="button" onClick={clearFilters} disabled={activeFilterCount === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Limpiar filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <FilterSelect label="Área" value={filters.area} onChange={(value) => updateFilter("area", value)}>
              <option value="">Todas</option>
              {areaOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </FilterSelect>

            <FilterSelect label="Proveedor" value={filters.provider} onChange={(value) => updateFilter("provider", value)}>
              <option value="">Todos</option>
              {providerOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </FilterSelect>

            <FilterSelect label="Cantidad" value={filters.stock} onChange={(value) => updateFilter("stock", value)}>
              <option value={FILTER_ALL}>Todos</option>
              <option value={FILTER_WITH}>Con cantidad</option>
              <option value={FILTER_WITHOUT}>Sin cantidad</option>
            </FilterSelect>

            <FilterSelect label="Costo" value={filters.cost} onChange={(value) => updateFilter("cost", value)}>
              <option value={FILTER_ALL}>Todos</option>
              <option value={FILTER_WITH}>Con costo</option>
              <option value={FILTER_WITHOUT}>Sin costo</option>
            </FilterSelect>

            <FilterSelect label="Código" value={filters.code} onChange={(value) => updateFilter("code", value)}>
              <option value={FILTER_ALL}>Todos</option>
              <option value={FILTER_ONLY_30}>Solo terminados -30</option>
            </FilterSelect>

            <FilterSelect label="Ficha" value={filters.ficha} onChange={(value) => updateFilter("ficha", value)}>
              <option value={FILTER_ALL}>Todas</option>
              <option value={FILTER_WITH}>Completas</option>
              <option value={FILTER_WITHOUT}>Incompletas</option>
            </FilterSelect>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <p className="font-semibold">Fichas completas</p>
              <p className="mt-1 text-2xl font-bold">{formatNumber(fichaSummary.complete)}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Fichas incompletas</p>
              <p className="mt-1 text-2xl font-bold">{formatNumber(fichaSummary.incomplete)}</p>
              <p className="mt-1 text-xs">Usa el filtro "Ficha: Incompletas" para depurarlas.</p>
            </div>
          </div>

          {missingFieldSummary.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">Campos faltantes más comunes</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {missingFieldSummary.map((item) => (
                  <span key={item.field} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700">
                    {item.field}: {formatNumber(item.count)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {viewingReference && (
          <div className="m-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Esta lista es solo referencial histórica de Vehículos Especiales. No descuenta, suma ni reemplaza stock real de bodega.
          </div>
        )}

        {error && (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} /> {error}</p>
            <p className="mt-2">
              {viewingReference
                ? "Ejecuta primero `supabase/sql/vehicle_reference_catalog.sql` y `supabase/sql/warehouse_item_metadata.sql` en Supabase."
                : "Ejecuta primero `supabase/sql/warehouse_inventory.sql` y `supabase/sql/warehouse_item_movements.sql` en Supabase."}
            </p>
          </div>
        )}

        <div className="overflow-x-auto p-3 md:p-4">
          {loading && (viewingAll ? items.length === 0 && referenceItems.length === 0 : viewingReference ? referenceItems.length === 0 : items.length === 0) ? (
            <p className="text-sm text-slate-500">Cargando información...</p>
          ) : viewingAll ? (
            sortedItems.length === 0 && sortedReferenceItems.length === 0 ? (
              <p className="text-sm text-slate-500">No hay artículos que coincidan con la búsqueda o filtros activos en ninguna lista.</p>
            ) : (
              <div className="space-y-6">
                <ResultGroup title="Stock actual" count={sortedItems.length} empty="Sin coincidencias en stock actual.">
                  {sortedItems.length > 0 && <StockTable items={sortedItems} sort={stockSort} onSort={toggleStockSort} onOpen={(item) => navigate(`/operaciones/bodega/${SOURCE_STOCK}/${item.id}`)} />}
                </ResultGroup>
                <ResultGroup title="Referencia histórica vehículos" count={sortedReferenceItems.length} empty="Sin coincidencias en referencia histórica de vehículos.">
                  {sortedReferenceItems.length > 0 && <VehicleReferenceTable items={sortedReferenceItems} sort={referenceSort} onSort={toggleReferenceSort} onOpen={(item) => navigate(`/operaciones/bodega/${SOURCE_VEHICLE_REFERENCE}/${item.id}`)} />}
                </ResultGroup>
              </div>
            )
          ) : viewingReference ? (
            referenceItems.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay referencia histórica de vehículos importada.</p>
            ) : sortedReferenceItems.length === 0 ? (
              <p className="text-sm text-slate-500">No hay artículos que coincidan con los filtros activos.</p>
            ) : (
              <VehicleReferenceTable items={sortedReferenceItems} sort={referenceSort} onSort={toggleReferenceSort} onOpen={(item) => navigate(`/operaciones/bodega/${SOURCE_VEHICLE_REFERENCE}/${item.id}`)} />
            )
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay inventario actual importado.</p>
          ) : sortedItems.length === 0 ? (
            <p className="text-sm text-slate-500">No hay artículos que coincidan con los filtros activos.</p>
          ) : (
            <StockTable items={sortedItems} sort={stockSort} onSort={toggleStockSort} onOpen={(item) => navigate(`/operaciones/bodega/${SOURCE_STOCK}/${item.id}`)} />
          )}
        </div>
      </section>
    </div>
  );
}

function ResultGroup({ title, count, empty, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{formatNumber(count)} resultados</span>
      </div>
      {count === 0 ? <p className="p-4 text-sm text-slate-500">{empty}</p> : children}
    </div>
  );
}

function DataQualityPanel({ quality, canEdit, saving, message, error, onCleanup }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Calidad de datos</h3>
            <p className="text-sm text-slate-500">Auditoría automática de códigos, proveedores, fichas, imágenes y stock mínimo.</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
            Salud: {quality.score}%
          </span>
          {canEdit && (
            <button type="button" onClick={onCleanup} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              <RefreshCw size={15} className={saving ? "animate-spin" : ""} /> {saving ? "Normalizando..." : "Normalizar datos"}
            </button>
          )}
        </div>
      </div>
      {message && <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quality.cards.map((card) => (
          <MiniMetric key={card.label} label={card.label} value={formatNumber(card.value)} detail={card.detail} />
        ))}
      </div>
    </section>
  );
}

function ImportPanel({ importSource, setImportSource, preview, validCount, importing, message, error, onFile, onImport }) {
  const duplicateCount = preview.filter((row) => row.status === "duplicate").length;
  const errorCount = preview.filter((row) => row.status === "error").length;

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white">
            <FileUp size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Importador CSV</h3>
            <p className="text-sm text-blue-800">Carga inventario con vista previa. Normaliza códigos, proveedores y detecta duplicados antes de guardar.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={importSource} onChange={(event) => setImportSource(event.target.value)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500">
            <option value={SOURCE_STOCK}>Stock actual</option>
            <option value={SOURCE_VEHICLE_REFERENCE}>Referencia histórica</option>
          </select>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100">
            Seleccionar CSV
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
          </label>
          <button type="button" onClick={onImport} disabled={validCount === 0 || importing} className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {importing ? "Importando..." : `Importar ${formatNumber(validCount)}`}
          </button>
        </div>
      </div>
      {message && <p className="mt-3 rounded-xl border border-blue-200 bg-white p-3 text-sm font-semibold text-blue-900">{message}</p>}
      {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
      {preview.length > 0 && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-white p-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Listos: {formatNumber(validCount)}</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">Duplicados: {formatNumber(duplicateCount)}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-800">Errores: {formatNumber(errorCount)}</span>
          </div>
          <div className="mt-3 max-h-64 overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2">Proveedor</th>
                  <th className="px-3 py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 25).map((row) => (
                  <tr key={`${row.index}-${row.payload.product_code || row.reason}`} className="border-b border-slate-200 odd:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-700">{row.reason}</td>
                    <td className="px-3 py-2 text-slate-700">{row.payload.product_code || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{row.payload.description || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{row.payload.last_supplier || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{row.payload.physical_stock ?? row.payload.reference_stock ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 25 && <p className="mt-2 text-xs text-slate-500">Mostrando 25 de {formatNumber(preview.length)} filas.</p>}
        </div>
      )}
    </section>
  );
}

function StockTable({ items, sort, onSort, onOpen }) {
  return (
    <table className="w-full table-fixed text-left text-xs xl:text-sm">
      <colgroup>
        <col className="w-[8%]" />
        <col className="w-[18%]" />
        <col className="w-[8%]" />
        <col className="w-[5%]" />
        <col className="w-[5%]" />
        <col className="w-[8%]" />
        <col className="w-[10%]" />
        <col className="w-[6%]" />
        <col className="w-[8%]" />
        <col className="w-[6%]" />
        <col className="w-[14%]" />
        <col className="w-[4%]" />
      </colgroup>
      <thead className="bg-slate-900 text-white">
        <tr>
          <SortableTh sortKey="product_code" sort={sort} onSort={onSort}>Código</SortableTh>
          <SortableTh sortKey="description" sort={sort} onSort={onSort}>Descripción</SortableTh>
          <SortableTh sortKey="area" sort={sort} onSort={onSort}>Área</SortableTh>
          <SortableTh sortKey="physical_stock" sort={sort} onSort={onSort} align="right">Cantidad</SortableTh>
          <SortableTh sortKey="stock_minimum" sort={sort} onSort={onSort} align="right">Stock mín.</SortableTh>
          <SortableTh sortKey="physical_location" sort={sort} onSort={onSort}>Ubicación</SortableTh>
          <SortableTh sortKey="last_supplier" sort={sort} onSort={onSort}>Proveedor</SortableTh>
          <SortableTh sortKey="last_cost" sort={sort} onSort={onSort} align="right">Último costo</SortableTh>
          <SortableTh sortKey="source_file" sort={sort} onSort={onSort}>Origen</SortableTh>
          <SortableTh sortKey="cutoff_date" sort={sort} onSort={onSort}>Fecha</SortableTh>
          <th className="px-2 py-2 font-semibold">Estado ficha</th>
          <th className="px-3 py-2 font-semibold">Ficha</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const fichaStatus = getFichaStatus(item, false);
          return (
            <tr key={item.id} className="border-b border-slate-200 odd:bg-slate-50 hover:bg-amber-50">
              <td className="break-words px-2 py-2 font-semibold text-slate-900">{item.product_code}</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.description}</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.area || "-"}</td>
              <td className="px-2 py-2 text-right font-semibold text-slate-900">{formatNumber(item.physical_stock)}</td>
              <td className="px-2 py-2 text-right text-slate-700">{item.stock_minimum ? formatNumber(item.stock_minimum) : "-"}</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.physical_location || "-"}</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.last_supplier || "-"}</td>
              <td className="px-2 py-2 text-right text-slate-600">-</td>
              <td className="break-words px-2 py-2 text-slate-600">{item.source_file || "-"}</td>
              <td className="break-words px-2 py-2 text-slate-600">{formatDate(item.cutoff_date)}</td>
              <td className="px-2 py-2"><FichaStatusBadge status={fichaStatus} /></td>
              <td className="px-2 py-2">
                <button type="button" onClick={() => onOpen(item)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
                  Abrir
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SourceButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-semibold ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function MiniMetric({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

function RankingPanel({ title, rows, empty }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="font-semibold text-slate-900">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="text-right text-slate-500">{formatNumber(item.count)} códigos · {formatNumber(item.quantity)} cant.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableTh({ sortKey, sort, onSort, align = "left", children }) {
  const active = sort.key === sortKey;
  const arrow = active ? (sort.direction === SORT_ASC ? " ↑" : " ↓") : "";

  return (
    <th className={`px-3 py-2 font-semibold ${align === "right" ? "text-right" : ""}`}>
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 text-left hover:underline">
        {children}{arrow}
      </button>
    </th>
  );
}

function VehicleReferenceTable({ items, sort, onSort, onOpen }) {
  return (
    <table className="w-full table-fixed text-left text-xs xl:text-sm">
      <colgroup>
        <col className="w-[8%]" />
        <col className="w-[20%]" />
        <col className="w-[8%]" />
        <col className="w-[5%]" />
        <col className="w-[5%]" />
        <col className="w-[10%]" />
        <col className="w-[6%]" />
        <col className="w-[10%]" />
        <col className="w-[6%]" />
        <col className="w-[18%]" />
        <col className="w-[4%]" />
      </colgroup>
      <thead className="bg-blue-950 text-white">
        <tr>
          <SortableTh sortKey="product_code" sort={sort} onSort={onSort}>Código</SortableTh>
          <SortableTh sortKey="description" sort={sort} onSort={onSort}>Descripción</SortableTh>
          <SortableTh sortKey="area" sort={sort} onSort={onSort}>Área</SortableTh>
          <SortableTh sortKey="reference_stock" sort={sort} onSort={onSort} align="right">Cantidad</SortableTh>
          <SortableTh sortKey="physical_location" sort={sort} onSort={onSort}>Ubicación</SortableTh>
          <SortableTh sortKey="last_supplier" sort={sort} onSort={onSort}>Proveedor</SortableTh>
          <SortableTh sortKey="last_cost" sort={sort} onSort={onSort} align="right">Último costo</SortableTh>
          <SortableTh sortKey="sheet_name" sort={sort} onSort={onSort}>Origen</SortableTh>
          <SortableTh sortKey="last_purchase_date" sort={sort} onSort={onSort}>Fecha</SortableTh>
          <th className="px-2 py-2 font-semibold">Estado ficha</th>
          <th className="px-3 py-2 font-semibold">Ficha</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const fichaStatus = getFichaStatus(item, true);
          return (
            <tr key={item.id} className="border-b border-slate-200 odd:bg-blue-50/40 hover:bg-blue-100/60">
              <td className="break-words px-2 py-2 font-semibold text-slate-900">{item.product_code}</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.description}</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.area || "Vehículos Especiales"}</td>
              <td className="px-2 py-2 text-right font-semibold text-slate-900">{formatNumber(item.reference_stock)}</td>
              <td className="px-2 py-2 text-slate-700">-</td>
              <td className="break-words px-2 py-2 text-slate-700">{item.last_supplier || "-"}</td>
              <td className="px-2 py-2 text-right font-semibold text-slate-900">{formatMoney(item.last_cost)}</td>
              <td className="break-words px-2 py-2 text-slate-600">{item.sheet_name || item.source_file || "Histórico vehículos"}</td>
              <td className="break-words px-2 py-2 text-slate-600">{formatDate(item.last_purchase_date || item.last_sale_date)}</td>
              <td className="px-2 py-2"><FichaStatusBadge status={fichaStatus} /></td>
              <td className="px-2 py-2">
                <button type="button" onClick={() => onOpen(item)} className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-white">
                  Abrir
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400">
        {children}
      </select>
    </label>
  );
}

function FichaStatusBadge({ status }) {
  return (
    <div className="w-full min-w-0 space-y-1">
      <span title={status.detail || "Ficha completa"} className={`flex w-full items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${status.complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
        {status.label}{status.complete ? "" : ` (${status.missingCount})`}
      </span>
      {!status.complete && (
        <p className="text-xs leading-4 text-slate-500">Falta: {status.detail}</p>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
