import { useDeferredValue, useEffect, useState } from "react";
import AutoResizeInput from "@/components/AutoResizeInput";
import { getVehicleReferenceCatalog } from "@/services/warehouseInventoryService";

const MIN_SEARCH_LENGTH = 3;

function getRowSearchText(row) {
  return `${row?.numeroParte || ""} ${row?.descripcion || ""}`.trim();
}

export function createDefaultPartsAnnexRows(count = 5) {
  return Array.from({ length: count }, () => ({
    descripcion: "",
    numeroParte: "",
    cantidad: "",
  }));
}

export function normalizePartsAnnexRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return createDefaultPartsAnnexRows();

  return rows.map((row) => ({
    descripcion: row?.descripcion || "",
    numeroParte: row?.numeroParte || row?.nParte || "",
    cantidad: row?.cantidad || "",
  }));
}

export default function InspectionPartsAnnex({ rows, onChange, enabled = true, onEnabledChange }) {
  const items = normalizePartsAnnexRows(rows);
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const deferredSearchText = useDeferredValue(searchText);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const query = deferredSearchText.trim();
    if (activeRow === null || query.length < MIN_SEARCH_LENGTH) {
      setMatches([]);
      setLoadingMatches(false);
      setSearchError("");
      return;
    }

    let ignore = false;
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
    onChange(items.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    setActiveRow(index);
    setSearchText(getRowSearchText({ ...items[index], [field]: value }));
  };

  const selectReferenceItem = (index, item) => {
    onChange(items.map((row, i) => (
      i === index
        ? { ...row, descripcion: item.description || "", numeroParte: item.product_code || "" }
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
    onChange([...items, { descripcion: "", numeroParte: "", cantidad: "" }]);
  };

  const removeLastRow = () => {
    if (items.length <= 1) return;
    onChange(items.slice(0, -1));
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
                <th>DESCRIPCIÓN</th>
                <th style={{ width: 170 }}>N° PARTE</th>
                <th style={{ width: 110 }}>CANTIDAD</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index}>
                  <td className="text-center font-semibold">{index + 1}</td>
                  <td>
                    <div className="relative">
                      <AutoResizeInput
                        className="pdf-input w-full"
                        value={row.descripcion}
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
                      value={row.numeroParte}
                      placeholder="N° parte"
                      onFocus={() => focusRow(index)}
                      onChange={(event) => updateRow(index, "numeroParte", event.target.value)}
                    />
                  </td>
                  <td>
                    <AutoResizeInput
                      className="pdf-input w-full"
                      value={row.cantidad}
                      placeholder="Cant."
                      onChange={(event) => updateRow(index, "cantidad", event.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRow}
              className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded"
            >
              + Agregar más ítems
            </button>
            <button
              type="button"
              onClick={removeLastRow}
              disabled={items.length <= 1}
              className="border border-red-200 px-4 py-1.5 text-xs rounded text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar último
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function PartsReferenceDropdown({ query, matches, loading, error, onSelect, onClose }) {
  const showHint = query.trim().length > 0 && query.trim().length < MIN_SEARCH_LENGTH;
  const showEmpty = query.trim().length >= MIN_SEARCH_LENGTH && !loading && !error && matches.length === 0;

  if (!showHint && !loading && !error && !showEmpty && matches.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white text-xs shadow-xl print:hidden">
      <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2 font-semibold text-slate-700">
        <span>Referencia histórica de vehículos</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">Cerrar</button>
      </div>

      {showHint && <p className="px-3 py-2 text-slate-500">Escribe al menos 3 caracteres para buscar por código o descripción.</p>}
      {loading && <p className="px-3 py-2 text-slate-500">Buscando coincidencias...</p>}
      {error && <p className="px-3 py-2 text-red-600">{error}</p>}
      {showEmpty && <p className="px-3 py-2 text-slate-500">Sin coincidencias en la referencia.</p>}

      {matches.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
          className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-blue-50"
        >
          <span className="block font-bold text-slate-900">{item.product_code}</span>
          <span className="block text-slate-700">{item.description}</span>
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

  const items = normalizePartsAnnexRows(rows).filter(
    (row) => row.descripcion || row.numeroParte || row.cantidad
  );

  if (items.length === 0) return null;

  const S = styles;

  return (
    <div className="no-break">
      <p style={S.sectionTitle}>ANEXO DE ÍTEMS / REPORTE DE PIEZAS</p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 45 }}>ÍTEM</th>
            <th style={{ ...S.th, textAlign: "left" }}>DESCRIPCIÓN</th>
            <th style={{ ...S.th, width: 130 }}>N° PARTE</th>
            <th style={{ ...S.th, width: 90 }}>CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={index}>
              <td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{index + 1}</td>
              <td style={{ ...S.cell, whiteSpace: "pre-wrap" }}>{row.descripcion || "—"}</td>
              <td style={S.cell}>{row.numeroParte || "—"}</td>
              <td style={{ ...S.cell, textAlign: "center" }}>{row.cantidad || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
