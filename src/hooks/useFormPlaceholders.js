import { useEffect } from "react";

const EXCLUDED_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const PLACEHOLDER_EXAMPLES = [
  [/referencia.*contrato|contrato/, "Ej: Contrato marco / cliente"],
  [/pedido|demanda/, "Ej: P-23-046 o D-45821"],
  [/codigo.*informe|cod.*inf|informe/, "Ej: P-23-046-001 o D-45821-001"],
  [/descripcion/, "Ej: Servicio técnico, inspección o mantenimiento realizado"],
  [/cliente|empresa/, "Ej: Empresa / cliente solicitante"],
  [/direccion/, "Ej: Ciudad, sector, calle principal"],
  [/contacto/, "Ej: Nombre de la persona de contacto"],
  [/telefono.*tecnico/, "Se completa automáticamente al seleccionar técnico"],
  [/correo.*tecnico/, "Se completa automáticamente al seleccionar técnico"],
  [/telefono|celular/, "Ej: 0991234567"],
  [/correo|email/, "Ej: nombre@empresa.com"],
  [/tecnico.*responsable|tecnico/, "Seleccione o ingrese el técnico responsable"],
  [/fecha/, "dd/mm/aaaa"],
  [/marca/, "Ej: Caterpillar, Ford, Volvo"],
  [/modelo/, "Ej: Modelo del equipo"],
  [/serie|serial/, "Ej: Número de serie"],
  [/anio|año/, "Ej: 2024"],
  [/vin|chasis/, "Ej: VIN o número de chasis"],
  [/placa/, "Ej: ABC-1234"],
  [/kilometraje|km/, "Ej: 125000"],
  [/horometro|horas/, "Ej: 4500"],
  [/cantidad/, "Ej: 1"],
  [/estado/, "Ej: Bueno / Regular / Malo"],
  [/observacion|observaciones|novedad/, "Escriba observaciones o novedades relevantes"],
  [/conclusion|conclusiones/, "Escriba la conclusión del servicio"],
  [/recomendacion|recomendaciones/, "Escriba recomendaciones para el cliente"],
  [/actividad|detalle|trabajo/, "Describa la actividad realizada"],
  [/cedula|identificacion/, "Ej: 0102030405"],
  [/firma/, "Nombre de quien firma"],
];

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[№°#]/g, "numero")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function readableText(value = "") {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function associatedLabelText(field) {
  const directLabel = field.closest("label");
  if (directLabel?.textContent) return directLabel.textContent;

  if (field.id) {
    const escapedId = window.CSS?.escape ? window.CSS.escape(field.id) : field.id;
    const label = document.querySelector(`label[for="${escapedId}"]`);
    if (label?.textContent) return label.textContent;
  }

  const tableCell = field.closest("td, th");
  const previousCell = tableCell?.previousElementSibling;
  if (previousCell?.textContent) return previousCell.textContent;

  const container = field.closest("div, section, article");
  const label = container?.querySelector("label");
  if (label?.textContent) return label.textContent;

  return field.getAttribute("aria-label") || field.name || field.id || "";
}

function inferPlaceholder(field) {
  const type = field.getAttribute("type") || field.tagName.toLowerCase();
  const label = readableText(associatedLabelText(field));
  const key = normalizeText(`${label} ${field.name || ""} ${field.id || ""}`);

  for (const [pattern, example] of PLACEHOLDER_EXAMPLES) {
    if (pattern.test(key)) return example;
  }

  if (field.readOnly || field.disabled) return "Se completa automáticamente";
  if (type === "number") return "Ej: 0";
  if (field.tagName === "TEXTAREA") return "Escriba la información correspondiente";
  if (label) return `Ej: ${label}`;

  return "Ingrese la información";
}

function shouldApplyPlaceholder(field) {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return false;
  }

  if (field.placeholder?.trim()) return false;
  if (field.dataset.autoPlaceholder === "false") return false;

  const type = (field.getAttribute("type") || "text").toLowerCase();
  return !EXCLUDED_INPUT_TYPES.has(type);
}

function applyPlaceholders(root = document) {
  root.querySelectorAll?.("input, textarea").forEach((field) => {
    if (!shouldApplyPlaceholder(field)) return;

    const placeholder = inferPlaceholder(field);
    field.placeholder = placeholder;
    field.title ||= placeholder;
  });
}

export function useFormPlaceholders() {
  useEffect(() => {
    applyPlaceholders();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches("input, textarea")) {
              applyPlaceholders({ querySelectorAll: () => [node] });
            } else {
              applyPlaceholders(node);
            }
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const handleFocus = (event) => {
      if (event.target instanceof HTMLElement) {
        applyPlaceholders({ querySelectorAll: () => [event.target] });
      }
    };

    document.addEventListener("focusin", handleFocus);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFocus);
    };
  }, []);
}
