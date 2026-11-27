import { createContext, useContext, useEffect, useId, useState } from "react";
import AutoResizeInput from "@/components/AutoResizeInput";
import { getEquipmentReferencesForClient, searchEquipmentReferences } from "@/services/equipmentReferenceService";
import { getEquipmentFormValues, mergeEquipmentFormValues, selectEquipmentReferenceForField, usefulEquipmentValue } from "@/utils/equipmentReference.mjs";

const LABELS = { vin: "VIN / chasis", modelo: "modelo", serie: "serie", serieModulo: "serie módulo", anio: "año" };
const EquipmentReferenceContext = createContext(null);

export default function EquipmentReferenceSearch({ clientName = "", current = {}, onApply, category = "", camera = false, protocol = false, children }) {
  const id = useId();
  const clientId = useId();
  const [clientItems, setClientItems] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = String(clientName || "").trim();
    setClientItems([]);
    setSelectedId("");
    setClientError("");
    setMessage("");
    if (client.length < 3) {
      setClientLoading(false);
      return;
    }
    let cancelled = false;
    setClientLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const rows = await getEquipmentReferencesForClient(client, { category });
        if (!cancelled) setClientItems(rows);
      } catch (err) {
        console.error("Error consultando equipos del cliente:", err);
        if (!cancelled) setClientError("No se pudo consultar el catálogo. Puedes ingresar los datos manualmente.");
      } finally {
        if (!cancelled) setClientLoading(false);
      }
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [clientName, category]);

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
    <EquipmentReferenceContext.Provider value={{ clientItems, clientLoading, clientError, clientName, current, onApply, camera, protocol }}>
    <>
    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-slate-900 print:hidden">
      <label htmlFor={clientId} className="block text-xs font-bold text-blue-900">Posibles equipos del cliente</label>
      <select id={clientId} value={selectedId} disabled={clientLoading || !clientItems.length}
        onChange={(event) => {
          const item = clientItems.find((row) => row.id === event.target.value);
          setSelectedId(event.target.value);
          setMessage("");
          if (item) apply(item);
        }} className="mt-1 w-full rounded border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-70">
        <option value="">{clientLoading ? "Buscando equipos…" : "Selecciona un posible equipo"}</option>
        {clientItems.map((item) => (
          <option key={item.id} value={item.id}>
            {[item.client_name, item.equipment_type, usefulEquipmentValue(item.chassis_vin) && `VIN: ${item.chassis_vin}`, usefulEquipmentValue(item.module_serial) && `Serie: ${item.module_serial}`, usefulEquipmentValue(item.equipment_model) && `Modelo: ${item.equipment_model}`, `${item.source_sheet}, fila ${item.source_row}`].filter(Boolean).join(" · ")}
          </option>
        ))}
      </select>
      {selectedId && <button type="button" onClick={() => {
        const item = clientItems.find((row) => row.id === selectedId);
        if (item) apply(item);
      }} className="mt-2 rounded bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800">Aplicar equipo seleccionado</button>}
      {clientLoading && <p role="status" className="mt-1 text-xs">Buscando equipos del cliente…</p>}
      {clientError && <p role="alert" className="mt-1 text-xs text-red-700">{clientError}</p>}
      {!clientLoading && !clientError && String(clientName || "").trim().length < 3 && <p className="mt-1 text-xs text-slate-600">Escribe o selecciona un cliente para ver posibles equipos.</p>}
      {!clientLoading && !clientError && String(clientName || "").trim().length >= 3 && !clientItems.length && <p className="mt-1 text-xs text-slate-600">No se encontraron equipos para ese nombre. Prueba con el buscador manual o ingresa los datos.</p>}
      <p className="mt-1 text-xs text-slate-600">Son posibles coincidencias del Excel; verifica el cliente y los identificadores antes de guardar.</p>
      {message && <p role="status" className="mt-1 text-xs text-blue-900">{message}</p>}
      <details className="mt-2">
      <summary className="cursor-pointer text-xs font-semibold text-blue-900">Buscar manualmente por cliente, VIN o serie</summary>
      <label htmlFor={id} className="mt-2 block text-xs font-bold text-blue-900">Buscar equipo de referencia</label>
      <input id={id} value={query} onChange={(event) => { setQuery(event.target.value); setMessage(""); }}
        placeholder="Cliente, VIN, modelo o serie" className="mt-1 w-full rounded border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900"
        autoComplete="off" />
      <p className="mt-1 text-xs text-slate-600">Datos de referencia; verifica el equipo y sus identificadores antes de aplicarlos.</p>
      {loading && <p role="status" className="mt-1 text-xs">Buscando equipos…</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
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
      </details>
    </div>
    {children}
    </>
    </EquipmentReferenceContext.Provider>
  );
}

