import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { usesNewInspectionCriteria, inspectionDescription } from "../src/app/vehiculos/inspeccion/inspectionCriteria.mjs";

test("criterio de inspección depende de fecha de creación y conserva el anterior si falta", () => {
  assert.equal(usesNewInspectionCriteria("2026-10-31T23:59:59.999Z"), false);
  assert.equal(usesNewInspectionCriteria("2026-11-01T00:00:00Z"), true);
  assert.equal(usesNewInspectionCriteria("2027-01-01T00:00:00Z"), true);
  assert.equal(usesNewInspectionCriteria(null), false);
  assert.equal(usesNewInspectionCriteria("inválida"), false);
});

test("giro de observaciones se habilita solo en inspección Pelican", () => {
  const form = readFileSync(new URL("../src/app/vehiculos/inspeccion/HojaInspeccionBarredora.jsx", import.meta.url), "utf8");
  const row = readFileSync(new URL("../src/components/InspectionChecklistRow.jsx", import.meta.url), "utf8");
  const field = readFileSync(new URL("../src/components/ObservationImageField.jsx", import.meta.url), "utf8");
  assert.equal((form.match(/allowObservationRotation=\{variant === "pelican"\}/g) || []).length, 3);
  assert.match(row, /allowRotation=\{allowObservationRotation\}/);
  assert.match(field, /allowRotation = false/);
  assert.match(field, /sanitizeFolder\(folder\),\s*\{ allowRotation \}/);
});

test("cada revisión pregunta por novedades solo para el nuevo criterio", () => {
  const original = "¿Se detectan fugas de aceite en el motor de la banda?";
  assert.equal(inspectionDescription(original, false), original);
  assert.equal(inspectionDescription(original, true), "¿Existe alguna novedad al revisar lo siguiente: El motor de la banda se encuentra sin fugas de aceite?");
  assert.equal(inspectionDescription("Nivel de aceite", true), "¿Existe alguna novedad al revisar lo siguiente: Nivel de aceite?");
});
