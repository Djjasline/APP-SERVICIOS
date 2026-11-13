import test from "node:test";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import { createPartsAnnexWorkbook, getPartsAnnexExportRows } from "../src/utils/partsAnnexExcel.mjs";

test("exporta un xlsx con texto literal, ceros iniciales y sin filas vacías", () => {
  const rows = [
    { descripcion: "Bomba & válvula", numeroParte: "001234", cantidad: "2", observaciones: "Urgente & revisar" },
    { descripcion: "  ", numeroParte: "", cantidad: "" },
    { descripcion: "=1+1", nParte: "0005", cantidad: 0 },
  ];
  const files = unzipSync(createPartsAnnexWorkbook(rows));
  assert.ok(files["[Content_Types].xml"]);
  assert.ok(files["xl/workbook.xml"]);
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /Bomba &amp; válvula/);
  assert.match(sheet, /<c r="C2" t="inlineStr"><is><t xml:space="preserve">001234<\/t>/);
  assert.match(sheet, /<c r="B2" t="inlineStr"><is><t xml:space="preserve">2<\/t>/);
  assert.match(sheet, /<c r="D3" t="inlineStr"><is><t xml:space="preserve">=1\+1<\/t>/);
  assert.match(sheet, /<c r="B3" t="inlineStr"><is><t xml:space="preserve">0<\/t>/);
  assert.match(sheet, /<c r="E2" t="inlineStr"><is><t xml:space="preserve">Urgente &amp; revisar<\/t>/);
  assert.match(sheet, /<c r="A1"[^>]*>.*?ÍTEM.*?<c r="B1"[^>]*>.*?CANTIDAD.*?<c r="C1"[^>]*>.*?N° PARTE.*?<c r="D1"[^>]*>.*?DESCRIPCIÓN \/ NOMBRE.*?<c r="E1"[^>]*>.*?OBSERVACIONES/);
  assert.doesNotMatch(sheet, /<f>/);
  assert.equal(getPartsAnnexExportRows(rows).length, 2);
});

test("exporta filas solo con observaciones y números de parte históricos", () => {
  const rows = [{ observaciones: "Revisar" }, { numeroParte: "", nParte: "0005", observacion: "Anterior" }];
  const sheet = strFromU8(unzipSync(createPartsAnnexWorkbook(rows))["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /<c r="E2"[^>]*>.*?Revisar/);
  assert.match(sheet, /<c r="C3"[^>]*>.*?0005/);
  assert.match(sheet, /<c r="E3"[^>]*>.*?Anterior/);
});

test("evita descargar un anexo vacío o con caracteres inválidos", () => {
  assert.throws(() => createPartsAnnexWorkbook([{ descripcion: " " }]), /al menos un ítem/);
  assert.throws(() => createPartsAnnexWorkbook([{ descripcion: "abc\u0000" }]), /caracteres/);
});

test("exporta descripciones históricas en tipo oración sin modificar el origen ni el número de parte", () => {
  const rows = [{ descripcion: "SELLO DE GRASA (GREASE SEAL)", numeroParte: "AB-001", cantidad: "1" }];
  const files = unzipSync(createPartsAnnexWorkbook(rows));
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /Sello de grasa \(grease seal\)/);
  assert.match(sheet, /AB-001/);
  assert.equal(rows[0].descripcion, "SELLO DE GRASA (GREASE SEAL)");
});
