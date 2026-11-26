export const FORM_AREA_META = {
  vehiculos: { label: "Vehículos Especiales", color: "#0f55ff" },
  agua: { label: "Agua y Saneamiento", color: "#1e88e5" },
  industria: { label: "Industria", color: "#64748b" },
  operaciones: { label: "Operaciones", color: "#16a34a" },
  petroleo: { label: "Petróleo y Energía", color: "#f97316" },
};

export const UNCLASSIFIED_AREA = "por_clasificar";
export const RESOURCE_AREA = "repositorios";
const UNCLASSIFIED_META = { label: "Sin área / por clasificar", color: "#a16207" };

export function isResourceRecord(record) {
  return record.area === RESOURCE_AREA || record.tipo === "uso_recurso";
}

export function getDashboardStatus(record) {
  const status = String(record?.estado || "").trim().toLowerCase();
  return ["completado", "borrador", "salida"].includes(status) ? status : "otro";
}

export function summarizeDashboardForms(records) {
  const emptyCounts = () => ({ completado: 0, borrador: 0, salida: 0, otro: 0, total: 0 });
  const metadata = { ...FORM_AREA_META, [UNCLASSIFIED_AREA]: UNCLASSIFIED_META };
  const areaCounts = Object.fromEntries(Object.keys(metadata).map((area) => [area, emptyCounts()]));
  const totals = emptyCounts();

  for (const record of records.filter((item) => !isResourceRecord(item))) {
    const area = Object.hasOwn(FORM_AREA_META, record.area) ? record.area : UNCLASSIFIED_AREA;
    const status = getDashboardStatus(record);
    totals[status] += 1;
    totals.total += 1;
    areaCounts[area][status] += 1;
    areaCounts[area].total += 1;
  }

  return {
    totals,
    areaRows: Object.entries(areaCounts)
      .filter(([area, counts]) => area !== UNCLASSIFIED_AREA || counts.total > 0)
      .map(([area, counts]) => ({ area, ...metadata[area], ...counts })),
    activeAreas: Object.keys(FORM_AREA_META).filter((area) => areaCounts[area].total > 0).length,
    unclassified: areaCounts[UNCLASSIFIED_AREA].total,
  };
}

// Fetch until an empty page, not a short page: server row caps may be lower
// than the requested page size. Callers must order by the immutable unique id.
export async function fetchAllById(fetchPage) {
  const rows = [];
  let cursor = null;
  while (true) {
    const page = await fetchPage(cursor);
    if (!Array.isArray(page)) throw new Error("La consulta paginada no devolvió una lista.");
    if (page.length === 0) return rows;
    for (const row of page) {
      if (!row?.id || (cursor !== null && String(row.id) <= String(cursor))) {
        throw new Error("La paginación no avanzó correctamente.");
      }
      rows.push(row);
      cursor = row.id;
    }
  }
}

export async function captureDashboardQuery(fn, fallback, errors, label) {
  try {
    return await fn();
  } catch (error) {
    console.warn("No se pudo cargar una sección del dashboard:", error?.message || error);
    errors.push(label);
    return fallback;
  }
}
