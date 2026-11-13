import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { eligibleSpellField, setSpellFieldValue } from "@/utils/spellReviewFields";
import { findCompletedIssueAtCursor, replaceSpellingIssue } from "@/utils/spanishSpellReview.mjs";
import { rememberSpelling } from "@/utils/personalSpelling.mjs";
import { useAuth } from "@/context/AuthContext";

function positionFor(element) {
  const rect = element.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 24);
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
  return rect.top >= 130 ? { left, bottom: window.innerHeight - rect.top + 6, width } : { left, top: Math.max(12, Math.min(window.innerHeight - 100, rect.bottom + 6)), width };
}

export default function InlineSpellAssistant() {
  const scope = useAuth()?.user?.id || "public";
  const [result, setResult] = useState(null);
  const [saveError, setSaveError] = useState("");
  const timer = useRef(null);
  const generation = useRef(0);

  useEffect(() => {
    const clear = () => { clearTimeout(timer.current); generation.current += 1; setResult(null); setSaveError(""); };
    const onInput = (event) => {
      const field = event.target;
      clear();
      if (event.isComposing || !eligibleSpellField(field, true)) return;
      const value = field.value;
      const cursor = field.selectionStart;
      if (!Number.isInteger(cursor)) return;
      const current = generation.current;
      timer.current = window.setTimeout(async () => {
        try {
          const { getSpanishDictionary } = await import("@/utils/spanishDictionary");
          if (generation.current !== current || document.activeElement !== field || field.value !== value || field.selectionStart !== cursor || !eligibleSpellField(field, true)) return;
          const dictionary = getSpanishDictionary(scope);
          const nativeLanguage = dictionary.nativeLanguage(value);
          field.dataset.bilingualNativeSpellcheck = nativeLanguage;
          if (field.dataset.writingLangManaged === "true") field.setAttribute("lang", nativeLanguage === "en" ? "en-US" : "es-EC");
          field.setAttribute("spellcheck", nativeLanguage === "mixed" ? "false" : "true");
          field.setAttribute("autocorrect", nativeLanguage === "mixed" ? "off" : "on");
          const issue = findCompletedIssueAtCursor(value, cursor, dictionary);
          if (!issue) return;
          const context = value.slice(Math.max(0, issue.start - 150), issue.end + 150);
          setResult({ field, value, cursor, issue, suggestions: dictionary.suggest(issue.word, context).slice(0, 4), position: positionFor(field) });
        } catch {
          // La escritura y el guardado siguen funcionando si el diccionario no carga.
        }
      }, 700);
    };
    const onFocus = (event) => { if (!event.target.closest?.("[data-inline-spell-ui]")) clear(); };
    const onKey = (event) => { if (event.key === "Escape") clear(); };
    const onScroll = () => setResult((current) => current && current.field.isConnected && eligibleSpellField(current.field, true) ? { ...current, position: positionFor(current.field) } : null);
    document.addEventListener("input", onInput);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(timer.current);
      generation.current += 1;
      document.removeEventListener("input", onInput);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [scope]);

  if (!result) return null;
  const apply = (replacement) => {
    const { field, value, cursor, issue } = result;
    if (!field.isConnected || !eligibleSpellField(field, true) || field.value !== value) { setResult(null); return; }
    const next = replaceSpellingIssue(value, issue, replacement);
    if (next === null) { setResult(null); return; }
    setSpellFieldValue(field, next);
    field.focus();
    const position = cursor + replacement.length - issue.word.length;
    field.setSelectionRange(position, position);
    setResult(null);
  };
  const remember = () => {
    if (rememberSpelling(scope, result.issue.word)) {
      setResult({ ...result, saved: true });
      window.setTimeout(() => setResult((current) => current?.saved ? null : current), 2500);
    } else {
      setSaveError("No se pudo guardar la palabra en este dispositivo.");
    }
  };

  return createPortal(<div data-inline-spell-ui data-spell-review-ui role="status" className="fixed z-[9998] rounded-lg border border-blue-200 bg-white p-2 text-xs text-slate-900 shadow-lg print:hidden" style={result.position}>
    {result.saved ? <span>«{result.issue.word}» se guardó en el diccionario de este dispositivo.</span> : <>
    <div className="flex items-center justify-between gap-2"><span>Posible error: <strong>{result.issue.word}</strong></span><button type="button" onClick={() => setResult(null)} aria-label="Cerrar sugerencias" className="text-lg leading-none">×</button></div>
    <div className="mt-1 flex flex-wrap gap-1">{result.suggestions.length ? result.suggestions.map((suggestion) => <button key={suggestion} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => apply(suggestion)} className="rounded border border-blue-200 bg-blue-50 px-2 py-1 font-semibold text-blue-800">{suggestion}</button>) : <span className="text-slate-600">Sin sugerencias. Puedes editar la palabra directamente.</span>}</div>
    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={remember} className="mt-2 font-semibold text-blue-700 underline">Agregar al diccionario personal</button>
    {saveError && <div role="alert" className="mt-1 text-red-700">{saveError}</div>}
    </>}
  </div>, document.body);
}
