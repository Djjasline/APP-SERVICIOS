export function toSentenceCase(value) {
  return String(value ?? "")
    .toLocaleLowerCase("es")
    .replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, prefix, letter) => prefix + letter.toLocaleUpperCase("es"));
}
