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
