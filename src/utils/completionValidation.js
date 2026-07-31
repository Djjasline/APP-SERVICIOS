export function hasCompletionValue(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasCompletionValue);
  return Boolean(value);
}

export function ensureCompletionReady({ estado, requiredFields = [], title = "registro" }) {
  if (estado !== "completado") return true;

  const missing = requiredFields
    .filter((field) => !hasCompletionValue(field.value))
    .map((field) => field.label);

  if (missing.length === 0) return true;

  alert(
    `Para completar este ${title} faltan datos críticos:\n- ${missing.join("\n- ")}\n\nPuedes guardarlo como borrador y completarlo cuando tengas esos datos.`
  );
  return false;
}
