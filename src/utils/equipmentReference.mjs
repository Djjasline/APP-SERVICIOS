const EMPTY_VALUES = new Set(["", "N/A", "NA", "NO APLICA", "DESCONOCIDO", "SIN DATO", "S/D", "-"]);

export function usefulEquipmentValue(value) {
  const text = String(value ?? "").trim();
  return EMPTY_VALUES.has(text.toUpperCase()) ? "" : text;
}

function normalizeComparable(value) {
  return usefulEquipmentValue(value).toLocaleUpperCase("es").replace(/\s+/g, " ");
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
