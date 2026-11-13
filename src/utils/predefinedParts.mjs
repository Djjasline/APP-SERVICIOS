export function isRemovedPart(code, removed) {
  return Array.isArray(removed) && removed.includes(code);
}

export function visibleParts(items, removed) {
  return items.filter(([code]) => !isRemovedPart(code, removed));
}

export function setPartRemoved(data, code, removed) {
  const previous = Array.isArray(data?.repuestosOcultos) ? data.repuestosOcultos : [];
  const next = removed ? [...new Set([...previous, code])] : previous.filter((item) => item !== code);
  return { ...data, repuestosOcultos: next };
}

export function isBarredoraPartsSection(section) {
  return section?.tipo === "cantidad" && /^[CD]\. REPUESTOS\b/i.test(section?.titulo || "");
}
