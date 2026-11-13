import { hasPartsAnnexRowContent } from "./partsAnnexRows.mjs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 3000;
const aliases = {
  cantidad: ["quantity ordered", "cantidad", "cant", "qty"],
  numeroParte: ["part number", "numero de parte", "numero parte", "n parte", "n de parte", "no parte", "nro parte", "np"],
  descripcion: ["description", "descripcion", "descripcion nombre", "nombre"],
  observaciones: ["service note", "observaciones", "observacion"],
};

function normalizeHeader(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function findColumns(row) {
  const columns = {};
  for (const [index, value] of (row || []).entries()) {
    const header = normalizeHeader(value);
    for (const [field, names] of Object.entries(aliases)) {
      if (names.includes(header)) {
        if (columns[field] !== undefined) throw new Error(`Hay más de una columna para ${field}. Deja solo una antes de importar.`);
        columns[field] = index;
      }
    }
  }
  return columns;
}

function cellText(value, rowNumber) {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`La fila ${rowNumber} contiene un valor no válido. Usa texto o números en las columnas del anexo.`);
  }
  return String(value);
}

export function parsePartsAnnexSheet(sheet) {
  if (!Array.isArray(sheet)) throw new Error("No se pudo leer la primera hoja del archivo.");
  let headerIndex = -1;
  let columns;
  for (let index = 0; index < Math.min(sheet.length, 20); index++) {
    const candidate = findColumns(sheet[index]);
    if (candidate.cantidad !== undefined && (candidate.numeroParte !== undefined || candidate.descripcion !== undefined)) {
      headerIndex = index;
      columns = candidate;
      break;
    }
  }
  if (headerIndex < 0) throw new Error("No se encontraron las columnas de cantidad y número de parte o descripción. Usa el formato de la plantilla del anexo.");
  if (sheet.length - headerIndex - 1 > MAX_ROWS) throw new Error(`El archivo supera el límite de ${MAX_ROWS} filas. Divide la lista en varios archivos.`);

  const items = sheet.slice(headerIndex + 1).map((row, index) => {
    const result = {};
    for (const field of Object.keys(aliases)) result[field] = cellText(row?.[columns[field]], headerIndex + index + 2);
    return result;
  }).filter(hasPartsAnnexRowContent);
  if (!items.length) throw new Error("No se encontraron filas con datos en las columnas del anexo.");
  return items;
}

export async function readPartsAnnexFile(file) {
  if (!file || !/\.xlsx$/i.test(file.name || "")) throw new Error("Selecciona un archivo Excel .xlsx.");
  if (file.size > MAX_FILE_SIZE) throw new Error("El archivo supera el límite de 5 MB.");
  try {
    const { readSheet } = await import("read-excel-file/universal");
    const sheet = await readSheet(file, { trim: false, parseNumber: (value) => value });
    return parsePartsAnnexSheet(sheet);
  } catch (error) {
    if (error?.name === "InvalidInputError" || error?.name === "InvalidSpreadsheetError") throw new Error("No se pudo leer el archivo. Verifica que sea un Excel .xlsx válido y sin contraseña.");
    throw error;
  }
}

export function appendImportedParts(existing, imported) {
  const rows = Array.isArray(existing) ? [...existing] : [];
  const knownKeys = new Set(["descripcion", "numeroParte", "nParte", "cantidad", "observaciones", "observacion"]);
  while (rows.length && !hasPartsAnnexRowContent(rows[rows.length - 1]) && Object.keys(rows[rows.length - 1] || {}).every((key) => knownKeys.has(key))) rows.pop();
  return [...rows, ...imported];
}
