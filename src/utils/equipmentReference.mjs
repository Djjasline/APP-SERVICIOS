const EMPTY_VALUES = new Set(["", "N/A", "NA", "NO APLICA", "DESCONOCIDO", "SIN DATO", "S/D", "-"]);

export function usefulEquipmentValue(value) {
  const text = String(value ?? "").trim();
  return EMPTY_VALUES.has(text.toUpperCase()) ? "" : text;
}

function normalizeComparable(value) {
  return usefulEquipmentValue(value).toLocaleUpperCase("es").replace(/\s+/g, " ");
}

const CLIENT_COMMON_WORDS = new Set([
  "GAD", "GADM", "GMP", "GOBIERNO", "AUTONOMO", "DESCENTRALIZADO", "MUNICIPAL", "MUNICIPIO",
  "MUNICIPALIDAD", "CANTON", "DEL", "LOS", "LAS", "POR", "PARA", "EMPRESA", "PUBLICA",
  "AGUA", "POTABLE", "ALCANTARILLADO", "SANEAMIENTO", "EMAPA", "EMAPAS", "EP", "DE", "LA",
]);

export function normalizeEquipmentClient(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ")
    .replace(/\bSTA\b/g, "SANTA").replace(/\bSAN BORONDON\b/g, "SAMBORONDON");
}

function similarClientWord(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  // Permit a single character typo, but never guess equivalence for short codes.
  let i = 0, j = 0, differences = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++differences > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return differences + Number(i < a.length || j < b.length) <= 1;
}

// These are suggestions, not verified ownership: the spreadsheet uses aliases.
export function isPossibleEquipmentClient(client, referenceClient) {
  const a = normalizeEquipmentClient(client);
  const b = normalizeEquipmentClient(referenceClient);
  if (!a || !b || a.length < 3 || b.length < 3) return false;
  if (a === b) return true;
  const tokens = (text) => [...new Set(text.split(" ").filter((word) => word.length >= 2 && !CLIENT_COMMON_WORDS.has(word)))];
  const left = tokens(a);
  const right = tokens(b);
  if (!left.length || !right.length) return false;
  const smaller = left.length <= right.length ? left : right;
  const larger = left.length <= right.length ? right : left;
  return smaller.some((word) => word.length >= 4) && smaller.every((word) => larger.some((candidate) => similarClientWord(word, candidate)));
}

// Keep chassis brand separate: the form's MARCA refers to the equipment.
// A value labelled SN in the model column is not assumed to be a model.
export function getEquipmentFormValues(reference, { camera = false, protocol = false } = {}) {
  const model = usefulEquipmentValue(reference?.equipment_model);
  const year = usefulEquipmentValue(reference?.manufacture_year);
  const result = {
    modelo: /^S\s*\/?\s*N(?:\s|[:#-]|$)/i.test(model) ? "" : model,
  };
  if (!protocol) result.anio = /^\d{4}$/.test(year) ? year : "";
  if (!camera && !protocol) result.vin = usefulEquipmentValue(reference?.chassis_vin);
  const serialKey = camera ? "serieModulo" : "serie";
  result[serialKey] = usefulEquipmentValue(reference?.module_serial);
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value));
}

export function mergeEquipmentFormValues(current, proposed) {
  const hasValue = (value) => String(value ?? "").trim() !== "";
  const conflicts = Object.keys(proposed).filter((key) =>
    hasValue(current?.[key]) &&
    normalizeComparable(current[key]) !== normalizeComparable(proposed[key])
  );
  if (conflicts.length) return { values: current, conflicts };
  const values = { ...current };
  for (const [key, value] of Object.entries(proposed)) {
    if (!hasValue(values[key])) values[key] = value;
  }
  return { values, conflicts: [] };
}

export function selectEquipmentReferenceForField(current, reference, fieldName, options) {
  const proposed = getEquipmentFormValues(reference, options);
  if (!proposed[fieldName]) return { values: current, conflicts: [], unavailable: true };
  const result = mergeEquipmentFormValues({ ...current, [fieldName]: "" }, proposed);
  return result.conflicts.length ? { values: current, conflicts: result.conflicts } : result;
}
