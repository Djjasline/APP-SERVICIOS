import test from "node:test";
import assert from "node:assert/strict";
import dictionary from "dictionary-es";
import nspell from "nspell";
import { findSpellingIssues, replaceSpellingIssue } from "../src/utils/spanishSpellReview.mjs";

const spell = nspell(dictionary);

test("detecta errores con diccionario español y acepta una sugerencia", () => {
  const text = "Mantenimiento de valvula.";
  const [issue] = findSpellingIssues(text, spell);
  assert.equal(issue.word, "valvula");
  assert.ok(spell.suggest(issue.word).includes("válvula"));
  assert.equal(replaceSpellingIssue(text, issue, "válvula"), "Mantenimiento de válvula.");
  assert.equal(replaceSpellingIssue("Otro contenido", issue, "válvula"), null);
});

test("omite identificadores, mayúsculas, números y direcciones", () => {
  const text = "ABC-123 XZY99 user@example.com https://example.org/archivo.doc";
  assert.deepEqual(findSpellingIssues(text, spell), []);
});

test("respeta el límite y no interpreta puntuación final como identificador", () => {
  const issues = findSpellingIssues("valvula. valvula.", spell, 1);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].word, "valvula");
});
