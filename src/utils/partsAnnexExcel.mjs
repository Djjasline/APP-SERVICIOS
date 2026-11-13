import { zipSync, strToU8 } from "fflate";
import { formatPartsDescription } from "./sentenceCase.mjs";
import { normalizePartsAnnexRows } from "./partsAnnexRows.mjs";

const HEADER = ["ÍTEM", "CANTIDAD", "N° PARTE", "DESCRIPCIÓN / NOMBRE", "OBSERVACIONES"];

function text(value) {
  return String(value ?? "");
}

function xmlText(value) {
  const content = text(value);
  if (content.length > 32767) throw new Error("Una celda supera el límite de 32.767 caracteres de Excel.");
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/.test(content)) throw new Error("El anexo contiene caracteres que Excel no admite.");
  return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function getPartsAnnexExportRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return normalizePartsAnnexRows(rows).map((row) => ({
    descripcion: formatPartsDescription(row?.descripcion),
    numeroParte: text(row?.numeroParte),
    cantidad: text(row?.cantidad),
    observaciones: text(row?.observaciones),
  })).filter((row) => [row.descripcion, row.numeroParte, row.cantidad, row.observaciones].some((value) => value.trim()));
}

export function createPartsAnnexWorkbook(rows) {
  const items = getPartsAnnexExportRows(rows);
  if (!items.length) throw new Error("Agrega al menos un ítem al anexo antes de descargarlo.");
  const table = [HEADER, ...items.map((row, index) => [String(index + 1), row.cantidad, row.numeroParte, row.descripcion, row.observaciones])];
  const sheetRows = table.map((values, index) => {
    const cells = values.map((value, column) => `<c r="${"ABCDE"[column]}${index + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlText(value)}</t></is></c>`).join("");
    return `<row r="${index + 1}">${cells}</row>`;
  }).join("");
  const xml = (content) => strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${content}`);
  return zipSync({
    "[Content_Types].xml": xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
    "_rels/.rels": xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    "xl/workbook.xml": xml('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Anexo de ítems" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    "xl/_rels/workbook.xml.rels": xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    "xl/worksheets/sheet1.xml": xml(`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="10" customWidth="1"/><col min="2" max="2" width="15" customWidth="1"/><col min="3" max="3" width="24" customWidth="1"/><col min="4" max="4" width="55" customWidth="1"/><col min="5" max="5" width="45" customWidth="1"/></cols><sheetData>${sheetRows}</sheetData></worksheet>`),
  });
}

export function downloadPartsAnnexWorkbook(rows) {
  const bytes = createPartsAnnexWorkbook(rows);
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "anexo-de-items.xlsx";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
