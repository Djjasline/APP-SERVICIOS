import test from "node:test";
import assert from "node:assert/strict";
import { formatPartsDescription, toSentenceCase } from "../src/utils/sentenceCase.mjs";

test("formatea las descripciones de referencia como oración", () => {
  assert.equal(toSentenceCase("ALMOHADILLA DE DESGASTE INFERIOR DE TOLVA (HOPPER REST PAD)"), "Almohadilla de desgaste inferior de tolva (hopper rest pad)");
  assert.equal(toSentenceCase("  VÁLVULA. REVISAR PRESIÓN! CAMBIAR SELLO"), "  Válvula. Revisar presión! Cambiar sello");
  assert.equal(toSentenceCase(null), "");
});

test("presenta anexos antiguos en mayúsculas sin alterar descripciones mixtas", () => {
  assert.equal(formatPartsDescription("ALMOHADILLA DE DESGASTE INFERIOR DE TOLVA (HOPPER REST PAD)"), "Almohadilla de desgaste inferior de tolva (hopper rest pad)");
  assert.equal(formatPartsDescription("SELLO DE GRASA (GREASE SEAL)"), "Sello de grasa (grease seal)");
  assert.equal(formatPartsDescription("Filtro para motor CAT C7"), "Filtro para motor CAT C7");
  assert.equal(formatPartsDescription("123-045"), "123-045");
});
