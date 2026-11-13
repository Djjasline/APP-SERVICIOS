import { shouldEnableWritingAssistance } from "@/utils/formWritingQuality";

const PROTECTED_FIELDS = /\b(nombre|contacto|inspector|responsable|proveedor|usuario|empresa|search|buscar|busqueda|búsqueda|referencia|destinatario|direccion|dirección)\b/i;
const NARRATIVE_INPUT = /descripci[oó]n|observaci[oó]n|comentario|hallazgo|detalle|actividad|trabajo|conclusi[oó]n|recomendaci[oó]n|motivo|justificaci[oó]n|nota|diagn[oó]stico/i;

export function eligibleSpellField(element, requireText = false) {
  if (!element || element.closest?.("[data-spell-review-ui]") || !shouldEnableWritingAssistance(element) || !element.getClientRects().length || (requireText && !element.value?.trim())) return false;
  const descriptor = [element.name, element.id, element.getAttribute("aria-label"), element.placeholder, element.closest("label")?.textContent].filter(Boolean).join(" ").trim();
  if (PROTECTED_FIELDS.test(descriptor)) return false;
  if (/\bcliente\b/i.test(descriptor) && !NARRATIVE_INPUT.test(descriptor)) return false;
  return element instanceof HTMLTextAreaElement || NARRATIVE_INPUT.test(descriptor);
}

export function setSpellFieldValue(element, value) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}
