export function toSentenceCase(value) {
  return String(value ?? "")
    .toLocaleLowerCase("es")
    .replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, prefix, letter) => prefix + letter.toLocaleUpperCase("es"));
}

// Los anexos anteriores no guardan el origen de cada fila. Solo transformar
// descripciones completamente en mayúsculas y conservar las ya redactadas.
export function formatPartsDescription(value) {
  const description = String(value ?? "");
  return /\p{Lu}/u.test(description) && !/\p{Ll}/u.test(description)
    ? toSentenceCase(description)
    : description;
}
