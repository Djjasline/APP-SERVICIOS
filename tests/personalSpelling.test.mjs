import test from "node:test";
import assert from "node:assert/strict";
import { forgetSpelling, readPersonalSpelling, rememberSpelling, withPersonalSpelling } from "../src/utils/personalSpelling.mjs";
import { findSpellingIssues } from "../src/utils/spanishSpellReview.mjs";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

const base = { correct: (word) => word === "correcto", suggest: () => ["otra"] };

test("aprende palabras por cuenta y deja de marcarlas sin alterar el texto", () => {
  const storage = memoryStorage();
  const text = "hidrovactor y Hidrovactor";
  assert.equal(findSpellingIssues(text, withPersonalSpelling(base, "usuario-a", storage)).length, 2);
  assert.equal(rememberSpelling("usuario-a", "Hidrovactor", "", storage), true);
  assert.equal(rememberSpelling("usuario-a", "hidrovactor", "", storage), true);
  assert.deepEqual(readPersonalSpelling("usuario-a", storage).words, ["Hidrovactor"]);
  assert.equal(findSpellingIssues(text, withPersonalSpelling(base, "usuario-a", storage)).length, 0);
  assert.equal(findSpellingIssues(text, withPersonalSpelling(base, "usuario-b", storage)).length, 2);
  assert.equal(withPersonalSpelling(base, "usuario-b", storage).correct("Hidrosuccionador"), true);
});

test("recuerda correcciones como sugerencias y puede olvidarlas", () => {
  const storage = memoryStorage();
  assert.equal(rememberSpelling("a", "hidrovactor", "hidrovactorr", storage), true);
  const learned = withPersonalSpelling(base, "a", storage);
  assert.equal(learned.correct("hidrovactorr"), false);
  assert.equal(learned.suggest("Hidrovactorr")[0], "Hidrovactor");
  assert.equal(forgetSpelling("a", "HIDROVACTOR", storage), true);
  const forgotten = withPersonalSpelling(base, "a", storage);
  assert.equal(forgotten.correct("hidrovactor"), false);
  assert.deepEqual(forgotten.suggest("hidrovactorr"), ["otra"]);
});

test("rechaza frases y soporta almacenamiento corrupto o no disponible", () => {
  const storage = memoryStorage();
  assert.equal(rememberSpelling("a", "dos palabras", "", storage), false);
  assert.deepEqual(readPersonalSpelling("a", { getItem: () => "{" }), { words: [], corrections: {} });
  assert.equal(rememberSpelling("a", "hidrovactor", "", { getItem: () => null, setItem: () => { throw Error("sin espacio"); } }), false);
  assert.equal(withPersonalSpelling(base, "a", null).correct("correcto"), true);
});
