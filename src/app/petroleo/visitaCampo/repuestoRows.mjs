export const repuestoColumns = ["Ítem", "Descripción", "Ref.", "N/P", "Código EPP", "Cant."];

export const normalizeRepuestoRow = (row = []) => repuestoColumns.map((_, index) => String(row[index] ?? ""));

export function parseRepuestoRows(tableText) {
  const rows = String(tableText || "").split(/\r?\n/)
    .filter((line) => line.trim() || line.includes("\t"))
    .map((line) => line.split("\t"));
  const body = rows[0]?.[0]?.trim().toLowerCase() === repuestoColumns[0].toLowerCase() ? rows.slice(1) : rows;
  return body.length ? body.map(normalizeRepuestoRow) : [normalizeRepuestoRow()];
}

export function repuestoRowsToText(rows) {
  return [repuestoColumns, ...rows.map(normalizeRepuestoRow)].map((row) => row.join("\t")).join("\n");
}
