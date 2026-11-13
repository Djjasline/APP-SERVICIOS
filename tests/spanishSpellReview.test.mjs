import test from "node:test";
import assert from "node:assert/strict";
import dictionary from "dictionary-es";
import nspell from "nspell";
import { findCompletedIssueAtCursor, findSpellingIssues, groupSpellingIssues, replaceSpellingIssue } from "../src/utils/spanishSpellReview.mjs";

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

test("agrupa solo palabras iguales ignorando mayúsculas, sin unir errores diferentes", () => {
  const issues = [{ word: "valvula", start: 0 }, { word: "Valvula", start: 20 }, { word: "valbula", start: 40 }];
  const groups = groupSpellingIssues(issues);
  assert.deepEqual(groups.map((group) => group.issues.length), [2, 1]);
  assert.deepEqual(groups[0].issues, issues.slice(0, 2));
});

test("la revisión en línea espera una palabra completa y respeta códigos", () => {
  const text = "Se revisa valvula ";
  assert.equal(findCompletedIssueAtCursor(text, text.length, spell).word, "valvula");
  assert.equal(findCompletedIssueAtCursor("valvula", 7, spell), null);
  assert.equal(findCompletedIssueAtCursor("ABC-123 ", 8, spell), null);
  assert.equal(findCompletedIssueAtCursor("valvula. ", 9, spell).word, "valvula");
  assert.equal(findCompletedIssueAtCursor("valvula ", 999, spell), null);
});
