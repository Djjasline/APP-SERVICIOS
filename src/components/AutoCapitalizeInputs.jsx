import { useEffect } from "react";

const SKIP_TYPES = new Set([
  "email",
  "password",
  "url",
  "tel",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "file",
]);

const SKIP_KEYWORDS = [
  "cod",
  "codigo",
  "código",
  "email",
  "correo",
  "url",
  "link",
  "password",
  "contraseña",
  "telefono",
  "teléfono",
  "phone",
  "serial",
  "serie",
  "vin",
];

function shouldSkip(element) {
  if (!element || element.dataset?.noAutocapitalize === "true") return true;
  if (element.tagName !== "INPUT" && element.tagName !== "TEXTAREA") return true;

  const type = String(element.getAttribute("type") || "text").toLowerCase();
  if (SKIP_TYPES.has(type)) return true;

  const descriptor = [
    element.name,
    element.id,
    element.getAttribute("aria-label"),
    element.getAttribute("placeholder"),
    element.getAttribute("autocomplete"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return SKIP_KEYWORDS.some((keyword) => descriptor.includes(keyword));
}

function capitalizeFirstLine(value) {
  const text = String(value || "");
  const lineBreakIndex = text.search(/\r|\n/);
  const firstLineEnd = lineBreakIndex === -1 ? text.length : lineBreakIndex;
  const firstLine = text.slice(0, firstLineEnd);
  const match = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.exec(firstLine);

  if (!match) return text;

  const index = match.index;
  const upper = text[index].toLocaleUpperCase("es-EC");
  if (text[index] === upper) return text;

  return `${text.slice(0, index)}${upper}${text.slice(index + 1)}`;
}

export default function AutoCapitalizeInputs() {
  useEffect(() => {
    const handleInput = (event) => {
      const element = event.target;
      if (shouldSkip(element)) return;

      const currentValue = element.value;
      const nextValue = capitalizeFirstLine(currentValue);
      if (nextValue === currentValue) return;

      const selectionStart = element.selectionStart;
      const selectionEnd = element.selectionEnd;
      element.value = nextValue;

      if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
        element.setSelectionRange(selectionStart, selectionEnd);
      }
    };

    document.addEventListener("input", handleInput, true);
    return () => document.removeEventListener("input", handleInput, true);
  }, []);

  return null;
}
