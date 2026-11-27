import { useEffect, useId, useState } from "react";
import { searchEquipmentReferences } from "@/services/equipmentReferenceService";
import { getEquipmentFormValues, mergeEquipmentFormValues, usefulEquipmentValue } from "@/utils/equipmentReference.mjs";

const LABELS = { vin: "VIN / chasis", modelo: "modelo", serie: "serie", serieModulo: "serie módulo", anio: "año" };

export default function EquipmentReferenceSearch({ current = {}, onApply, category = "", camera = false, protocol = false }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) {
      setItems([]);
      setLoading(false);
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setItems([]);
    setError("");
    const timer = window.setTimeout(async () => {
      try {
        const results = await searchEquipmentReferences(text, { category });
        if (!cancelled) setItems(results);
      } catch (err) {
        console.error("Error consultando equipos:", err);
        if (!cancelled) {
          setItems([]);
          setError("No se pudo consultar el catálogo. Puedes continuar ingresando los datos manualmente.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, category]);

  const apply = (item) => {
    const proposed = getEquipmentFormValues(item, { camera, protocol });
    if (!Object.keys(proposed).length) {
      setMessage("Esta referencia no tiene campos compatibles para completar automáticamente; puedes consultarla y escribir los datos manualmente.");
      return;
    }
    const result = mergeEquipmentFormValues(current, proposed);
    if (result.conflicts.length) {
      setMessage(`No se modificaron los datos: revisa ${result.conflicts.map((key) => LABELS[key] || key).join(", ")} porque ya contienen valores distintos.`);
      return;
    }
    onApply(result.values);
    setItems([]);
    setQuery("");
    setMessage("Se completaron únicamente los campos vacíos compatibles. Revisa los datos antes de guardar.");
  };

  return (
    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-slate-900 print:hidden">
      <label htmlFor={id} className="block text-xs font-bold text-blue-900">Buscar equipo de referencia</label>
      <input id={id} value={query} onChange={(event) => { setQuery(event.target.value); setMessage(""); }}
        placeholder="Cliente, VIN, modelo o serie" className="mt-1 w-full rounded border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900"
        autoComplete="off" />
      <p className="mt-1 text-xs text-slate-600">Datos de referencia; verifica el equipo y sus identificadores antes de aplicarlos.</p>
      {loading && <p role="status" className="mt-1 text-xs">Buscando equipos…</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
      {message && <p role="status" className="mt-1 text-xs text-blue-900">{message}</p>}
      {!loading && !error && query.trim().length >= 3 && !items.length && <p className="mt-1 text-xs text-slate-600">Sin coincidencias.</p>}
      {items.length > 0 && (
        <div className="mt-2 max-h-80 space-y-2 overflow-auto" aria-label="Resultados de equipos">
          {items.map((item) => (
            <div key={item.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
              <p className="font-bold">{item.client_name || "Cliente no indicado"} · {item.equipment_type || "Tipo no indicado"}</p>
              <p>VIN / máquina: {usefulEquipmentValue(item.chassis_vin) || "No indicado"} · Modelo: {usefulEquipmentValue(item.equipment_model) || "No indicado"} · Año: {usefulEquipmentValue(item.manufacture_year) || "No indicado"}</p>
              <p>Serie módulo: {usefulEquipmentValue(item.module_serial) || "No indicada"} · Marca chasis: {usefulEquipmentValue(item.chassis_brand) || "No indicada"}</p>
              {(item.auxiliary_brand || item.auxiliary_model || item.auxiliary_serial) && <p>Motor auxiliar: {[item.auxiliary_brand, item.auxiliary_model, item.auxiliary_serial].filter(Boolean).join(" · ")}</p>}
              <p className="text-slate-500">Fuente: {item.source_sheet}, fila {item.source_row}. Referencias similares pueden corresponder a datos diferentes.</p>
              <button type="button" onClick={() => apply(item)} className="mt-2 rounded bg-blue-700 px-3 py-1 font-semibold text-white hover:bg-blue-800">Aplicar datos compatibles</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
