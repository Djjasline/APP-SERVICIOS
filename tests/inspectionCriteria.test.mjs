import test from "node:test";
import assert from "node:assert/strict";
import { usesNewInspectionCriteria, inspectionDescription } from "../src/app/vehiculos/inspeccion/inspectionCriteria.mjs";

test("criterio de inspección depende de fecha de creación y conserva el anterior si falta", () => {
  assert.equal(usesNewInspectionCriteria("2026-10-31T23:59:59.999Z"), false);
  assert.equal(usesNewInspectionCriteria("2026-11-01T00:00:00Z"), true);
  assert.equal(usesNewInspectionCriteria("2027-01-01T00:00:00Z"), true);
  assert.equal(usesNewInspectionCriteria(null), false);
  assert.equal(usesNewInspectionCriteria("inválida"), false);
});

test("preguntas negativas se reformulan solo para el nuevo criterio", () => {
  const original = "¿Se detectan fugas de aceite en el motor de la banda?";
  assert.equal(inspectionDescription(original, false), original);
  assert.equal(inspectionDescription(original, true), "¿El motor de la banda se encuentra sin fugas de aceite?");
  assert.equal(inspectionDescription("Nivel de aceite", true), "Nivel de aceite");
});
