import { isRemovedPart } from "@/utils/predefinedParts.mjs";

export default function RemovedPartsControls({ items, removed, onRestore }) {
  const hidden = items.filter(([code]) => isRemovedPart(code, removed));
  if (!hidden.length) return null;
  return <details className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs print:hidden">
    <summary className="cursor-pointer font-semibold text-amber-900">Recuperar repuestos retirados ({hidden.length})</summary>
    <div className="mt-2 flex flex-col items-start gap-2">
      {hidden.map(([code, description]) => <button key={code} type="button" onClick={() => onRestore(code)} className="text-left font-medium text-blue-700 underline hover:text-blue-900">Recuperar {code} — {description}</button>)}
    </div>
  </details>;
}