// Keep the original editable textarea; suggestions are an optional dropdown.
export function EquipmentReferenceField({ fieldName, ...props }) {
  const context = useContext(EquipmentReferenceContext);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const dropdownId = useId();
  const referenceKey = fieldName === "vin" ? "chassis_vin" :
    fieldName === "serie" || fieldName === "serieModulo" ? "module_serial" : "";
  if (!context || !referenceKey) return <AutoResizeInput {...props} />;
  const items = context.clientItems.filter((item) => usefulEquipmentValue(item[referenceKey]));
  const select = (item) => {
    // Selecting an option explicitly replaces this field, but never other fields.
    const result = selectEquipmentReferenceForField(context.current, item, fieldName, { camera: context.camera, protocol: context.protocol });
    if (result.unavailable) {
      setMessage("Esta referencia no contiene un valor para este campo.");
      return;
    }
    if (result.conflicts.length) {
      setMessage(`No se modificaron los datos. Revisa ${result.conflicts.map((key) => LABELS[key] || key).join(", ")}: contienen valores distintos.`);
      return;
    }
    context.onApply(result.values);
    setMessage("Equipo seleccionado. Verifica los datos antes de guardar.");
    setOpen(false);
  };
  return (
    <div className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="flex items-start">
        <AutoResizeInput {...props} className={`${props.className || "pdf-input w-full"} min-w-0 flex-1`} onFocus={(event) => { props.onFocus?.(event); setOpen(true); }}
          aria-expanded={open} aria-controls={dropdownId} />
        <button type="button" aria-label={`Mostrar opciones de ${LABELS[fieldName]}`}
          aria-expanded={open} aria-controls={dropdownId} onClick={() => setOpen((value) => !value)}
          className="print:hidden rounded border border-slate-300 bg-slate-50 px-2 py-1 text-slate-700" title="Ver posibles equipos">▾</button>
      </div>
      {open && <div id={dropdownId} className="absolute left-0 right-0 z-40 mt-1 max-h-56 overflow-auto rounded border border-slate-200 bg-white text-xs text-slate-900 shadow-lg print:hidden">
        {context.clientLoading && <p className="p-2">Buscando equipos…</p>}
        {context.clientError && <p className="p-2 text-red-700">{context.clientError}</p>}
        {!context.clientLoading && !context.clientError && !items.length && <p className="p-2">No hay opciones de este campo para el cliente. Puedes escribirlo manualmente.</p>}
        {items.map((item) => <button key={item.id} type="button" onMouseDown={(event) => event.preventDefault()}
          onClick={() => select(item)} className="block w-full border-b border-slate-100 p-2 text-left hover:bg-blue-50">
          <strong>{item[referenceKey]}</strong>
          <span className="block">{[item.client_name, item.equipment_type, item.equipment_model, item.source_sheet && `${item.source_sheet}, fila ${item.source_row}`].filter(Boolean).join(" · ")}</span>
        </button>)}
      </div>}
      {message && <p role="status" className="mt-1 text-xs text-blue-900 print:hidden">{message}</p>}
    </div>
  );
}
