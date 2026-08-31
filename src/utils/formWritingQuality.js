const WRITABLE_INPUT_TYPES = new Set(["text", "search"]);

const SKIP_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "email",
  "file",
  "hidden",
  "image",
  "month",
  "number",
  "password",
  "radio",
  "range",
  "reset",
  "submit",
  "tel",
  "time",
  "url",
  "week",
]);

const TECHNICAL_FIELD_KEYWORDS = [
  "anio",
  "año",
  "cantidad",
  "cedula",
  "cédula",
  "chasis",
  "cod",
  "codigo",
  "código",
  "correo",
  "email",
  "horas",
  "horometro",
  "horómetro",
  "identificacion",
  "identificación",
  "iva",
  "kilometraje",
  "km",
  "link",
  "marca",
  "matricula",
  "matrícula",
  "modelo",
  "numero",
  "número",
  "password",
  "placa",
  "precio",
  "ruc",
  "serie",
  "serial",
  "subtotal",
  "telefono",
  "teléfono",
  "total",
  "url",
  "valor",
  "vin",
];

function getFieldDescriptor(element) {
  return [
    element?.name,
    element?.id,
    element?.getAttribute?.("aria-label"),
    element?.getAttribute?.("placeholder"),
    element?.getAttribute?.("autocomplete"),
    element?.closest?.("td, th, label")?.textContent,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isTechnicalField(element) {
  const descriptor = getFieldDescriptor(element);
  return TECHNICAL_FIELD_KEYWORDS.some((keyword) => descriptor.includes(keyword));
}

export function shouldEnableWritingAssistance(element) {
  if (!element || element.dataset?.noWritingAssist === "true") return false;
  if (element.readOnly || element.disabled) return false;

  if (element instanceof HTMLTextAreaElement) {
    return !isTechnicalField(element);
  }

  if (element instanceof HTMLInputElement) {
    const type = String(element.getAttribute("type") || "text").toLowerCase();
    if (SKIP_INPUT_TYPES.has(type) || !WRITABLE_INPUT_TYPES.has(type)) return false;
    return !isTechnicalField(element);
  }

  return false;
}

export function applyWritingQualityToField(element) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;

  const enabled = shouldEnableWritingAssistance(element);
  element.setAttribute("spellcheck", enabled ? "true" : "false");
  element.setAttribute("autocorrect", enabled ? "on" : "off");
  element.setAttribute("autocapitalize", enabled ? "sentences" : "none");

  if (enabled && !element.getAttribute("lang")) {
    element.setAttribute("lang", "es-EC");
  }
}

export function applyWritingQuality(root = document) {
  root.querySelectorAll?.("input, textarea").forEach(applyWritingQualityToField);
}
