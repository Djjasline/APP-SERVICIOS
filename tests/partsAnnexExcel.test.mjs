import test from "node:test";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import { createPartsAnnexWorkbook, getPartsAnnexExportRows } from "../src/utils/partsAnnexExcel.mjs";

test("exporta un xlsx con texto literal, ceros iniciales y sin filas vacías", () => {
  const rows = [
    { descripcion: "Bomba & válvula", numeroParte: "001234", cantidad: "2" },
    { descripcion: "  ", numeroParte: "", cantidad: "" },
    { descripcion: "=1+1", nParte: "0005", cantidad: 0 },
  ];
  const files = unzipSync(createPartsAnnexWorkbook(rows));
  assert.ok(files["[Content_Types].xml"]);
  assert.ok(files["xl/workbook.xml"]);
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /Bomba &amp; válvula/);
  assert.match(sheet, /<c r="C2" t="inlineStr"><is><t xml:space="preserve">001234<\/t>/);
  assert.match(sheet, /<c r="B3" t="inlineStr"><is><t xml:space="preserve">=1\+1<\/t>/);
  assert.match(sheet, /<c r="D3" t="inlineStr"><is><t xml:space="preserve">0<\/t>/);
  assert.doesNotMatch(sheet, /<f>/);
  assert.equal(getPartsAnnexExportRows(rows).length, 2);
});

test("evita descargar un anexo vacío o con caracteres inválidos", () => {
  assert.throws(() => createPartsAnnexWorkbook([{ descripcion: " " }]), /al menos un ítem/);
  assert.throws(() => createPartsAnnexWorkbook([{ descripcion: "abc\u0000" }]), /caracteres/);
});
