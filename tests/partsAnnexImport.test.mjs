import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { createPartsAnnexWorkbook } from "../src/utils/partsAnnexExcel.mjs";
import { appendImportedParts, parsePartsAnnexSheet, readPartsAnnexFile } from "../src/utils/partsAnnexImport.mjs";

function file(bytes, name = "anexo.xlsx") {
  const blob = new Blob([bytes]);
  Object.defineProperty(blob, "name", { value: name });
  return blob;
}

test("lee un archivo exportado sin perder textos, observaciones ni ceros", async () => {
  const rows = [{ cantidad: "6 Ft", numeroParte: "001234", descripcion: "Sello", observaciones: "Revisar" }];
  assert.deepEqual(await readPartsAnnexFile(file(createPartsAnnexWorkbook(rows))), rows);
});

test("lee un Excel con textos compartidos y celdas numéricas como la plantilla", async () => {
  const xml = (content) => strToU8(`<?xml version="1.0" encoding="UTF-8"?>${content}`);
  const files = zipSync({
    "[Content_Types].xml": xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'),
    "xl/workbook.xml": xml('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    "xl/_rels/workbook.xml.rels": xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>'),
    "xl/sharedStrings.xml": xml('<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Quantity Ordered</t></si><si><t>Part Number</t></si><si><t>001234</t></si><si><t>2</t></si></sst>'),
    "xl/worksheets/sheet1.xml": xml('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2"><v>6</v></c><c r="B2" t="s"><v>2</v></c></row><row r="3"><c r="A3" t="s"><v>3</v></c><c r="B3"><v>9007199254740993</v></c></row></sheetData></worksheet>'),
  });
  assert.deepEqual(await readPartsAnnexFile(file(files)), [
    { cantidad: "6", numeroParte: "001234", descripcion: "", observaciones: "" },
    { cantidad: "2", numeroParte: "9007199254740993", descripcion: "", observaciones: "" },
  ]);
});

test("admite encabezados en español y detecta archivos incorrectos", () => {
  assert.deepEqual(parsePartsAnnexSheet([["Ítem", "Cantidad", "N° parte", "Descripción / nombre", "Observaciones"], ["1", "2", "001", "Pieza", "Nota"]]), [{ cantidad: "2", numeroParte: "001", descripcion: "Pieza", observaciones: "Nota" }]);
  assert.throws(() => parsePartsAnnexSheet([["Cliente", "Dirección"], ["Acme", "Centro"]]), /columnas de cantidad/);
  assert.throws(() => parsePartsAnnexSheet([["Cantidad", "Part Number"], [null, null]]), /No se encontraron filas/);
  assert.throws(() => parsePartsAnnexSheet([["Cantidad", "Part Number"], [1, new Date()]]), /fila 2/);
});

test("agrega sin reemplazar filas existentes ni información adicional", () => {
  const rows = [{ descripcion: "A", numeroParte: "01", cantidad: "1", detalleExtra: "conservar" }, { descripcion: "", numeroParte: "", cantidad: "", observaciones: "" }];
  const added = [{ descripcion: "B", numeroParte: "02", cantidad: "2", observaciones: "" }];
  const result = appendImportedParts(rows, added);
  assert.deepEqual(result, [rows[0], added[0]]);
  assert.equal(rows.length, 2);
  const extra = { descripcion: "", detalleExtra: "conservar" };
  assert.deepEqual(appendImportedParts([extra], added), [extra, added[0]]);
});

test("rechaza formatos y tamaños incorrectos sin modificar el anexo", async () => {
  await assert.rejects(readPartsAnnexFile(file(new Uint8Array(), "lista.xls")), /\.xlsx/);
  await assert.rejects(readPartsAnnexFile({ name: "lista.xlsx", size: 6 * 1024 * 1024 }), /5 MB/);
  await assert.rejects(readPartsAnnexFile(file(strToU8("incorrecto"))), /Excel|archivo/i);
});
