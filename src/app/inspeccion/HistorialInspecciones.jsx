console.log("🔥 HISTORIAL HIDRO CARGADO 🔥");

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ STORAGE CORRECTO
import { getInspectionsByType } from "@/app/inspeccion/utils/reportStorage";

// ✅ PDF CORRECTO
import { generateInspectionPdf } from "@/app/inspeccion/utils/generateInspectionPdf";

export default function HistorialInspecciones() {
  const navigate = useNavigate();
  const [inspecciones, setInspecciones] = useState([]);

  /* =============================
     CARGAR HISTORIAL
  ============================== */
  useEffect(() => {
    const data = getInspectionsByType("hidro");

    const ordered = [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    setInspecciones(ordered);
  }, []);

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (id) => {
    navigate(`/inspeccion/hidro/${id}`);
  };

  const handleGeneratePdf = (inspection) => {
   console.log("🧪 INSPECTION COMPLETA:", inspection);
  console.log("🧪 DATA PARA PDF:", inspection.data);
    generateInspectionPdf(inspection.data);
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
                  <td className="border px-3 py-2">
                    {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                  </td>

                  <td className="border px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === "completado"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleOpen(item.id)}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                    >
                      Abrir
                    </button>

                    {item.status === "completado" && (
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
