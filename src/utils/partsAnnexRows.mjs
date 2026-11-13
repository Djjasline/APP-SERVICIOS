export function hasPartsAnnexRowContent(row) {
  return [row?.descripcion, row?.numeroParte, row?.nParte, row?.cantidad]
    .some((value) => String(value ?? "").trim().length > 0);
}

export function removePartsAnnexRow(rows, index) {
  if (!Array.isArray(rows) || !Number.isInteger(index) || index < 0 || index >= rows.length) return rows;
  const remaining = rows.filter((_, rowIndex) => rowIndex !== index);
  return remaining.length ? remaining : [{ descripcion: "", numeroParte: "", cantidad: "" }];
}
