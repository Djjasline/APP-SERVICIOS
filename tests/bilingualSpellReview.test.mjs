import test from "node:test";
import assert from "node:assert/strict";
import spanishData from "dictionary-es";
import englishData from "dictionary-en";
import nspell from "nspell";
import { allowTechnicalSpanishSuggestion, createBilingualDictionary } from "../src/utils/bilingualSpellReview.mjs";
import { findCompletedIssueAtCursor, findSpellingIssues } from "../src/utils/spanishSpellReview.mjs";
import { rememberSpelling, withPersonalSpelling } from "../src/utils/personalSpelling.mjs";

const dictionary = createBilingualDictionary(nspell(spanishData), nspell(englishData));

test("acepta inglés, español y texto mixto sin marcar palabras válidas", () => {
  assert.deepEqual(findSpellingIssues("Se revisó el equipo pump y filter.", dictionary), []);
  assert.deepEqual(findSpellingIssues("The pump and the filter were inspected.", dictionary), []);
  assert.equal(dictionary.nativeLanguage("Se revisó el equipo pump y filter"), "mixed");
  assert.equal(dictionary.nativeLanguage("The pump and the filter were inspected"), "en");
  assert.equal(dictionary.nativeLanguage("Se revisó el equipo"), "es");
  assert.equal(dictionary.correct("revision"), true); // Válida en inglés; el contexto puede ser ambiguo.
});

test("detecta errores en ambos idiomas y prioriza sugerencias por contexto", () => {
  const es = "Se revisó el equipo y la valvula.";
  const en = "The pump requires maintenence.";
  assert.equal(dictionary.detectLanguage(es), "es");
  assert.equal(dictionary.detectLanguage(en), "en");
  assert.equal(findSpellingIssues(es, dictionary)[0].word, "valvula");
  assert.equal(findSpellingIssues(en, dictionary)[0].word, "maintenence");
  assert.ok(dictionary.suggest("valvula", es).slice(0, 6).includes("válvula"));
  assert.equal(dictionary.suggest("maintenence", en)[0], "maintenance");
  assert.equal(findCompletedIssueAtCursor("The pumpp ", 10, dictionary).word, "pumpp");
  assert.equal(findCompletedIssueAtCursor("The pump ", 9, dictionary), null);
});

test("el asistente técnico evita corregir inglés como si fuera español", () => {
  assert.equal(allowTechnicalSpanishSuggestion("revision", "The pump revision was completed", dictionary), false);
  assert.equal(allowTechnicalSpanishSuggestion("revision", "revision", dictionary), false);
  assert.equal(allowTechnicalSpanishSuggestion("revision", "Se realizó la revision del equipo", dictionary), true);
});

test("mantiene palabras y correcciones personales con el diccionario bilingüe", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(rememberSpelling("a", "hidrovactor", "hidrovactorr", storage), true);
  const learned = withPersonalSpelling(dictionary, "a", storage);
  assert.equal(learned.correct("hidrovactor"), true);
  assert.equal(learned.correct("pump"), true);
  assert.equal(learned.suggest("hidrovactorr", "Se revisó el equipo")[0], "hidrovactor");
  assert.equal(withPersonalSpelling(dictionary, "b", storage).correct("hidrovactor"), false);
});
