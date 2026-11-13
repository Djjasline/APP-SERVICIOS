export function createDefaultPartsAnnexRows(count = 5) {
  return Array.from({ length: count }, () => ({
    descripcion: "",
    numeroParte: "",
    cantidad: "",
    observaciones: "",
  }));
}

export function normalizePartsAnnexRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return createDefaultPartsAnnexRows();

  return rows.map((row) => ({
    ...row,
    descripcion: row?.descripcion ?? "",
    numeroParte: row?.numeroParte === "" ? (row?.nParte ?? "") : (row?.numeroParte ?? row?.nParte ?? ""),
    cantidad: row?.cantidad ?? "",
    observaciones: row?.observaciones ?? row?.observacion ?? "",
  }));
}

export function hasPartsAnnexRowContent(row) {
  return [row?.descripcion, row?.numeroParte, row?.nParte, row?.cantidad, row?.observaciones ?? row?.observacion]
    .some((value) => String(value ?? "").trim().length > 0);
}

export function removePartsAnnexRow(rows, index) {
  if (!Array.isArray(rows) || !Number.isInteger(index) || index < 0 || index >= rows.length) return rows;
  const remaining = rows.filter((_, rowIndex) => rowIndex !== index);
  return remaining.length ? remaining : createDefaultPartsAnnexRows(1);
}
