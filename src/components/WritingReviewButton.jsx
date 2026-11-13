import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { eligibleSpellField, setSpellFieldValue } from "@/utils/spellReviewFields";
import { findSpellingIssues, groupSpellingIssues, replaceSpellingIssue } from "@/utils/spanishSpellReview.mjs";

function collectIssues(scope, dictionary) {
  const results = [];
  let fields = 0;
  for (const element of scope.querySelectorAll("textarea, input")) {
    if (!eligibleSpellField(element, true)) continue;
    fields += 1;
    const value = element.value;
    const label = element.getAttribute("aria-label") || element.placeholder || element.name || "Campo de texto";
    for (const issue of findSpellingIssues(value, dictionary, 200 - results.length)) {
      results.push({ ...issue, element, value, label });
      if (results.length >= 200) return { results, fields };
    }
  }
  return { results, fields };
}

export default function WritingReviewButton() {
  const buttonRef = useRef(null);
  const dictionaryRef = useRef(null);
  const scopeRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState([]);
  const [fieldCount, setFieldCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [custom, setCustom] = useState("");

  const review = async () => {
    scopeRef.current = buttonRef.current?.closest("form") || buttonRef.current?.closest("main") || document;
    setOpen(true);
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      const { getSpanishDictionary } = await import("@/utils/spanishDictionary");
      dictionaryRef.current = getSpanishDictionary();
      const { results, fields } = collectIssues(scopeRef.current, dictionaryRef.current);
      setIssues(results);
      setFieldCount(fields);
    } catch {
      setError("No se pudo cargar el diccionario. Comprueba la conexión e inténtalo de nuevo; tus datos no han cambiado.");
    } finally {
      setLoading(false);
    }
  };

  const chooseIssue = (issue) => {
    setSelected(issue);
    setCustom(issue.word);
    setSuggestions(dictionaryRef.current.suggest(issue.word).slice(0, 6));
  };

  const apply = (issue, replacement) => {
    if (!issue.element.isConnected || !eligibleSpellField(issue.element, true) || issue.element.value !== issue.value) {
      setError("El texto cambió desde la revisión. Vuelve a revisar antes de aplicar sugerencias.");
      return;
    }
    const clean = replacement.trim();
    if (!clean || /[\r\n]/.test(clean)) {
      setError("Escribe una corrección sin saltos de línea.");
      return;
    }
    const next = replaceSpellingIssue(issue.value, issue, clean);
    if (next === null) return;
    setSpellFieldValue(issue.element, next);
    setSelected(null);
    setError("");
    window.setTimeout(() => {
      const { results, fields } = collectIssues(scopeRef.current, dictionaryRef.current);
      setIssues(results);
      setFieldCount(fields);
    });
  };

  return <>
    <button ref={buttonRef} type="button" onClick={review} className="rounded bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 print:hidden">Revisar ortografía</button>
    {open && createPortal(<div data-spell-review-ui className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 print:hidden" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="writing-review-title" className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-start justify-between gap-3"><div><h2 id="writing-review-title" className="text-lg font-bold">Revisión ortográfica en español</h2><p className="mt-1 text-xs text-slate-600">Revisa los campos de texto visibles y editables. Se intenta omitir nombres, identificadores y códigos técnicos, pero pueden aparecer en las sugerencias: compruébalas antes de elegirlas. No se cambia nada automáticamente.</p></div><button type="button" aria-label="Cerrar revisión" onClick={() => setOpen(false)} className="rounded px-2 py-1 text-xl">×</button></div>
        {loading && <p role="status" className="mt-4">Revisando texto…</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        {!loading && !error && issues.length === 0 && <p className="mt-4 text-sm">{fieldCount ? "No se encontraron posibles errores en los campos revisados. El diccionario no detecta todos los errores ni revisa la gramática." : "No hay campos de texto visibles y editables para revisar. Los campos de identificación y técnicos se excluyen."}</p>}
        {!loading && issues.length > 0 && <><p className="mt-4 text-sm font-semibold">Posibles errores: {issues.length}{issues.length >= 200 ? " (se muestran hasta 200)" : ""}. Las palabras repetidas se agrupan; cada aparición se corrige por separado.</p><div className="mt-2 space-y-3">{groupSpellingIssues(issues).map((group) => <section key={group.key} className="rounded border border-slate-200 p-3 text-sm"><h3 className="font-bold text-red-700">{group.word} <span className="font-normal text-slate-500">({group.issues.length})</span></h3>{group.issues.map((issue, index) => <div key={`${index}-${issue.start}`} className="mt-2 border-t border-slate-100 pt-2"><p className="text-xs text-slate-500">{issue.label}</p><p className="break-words">…{issue.value.slice(Math.max(0, issue.start - 35), issue.start)}<strong className="text-red-700">{issue.word}</strong>{issue.value.slice(issue.end, issue.end + 35)}…</p><button type="button" onClick={() => chooseIssue(issue)} className="mt-1 text-xs font-semibold text-blue-700 underline">Corregir esta aparición</button>{selected === issue && <div className="mt-2 space-y-2"><div className="flex flex-wrap gap-2">{suggestions.length ? suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => apply(issue, suggestion)} className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-800">{suggestion}</button>) : <span className="text-xs text-slate-500">No hay sugerencias automáticas.</span>}</div><label className="block text-xs font-semibold">Escribir corrección<input type="text" data-no-autocapitalize="true" data-no-writing-assist="true" value={custom} onChange={(event) => setCustom(event.target.value)} className="mt-1 block w-full rounded border border-slate-300 px-2 py-1 text-sm" /></label><button type="button" onClick={() => apply(issue, custom)} className="rounded bg-blue-700 px-2 py-1 text-xs font-semibold text-white">Aplicar corrección escrita</button></div>}</div>)}</section>)}</div></>}
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={review} disabled={loading} className="rounded border px-3 py-2 text-sm disabled:opacity-50">Volver a revisar</button><button type="button" onClick={() => setOpen(false)} className="rounded bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Cerrar</button></div>
      </div>
    </div>, document.body)}
  </>;
}
