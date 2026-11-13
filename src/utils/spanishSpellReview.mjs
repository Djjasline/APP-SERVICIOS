const WORDS = /[\p{L}\p{M}]+/gu;

export function findSpellingIssues(text, dictionary, limit = 200) {
  const issues = [];
  for (const match of String(text || "").matchAll(WORDS)) {
    const word = match[0];
    const start = match.index;
    const before = text[start - 1] || "";
    const after = text[start + word.length] || "";
    // Identificadores, URL, rutas, abreviaturas y números de pieza no se revisan.
    const insideDottedToken = (before === "." && /[\p{L}\p{N}]/u.test(text[start - 2] || "")) || (after === "." && /[\p{L}\p{N}]/u.test(text[start + word.length + 1] || ""));
    if (word.length < 3 || word.length > 32 || word === word.toLocaleUpperCase("es") || (/^https?$/i.test(word) && text.slice(start + word.length, start + word.length + 3) === "://") || insideDottedToken || /[\p{N}_@/+\-]/u.test(before) || /[\p{N}_@/+\-]/u.test(after)) continue;
    if (!dictionary.correct(word)) {
      issues.push({ word, start, end: start + word.length });
      if (issues.length >= limit) break;
    }
  }
  return issues;
}

export function replaceSpellingIssue(value, issue, replacement) {
  if (typeof value !== "string" || value.slice(issue.start, issue.end) !== issue.word) return null;
  return value.slice(0, issue.start) + replacement + value.slice(issue.end);
}

export function groupSpellingIssues(issues) {
  const groups = new Map();
  for (const issue of issues) {
    const key = issue.word.normalize("NFC").toLocaleLowerCase("es");
    if (!groups.has(key)) groups.set(key, { key, word: issue.word, issues: [] });
    groups.get(key).issues.push(issue);
  }
  return Array.from(groups.values());
}

export function findCompletedIssueAtCursor(text, cursor, dictionary) {
  if (typeof text !== "string" || !Number.isInteger(cursor) || cursor < 0 || cursor > text.length) return null;
  // Esperar hasta terminar la palabra evita sugerencias mientras se está escribiendo.
  if (/[\p{L}\p{M}\p{N}_]/u.test(text[cursor - 1] || "") || /[\p{L}\p{M}\p{N}_]/u.test(text[cursor] || "")) return null;
  const start = Math.max(0, cursor - 400);
  const fragment = text.slice(start, cursor);
  const issues = findSpellingIssues(fragment, dictionary);
  const issue = issues[issues.length - 1];
  if (!issue || !/^[\s.,;:!?¿¡]*$/u.test(fragment.slice(issue.end))) return null;
  return { ...issue, start: issue.start + start, end: issue.end + start };
}
