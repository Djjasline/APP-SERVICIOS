import { zipSync, strToU8 } from "fflate";
import { formatPartsDescription } from "./sentenceCase.mjs";
import { normalizePartsAnnexRows } from "./partsAnnexRows.mjs";

const HEADER = [
  "Quantity Ordered", "Part Number", "Description", "List Price",
  "Dlr Net Price", "Is Kit", "Service Note", "Unit Of Measure",
  "Qty Available", "Dlr Net Ext Price", "Stock Type", "Unit Weight",
  "Wt Unit Of Measure", "Extended Weight", "Leadtime Estimate", "Item Type",
];

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
  const table = [HEADER, ...items.map((row) => [
    row.cantidad, row.numeroParte, row.descripcion, "", "", "", row.observaciones,
    "", "", "", "", "", "", "", "", "",
  ])];
  const sheetRows = table.map((values, index) => {
    const cells = values.map((value, column) => `<c r="${"ABCDEFGHIJKLMNOP"[column]}${index + 1}"${index === 0 ? ' s="1"' : ""} t="inlineStr"><is><t xml:space="preserve">${xmlText(value)}</t></is></c>`).join("");
    return `<row r="${index + 1}">${cells}</row>`;
  }).join("");
  const xml = (content) => strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${content}`);
  return zipSync({
    "[Content_Types].xml": xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'),
    "_rels/.rels": xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    "xl/workbook.xml": xml('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    "xl/_rels/workbook.xml.rels": xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'),
    "xl/styles.xml": xml('<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>'),
    "xl/worksheets/sheet1.xml": xml(`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`),
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
