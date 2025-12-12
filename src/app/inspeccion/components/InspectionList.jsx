import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "hidro_inspection_reports";

function loadReports() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReports(reports) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function createEmptyReport() {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  return {
    id,
    fecha: null,
    cliente: "",
    codigoInterno: "",
    estado: "Borrador",
    data: null,
  };
}

export default function InspectionList() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const handleNew = () => {
    const nuevo = createEmptyReport();
    const next = [...reports, nuevo];
    setReports(next);
    saveReports(next);
    navigate(`/hoja/${nuevo.id}`);
  };

  const handleContinue = (id) => {
    navigate(`/hoja/${id}`);
  };

  const handlePdf = (id) => {
    navigate(`/hoja/${id}?pdf=1`);
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar esta hoja de inspección?")) return;
    const next = reports.filter((r) => r.id !== id);
    setReports(next);
    saveReports(next);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return fecha;
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Hojas de inspección</h1>
        <button
          type="button"
          onClick={handleNew}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs md:text-sm"
        >
          + Nueva hoja
        </button>
      </div>

      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-3 py-2 border-b">Fecha</th>
              <th className="px-3 py-2 border-b">Cliente</th>
              <th className="px-3 py-2 border-b">Código interno</th>
              <th className="px-3 py-2 border-b">Estado</th>
              <th className="px-3 py-2 border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-gray-500 text-xs"
                >
                  No hay hojas de inspección registradas. Crea una nueva hoja
                  con el botón “Nueva hoja”.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{formatFecha(r.fecha)}</td>
                  <td className="px-3 py-2">{r.cliente || "—"}</td>
                  <td className="px-3 py-2">{r.codigoInterno || "—"}</td>
                  <td className="px-3 py-2">{r.estado || "Borrador"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleContinue(r.id)}
                        className="px-3 py-1 rounded border text-[11px]"
                      >
                        Continuar
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePdf(r.id)}
                        className="px-3 py-1 rounded border text-[11px]"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="px-3 py-1 rounded border border-red-300 text-[11px] text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
