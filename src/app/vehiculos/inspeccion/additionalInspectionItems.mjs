export function getAdditionalRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && typeof row.id === "string" && row.id) : [];
}

export function getAdditionalRowsForPdf(value) {
  const rows = getAdditionalRows(value).filter((row) => String(row.descripcion || "").trim() || row.estado || String(row.observacion || "").trim() || (Array.isArray(row.imagenes) && row.imagenes.length));
  const items = rows.map((row, index) => [`AD.${index + 1}`, row.descripcion || "Elemento sin descripción"]);
  const data = { items: Object.fromEntries(rows.map((row, index) => [`AD.${index + 1}`, row])) };
  return { items, data };
}
