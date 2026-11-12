import test from "node:test";
import assert from "node:assert/strict";
import { toSentenceCase } from "../src/utils/sentenceCase.mjs";

test("formatea las descripciones de referencia como oración", () => {
  assert.equal(toSentenceCase("ALMOHADILLA DE DESGASTE INFERIOR DE TOLVA (HOPPER REST PAD)"), "Almohadilla de desgaste inferior de tolva (hopper rest pad)");
  assert.equal(toSentenceCase("  VÁLVULA. REVISAR PRESIÓN! CAMBIAR SELLO"), "  Válvula. Revisar presión! Cambiar sello");
  assert.equal(toSentenceCase(null), "");
});
