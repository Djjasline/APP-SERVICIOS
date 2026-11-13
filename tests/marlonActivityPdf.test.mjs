import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { layoutActivityImages, useMarlonActivityLayout } from "../src/app/vehiculos/informe/activityPdfLayout.mjs";

test("el formato horizontal se limita a informes de servicio de Marlon", () => {
  assert.equal(useMarlonActivityLayout("informe", "  Marlon   Guevara "), true);
  assert.equal(useMarlonActivityLayout("capacitacion", "MARLON GUEVARA"), false);
  assert.equal(useMarlonActivityLayout("informe", "Otro técnico"), false);
  assert.equal(useMarlonActivityLayout("informe", ""), false);
});

test("agrupa imágenes según su proporción sin perder orden ni descripciones", () => {
  const images = ["uno", "dos", "tres", "cuatro", "cinco"];
  const captions = ["pie 1", "pie 2", "pie 3", "pie 4", "pie 5"];
  const rows = layoutActivityImages(images, captions, { uno: 0.5, dos: 0.5, tres: 0.5, cuatro: 2, cinco: 2 });
  assert.deepEqual(rows.map((row) => row.length), [4, 1]);
  assert.deepEqual(rows.flat().map(({ src }) => src), images);
  assert.deepEqual(rows.flat().map(({ description }) => description), captions);
  assert.deepEqual(layoutActivityImages(undefined, captions), []);
  assert.equal(layoutActivityImages(["foto"], [], { foto: 0 })[0][0].ratio, 1);
  assert.equal(layoutActivityImages(["foto"], [])[0][0].description, "");
  assert.deepEqual(layoutActivityImages(Array(7).fill("vertical"), [], { vertical: 0.4 }).map((row) => row.length), [6, 1]);
});

test("el PDF conserva texto, tablas e imágenes debajo del trabajo correspondiente", () => {
  const source = readFileSync(new URL("../src/app/vehiculos/informe/InformePDF.jsx", import.meta.url), "utf8");
  const section = source.slice(source.indexOf("export function MarlonActivitiesPdf"), source.indexOf("const operationalStatusLabels"));
  assert.match(section, /<th style=\{S\.th\}>ÍTEM<\/th>/);
  assert.match(section, /<th style=\{S\.th\}>TRABAJO \/ HALLAZGO<\/th>/);
  assert.match(section, /activity\.titulo[\s\S]*activity\.detalle[\s\S]*ActivityContractItemsTablePdf[\s\S]*MarlonActivityImages/);
  assert.match(section, /colSpan=\{2\}/);
  assert.match(section, /<td colSpan=\{2\}[\s\S]*<MarlonActivityImages activity=\{activity\}[\s\S]*<\/td>/);
  assert.match(source, /naturalWidth \/ naturalHeight/);
  assert.match(source, /flex: `\$\{image\.ratio\} 1 0%`/);
  assert.match(source, /width: "100%", height: "auto", display: "block"/);
  assert.match(source, /useMarlonActivityLayout\(reportType, data\.tecnicoNombre\)/);
});
