export function parseTableText(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("\t").map((cell) => cell.trim()));
}

export function listToText(items) {
  return (items || []).join("\n");
}

export function textToList(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
