import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInspections } from "@/utils/inspectionStorage";

export default function HistorialInspecciones() {
  const navigate = useNavigate();
  const [inspecciones, setInspecciones] = useState([]);

  useEffect(() => {
    const data = getInspections("hidro");
    setInspecciones(data);
  }, []);

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
                <th className="border px-3 py-2 text-left">Fecha</th>
                <th className="border px-3 py-2 text-left">Estado</th>
                <th className="border px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inspecciones.map((item) => (
                <tr key={item.id}>
                  <td className="border px-3 py-2">
                    {new Date(item.createdAt).toLocaleString()}
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
                    {/* SIEMPRE SE PUEDE ABRIR */}
                    <button
                      onClick={() =>
                        navigate(`/inspeccion/hidro/${item.id}`)
                      }
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                    >
                      Abrir
                    </button>

                    {/* PDF SOLO SI ESTÁ COMPLETADO */}
                    {item.status === "completado" && (
                      <button
                        onClick={() =>
                          navigate(`/inspeccion/hidro/${item.id}?pdf=true`)
                        }
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
