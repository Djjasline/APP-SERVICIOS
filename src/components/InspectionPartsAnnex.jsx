import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import AutoResizeInput from "@/components/AutoResizeInput";
import { getVehicleReferenceCatalog } from "@/services/warehouseInventoryService";
import { formatPartsDescription, toSentenceCase } from "@/utils/sentenceCase.mjs";
import { isReferenceInteraction, showReferenceDropdown } from "@/utils/partsReferenceDropdown.mjs";
import { createDefaultPartsAnnexRows, hasPartsAnnexRowContent, normalizePartsAnnexRows, removePartsAnnexRow } from "@/utils/partsAnnexRows.mjs";
import { appendImportedParts, readPartsAnnexFile } from "@/utils/partsAnnexImport.mjs";

export { createDefaultPartsAnnexRows, normalizePartsAnnexRows } from "@/utils/partsAnnexRows.mjs";

const MIN_SEARCH_LENGTH = 3;

function getRowSearchText(row) {
  return `${row?.numeroParte || ""} ${row?.descripcion || ""}`.trim();
}

export default function InspectionPartsAnnex({ rows, onChange, enabled = true, onEnabledChange }) {
  const items = normalizePartsAnnexRows(rows);
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const deferredSearchText = useDeferredValue(searchText);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const descriptionRef = useRef(null);
  const partNumberRef = useRef(null);

  useEffect(() => {
    if (activeRow === null) return;
    const handleOutsidePointer = (event) => {
      if (!isReferenceInteraction(event.target, descriptionRef.current, partNumberRef.current)) {
        setActiveRow(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [activeRow]);

  const downloadExcel = async () => {
    setExportError("");
    setExporting(true);
    try {
      const { downloadPartsAnnexWorkbook } = await import("@/utils/partsAnnexExcel.mjs");
      downloadPartsAnnexWorkbook(items);
    } catch (error) {
      setExportError(error?.message || "No se pudo descargar el archivo Excel. Inténtalo de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const previewExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportError("");
    setImportMessage("");
    setImportPreview(null);
    setImporting(true);
    try {
      const imported = await readPartsAnnexFile(file);
      setImportPreview({ name: file.name, rows: imported });
    } catch (error) {
      setImportError(error?.message || "No se pudo leer el archivo Excel. Verifica el formato e inténtalo de nuevo.");
    } finally {
      setImporting(false);
    }
  };

  const addImportedRows = () => {
    if (!importPreview) return;
    onChange(appendImportedParts(itemsRef.current, importPreview.rows));
    setImportMessage(`Se agregaron ${importPreview.rows.length} ítem(s) al formulario. Guarda el registro para conservar los cambios.`);
    setImportPreview(null);
    setActiveRow(null);
    setMatches([]);
  };

  useEffect(() => {
    const query = deferredSearchText.trim();
    if (activeRow === null || query.length < MIN_SEARCH_LENGTH) {
      setMatches([]);
      setLoadingMatches(false);
      setSearchError("");
      return;
    }

    let ignore = false;
    setMatches([]);
    setLoadingMatches(true);
    setSearchError("");

    const timeout = window.setTimeout(async () => {
      try {
        const rows = await getVehicleReferenceCatalog({ search: query, limit: 8 });
        if (!ignore) setMatches(rows);
      } catch (error) {
        if (!ignore) {
          setMatches([]);
          setSearchError(error?.message || "No se pudo consultar la referencia.");
        }
      } finally {
        if (!ignore) setLoadingMatches(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [activeRow, deferredSearchText]);

  const updateRow = (index, field, value) => {
    onChange(items.map((row, i) => (i === index ? {
      ...row,
      [field]: value,
      ...(field === "numeroParte" && Object.hasOwn(row, "nParte") ? { nParte: value } : {}),
      ...(field === "observaciones" && Object.hasOwn(row, "observacion") ? { observacion: value } : {}),
    } : row)));
    if (field === "descripcion" || field === "numeroParte") {
      setActiveRow(index);
      setSearchText(getRowSearchText({ ...items[index], [field]: value }));
    }
  };

  const selectReferenceItem = (index, item) => {
    onChange(items.map((row, i) => (
      i === index
        ? { ...row, descripcion: toSentenceCase(item.description), numeroParte: item.product_code || "", ...(Object.hasOwn(row, "nParte") ? { nParte: item.product_code || "" } : {}) }
        : row
    )));
    setMatches([]);
    setActiveRow(null);
    setSearchText("");
  };

  const focusRow = (index) => {
    setActiveRow(index);
    setSearchText(getRowSearchText(items[index]));
  };

  const addRow = () => {
    onChange([...items, ...createDefaultPartsAnnexRows(1)]);
  };

  const removeRow = (index) => {
    if (hasPartsAnnexRowContent(items[index]) && !window.confirm(`¿Eliminar el ítem ${index + 1} del anexo?`)) return;
    setActiveRow(null);
    setSearchText("");
    setMatches([]);
    onChange(removePartsAnnexRow(items, index));
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-bold text-sm">ANEXO DE ÍTEMS / REPORTE DE PIEZAS</h3>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange?.(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Incluir anexo en formulario/PDF
        </label>
      </div>

      {!enabled && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Anexo desactivado. No se mostrará en el PDF de esta inspección.
        </p>
      )}

      {enabled && (
        <>
          <table className="pdf-table w-full">
            <thead>
              <tr>
                <th style={{ width: 45 }}>ÍTEM</th>
                <th style={{ width: 80 }}>CANTIDAD</th>
                <th style={{ width: 135 }}>N° PARTE</th>
                <th>DESCRIPCIÓN / NOMBRE</th>
                <th>OBSERVACIONES</th>
                <th className="print:hidden" style={{ width: 48 }} aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index}>
                  <td className="text-center font-semibold">{index + 1}</td>
                  <td>
                    <AutoResizeInput
                      className="pdf-input w-full"
                      value={row.cantidad}
                      placeholder="Cant."
                      onChange={(event) => updateRow(index, "cantidad", event.target.value)}
                    />
                  </td>
                  <td ref={activeRow === index ? partNumberRef : null}>
                    <AutoResizeInput
                      className="pdf-input w-full"
                      value={row.numeroParte}
                      placeholder="N° parte"
                      onFocus={() => focusRow(index)}
                      onChange={(event) => updateRow(index, "numeroParte", event.target.value)}
                    />
                  </td>
                  <td>
                    <div className="relative" ref={activeRow === index ? descriptionRef : null}>
                      <AutoResizeInput
                        className="pdf-input w-full"
                        value={formatPartsDescription(row.descripcion)}
                        placeholder="Descripción de la pieza o ítem requerido"
                        onFocus={() => focusRow(index)}
                        onChange={(event) => updateRow(index, "descripcion", event.target.value)}
                      />
                      {activeRow === index && (
                        <PartsReferenceDropdown
                          query={searchText}
                          matches={matches}
                          loading={loadingMatches}
                          error={searchError}
                          onSelect={(item) => selectReferenceItem(index, item)}
                          onClose={() => setActiveRow(null)}
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <AutoResizeInput
                      className="pdf-input w-full"
                      value={row.observaciones}
                      placeholder="Observaciones"
                      onChange={(event) => updateRow(index, "observaciones", event.target.value)}
                    />
                  </td>
                  <td className="print:hidden text-center align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="inline-flex items-center justify-center rounded p-2 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Eliminar ítem ${index + 1}`}
                      title={`Eliminar ítem ${index + 1}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              + Agregar más ítems
            </button>
            <button type="button" onClick={downloadExcel} disabled={exporting} className="rounded-md border border-emerald-700 bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 print:hidden">
              {exporting ? "Preparando Excel..." : "Descargar anexo en Excel"}
            </button>
            <label className={`inline-flex cursor-pointer items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 print:hidden ${importing ? "opacity-50" : ""}`}>
              {importing ? "Leyendo Excel..." : "Cargar anexo desde Excel"}
              <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={importing} className="sr-only" onChange={previewExcel} />
            </label>
          </div>
          {exportError && <p role="alert" className="text-xs text-red-700">{exportError}</p>}
          {importError && <p role="alert" className="text-xs text-red-700">{importError}</p>}
          {importMessage && <p role="status" className="text-xs text-emerald-700">{importMessage}</p>}
          {importPreview && (
            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs print:hidden">
              <p className="font-semibold text-blue-900">{importPreview.name}: {importPreview.rows.length} ítem(s) encontrados en la primera hoja.</p>
              <p>Se agregarán a las filas existentes, sin reemplazarlas ni eliminar duplicados. Solo se importan cantidad, número de parte, descripción y observaciones (Service Note).</p>
              <p>Para conservar ceros iniciales, guarda los números de parte como texto en Excel.</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white text-left">
                  <thead><tr><th className="border p-1">Cantidad</th><th className="border p-1">N° parte</th><th className="border p-1">Descripción</th><th className="border p-1">Observaciones</th></tr></thead>
                  <tbody>{importPreview.rows.slice(0, 5).map((row, index) => <tr key={index}><td className="border p-1">{row.cantidad}</td><td className="border p-1">{row.numeroParte}</td><td className="border p-1">{row.descripcion}</td><td className="border p-1">{row.observaciones}</td></tr>)}</tbody>
                </table>
              </div>
              {importPreview.rows.length > 5 && <p>Se muestran las primeras 5 filas.</p>}
              <div className="flex flex-wrap gap-2"><button type="button" onClick={addImportedRows} className="rounded bg-blue-700 px-3 py-1.5 font-semibold text-white hover:bg-blue-800">Agregar {importPreview.rows.length} ítem(s)</button><button type="button" onClick={() => setImportPreview(null)} className="rounded border border-slate-400 bg-white px-3 py-1.5 font-semibold">Cancelar</button></div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function PartsReferenceDropdown({ query, matches, loading, error, onSelect, onClose }) {
  const showHint = query.trim().length > 0 && query.trim().length < MIN_SEARCH_LENGTH;

  if (!showReferenceDropdown({ showHint, loading, error, matches })) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white text-xs shadow-xl print:hidden">
      <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2 font-semibold text-slate-700">
        <span>Referencia histórica de vehículos</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">Cerrar</button>
      </div>

      {showHint && <p className="px-3 py-2 text-slate-500">Escribe al menos 3 caracteres para buscar por código o descripción.</p>}
      {loading && <p className="px-3 py-2 text-slate-500">Buscando coincidencias...</p>}
      {error && <p className="px-3 py-2 text-red-600">{error}</p>}
      {matches.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
          className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-blue-50"
        >
          <span className="block font-bold text-slate-900">{item.product_code}</span>
          <span className="block text-slate-700">{toSentenceCase(item.description)}</span>
          {(item.last_supplier || item.source_file) && (
            <span className="block text-[11px] text-slate-400">{item.last_supplier || item.source_file}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function InspectionPartsAnnexPdf({ rows, styles, enabled = true }) {
  if (enabled === false) return null;

  const items = normalizePartsAnnexRows(rows).filter(hasPartsAnnexRowContent);

  if (items.length === 0) return null;

  const S = styles;

  return (
    <div className="no-break">
      <p style={S.sectionTitle}>ANEXO DE ÍTEMS / REPORTE DE PIEZAS</p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 45 }}>ÍTEM</th>
            <th style={{ ...S.th, width: 70 }}>CANTIDAD</th>
            <th style={{ ...S.th, width: 110 }}>N° PARTE</th>
            <th style={{ ...S.th, textAlign: "left" }}>DESCRIPCIÓN / NOMBRE</th>
            <th style={{ ...S.th, textAlign: "left" }}>OBSERVACIONES</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={index}>
              <td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{index + 1}</td>
              <td style={{ ...S.cell, textAlign: "center", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{row.cantidad === "" ? "—" : row.cantidad}</td>
              <td style={{ ...S.cell, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{row.numeroParte === "" ? "—" : row.numeroParte}</td>
              <td style={{ ...S.cell, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{formatPartsDescription(row.descripcion) || "—"}</td>
              <td style={{ ...S.cell, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{row.observaciones || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
