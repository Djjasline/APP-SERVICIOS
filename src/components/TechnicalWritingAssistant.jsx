import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const replacements = [
  ["esta ok", "está operativo"],
  ["esta operativo", "está operativo"],
  ["esta normal", "se verificó funcionamiento normal"],
  ["mas o menos", "requiere verificación adicional"],
  ["tecnico", "técnico"],
  ["tecnica", "técnica"],
  ["accion", "acción"],
  ["conclusion", "conclusión"],
  ["recomendacion", "recomendación"],
  ["hidraulico", "hidráulico"],
  ["hidraulica", "hidráulica"],
  ["electrico", "eléctrico"],
  ["electrica", "eléctrica"],
  ["mecanico", "mecánico"],
  ["mecanica", "mecánica"],
  ["direccion", "dirección"],
  ["descripcion", "descripción"],
  ["observacion", "observación"],
  ["revision", "revisión"],
  ["inspeccion", "inspección"],
  ["camara", "cámara"],
  ["petroleo", "petróleo"],
  ["energia", "energía"],
  ["valvula", "válvula"],
  ["diagnostico", "diagnóstico"],
  ["calibracion", "calibración"],
  ["verificacion", "verificación"],
  ["operacion", "operación"],
  ["medicion", "medición"],
  ["intervencion", "intervención"],
  ["presion", "presión"],
  ["imagenes", "imágenes"],
];

const editableInputTypes = new Set(["text", "search", "email", "tel", "url", "number"]);

function isEditableTextField(element) {
  if (!element) return false;
  if (element instanceof HTMLTextAreaElement) return !element.readOnly && !element.disabled;
  if (element instanceof HTMLInputElement) {
    const type = String(element.type || "text").toLowerCase();
    return editableInputTypes.has(type) && !element.readOnly && !element.disabled;
  }
  return false;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordPattern(source) {
  return new RegExp(`\\b${escapeRegExp(source)}\\b`, "gi");
}

function keepCapitalization(original, replacement) {
  if (!original) return replacement;
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function findSuggestions(text) {
  if (!text || text.trim().length < 3) return [];

  return replacements
    .filter(([source]) => wordPattern(source).test(text))
    .slice(0, 8)
    .map(([source, replacement]) => ({ source, replacement }));
}

function setNativeValue(element, value) {
  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (setter) setter.call(element, value);
  else element.value = value;

  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function replaceInElement(element, suggestions) {
  if (!isEditableTextField(element) || !suggestions.length) return;

  const next = suggestions.reduce((value, suggestion) => {
    return value.replace(wordPattern(suggestion.source), (match) => {
      return keepCapitalization(match, suggestion.replacement);
    });
  }, element.value || "");

  setNativeValue(element, next);
  element.focus();
}

export default function TechnicalWritingAssistant() {
  const { isLight } = useTheme();
  const [activeElement, setActiveElement] = useState(null);
  const [text, setText] = useState("");
  const [dismissedValue, setDismissedValue] = useState("");

  useEffect(() => {
    const updateFromElement = (element) => {
      if (!isEditableTextField(element)) {
        setActiveElement(null);
        setText("");
        return;
      }

      setActiveElement(element);
      setText(element.value || "");
    };

    const handleFocus = (event) => updateFromElement(event.target);
    const handleInput = (event) => updateFromElement(event.target);
    const handleBlur = () => window.setTimeout(() => updateFromElement(document.activeElement), 80);

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("input", handleInput);
    document.addEventListener("focusout", handleBlur);
    updateFromElement(document.activeElement);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("input", handleInput);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);

  const suggestions = useMemo(() => findSuggestions(text), [text]);
  const visible = activeElement && suggestions.length > 0 && dismissedValue !== text;

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[9999] w-[min(92vw,360px)] rounded-2xl border p-4 text-sm shadow-2xl ${
        isLight
          ? "border-blue-200 bg-white text-slate-900"
          : "border-white/15 bg-slate-950 text-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Corrector técnico</p>
          <p className={`mt-1 text-xs ${isLight ? "text-slate-500" : "text-slate-300"}`}>
            Sugerencias locales para mejorar ortografía y redacción técnica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissedValue(text)}
          className={isLight ? "text-slate-400 hover:text-slate-700" : "text-slate-400 hover:text-white"}
          aria-label="Ocultar corrector"
        >
          ×
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={`${suggestion.source}-${suggestion.replacement}`}
            type="button"
            onClick={() => replaceInElement(activeElement, [suggestion])}
            className={`block w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
              isLight
                ? "border-slate-200 hover:bg-blue-50"
                : "border-white/10 hover:bg-white/10"
            }`}
          >
            Cambiar <strong>{suggestion.source}</strong> por <strong>{suggestion.replacement}</strong>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => replaceInElement(activeElement, suggestions)}
        className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
      >
        Aplicar todas las sugerencias
      </button>
    </div>
  );
}
