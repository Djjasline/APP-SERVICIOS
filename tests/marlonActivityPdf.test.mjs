import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pairActivityImages, useMarlonActivityLayout } from "../src/app/vehiculos/informe/activityPdfLayout.mjs";

test("el formato horizontal se limita a informes de servicio de Marlon", () => {
  assert.equal(useMarlonActivityLayout("informe", "  Marlon   Guevara "), true);
  assert.equal(useMarlonActivityLayout("capacitacion", "MARLON GUEVARA"), false);
  assert.equal(useMarlonActivityLayout("informe", "Otro técnico"), false);
  assert.equal(useMarlonActivityLayout("informe", ""), false);
});

test("agrupa fotografías de dos en dos sin perder orden ni descripciones", () => {
  const images = ["uno", "dos", "tres", "cuatro", "cinco"];
  const captions = ["pie 1", "pie 2", "pie 3", "pie 4", "pie 5"];
  const pairs = pairActivityImages(images, captions);
  assert.deepEqual(pairs.map((pair) => pair.length), [2, 2, 1]);
  assert.deepEqual(pairs.flat().map(({ src }) => src), images);
  assert.deepEqual(pairs.flat().map(({ description }) => description), captions);
  assert.deepEqual(pairActivityImages(undefined, captions), []);
  assert.equal(pairActivityImages(["foto"], [])[0][0].description, "");
});

test("el PDF conserva texto, tablas e imágenes debajo del trabajo correspondiente", () => {
  const source = readFileSync(new URL("../src/app/vehiculos/informe/InformePDF.jsx", import.meta.url), "utf8");
  const section = source.slice(source.indexOf("export function MarlonActivitiesPdf"), source.indexOf("const operationalStatusLabels"));
  assert.match(section, /<th style=\{S\.th\}>ÍTEM<\/th>/);
  assert.match(section, /<th style=\{S\.th\}>TRABAJO \/ HALLAZGO<\/th>/);
  assert.match(section, /activity\.titulo[\s\S]*activity\.detalle[\s\S]*ActivityContractItemsTablePdf[\s\S]*pairActivityImages/);
  assert.match(section, /colSpan=\{2\}/);
  assert.match(section, /<td colSpan=\{2\}[\s\S]*pairActivityImages\(activity\.imagenes, activity\.descripcionesImagenes\)\.map[\s\S]*<\/td>/);
  assert.doesNotMatch(section, /pairActivityImages\(activity\.imagenes, activity\.descripcionesImagenes\)\.map\([\s\S]*?<tr/);
  assert.match(section, /MarlonActivityImagePair pair=\{pair\}/);
  assert.match(source, /naturalWidth \/ naturalHeight/);
  assert.match(source, /flex: `\$\{imageRatios\[index\]\} 1 0%`/);
  assert.match(source, /width: "100%", height: "auto", display: "block"/);
  assert.match(source, /useMarlonActivityLayout\(reportType, data\.tecnicoNombre\)/);
});
