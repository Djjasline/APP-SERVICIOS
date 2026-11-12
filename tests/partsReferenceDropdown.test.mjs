import test from "node:test";
import assert from "node:assert/strict";
import { isReferenceInteraction, showReferenceDropdown } from "../src/utils/partsReferenceDropdown.mjs";

test("el cuadro se oculta al terminar una búsqueda sin coincidencias", () => {
  assert.equal(showReferenceDropdown({ matches: [], loading: false, error: "", showHint: false }), false);
  assert.equal(showReferenceDropdown({ matches: [{}], loading: false, error: "", showHint: false }), true);
  assert.equal(showReferenceDropdown({ matches: [], loading: true, error: "", showHint: false }), true);
  assert.equal(showReferenceDropdown({ matches: [], loading: false, error: "Error de consulta", showHint: false }), true);
});

test("solo se mantienen las sugerencias al interactuar con descripción, resultados o número de parte", () => {
  const description = { contains: (target) => target === "descripcion" || target === "resultado" };
  const partNumber = { contains: (target) => target === "numero" };
  for (const target of ["descripcion", "resultado", "numero"]) assert.equal(isReferenceInteraction(target, description, partNumber), true);
  assert.equal(isReferenceInteraction("fuera", description, partNumber), false);
  assert.equal(isReferenceInteraction("fuera", null, null), false);
});
