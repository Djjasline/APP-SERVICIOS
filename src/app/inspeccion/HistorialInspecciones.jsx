import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInspections } from "@/utils/inspectionStorage";
import { generateInspectionPdf } from "@/app/utils/generateReportPdf";
export default function HistorialInspecciones() {
  const navigate = useNavigate();
  const [inspecciones, setInspecciones] = useState([]);

  /* =============================
     CARGAR / RECARGAR HISTORIAL
  ============================== */
  const loadData = () => {
    const data = getInspections("hidro");

    // Ordenar por última actualización (más reciente arriba)
    const ordered = [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.fecha).getTime();
      const dateB = new Date(b.updatedAt || b.fecha).getTime();
      return dateB - dateA;
    });

    setInspecciones(ordered);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (id) => {
    navigate(`/inspeccion/hidro/${id}`);
  };

  const handleGeneratePdf = (item) => {
  generateInspectionPdf(item.data);
};


  /* =============================
     RENDER
  ============================== */
  return (
    <div className="max-w-6xl mx-auto my-6 bg-white shadow-lg rounded-2xl p-6 space-y-4">
      <h1 className="text-lg font-bold">
        Historial de inspecciones – Hidrosuccionador
      </h1>

      {inspecciones.length === 0 ? (
        <p className="text-sm text-gray-500">
          No existen inspecciones registradas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">
                  Última actualización
                </th>
                <th className="border px-3 py-2 text-left">Estado</th>
                <th className="border px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inspecciones.map((item) => (
                <tr key={item.id}>
                  {/* FECHA */}
                  <td className="border px-3 py-2">
                    {new Date(item.updatedAt || item.fecha).toLocaleString()}
                  </td>

                  {/* ESTADO */}
                  <td className="border px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.estado === "completada"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>

                  {/* ACCIONES */}
                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleOpen(item.id)}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                    >
                      Abrir
                    </button>

                    {item.estado === "completada" && (
                      <button
                        onClick={() => handleGeneratePdf(item)}
                        className="px-3 py-1 rounded bg-gray-700 text-white text-xs"
                      >
                        PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={() => navigate("/inspeccion")}
          className="px-4 py-2 rounded border text-sm"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
