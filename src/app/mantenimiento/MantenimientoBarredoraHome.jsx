import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInspectionsByType } from "@utils/inspectionStorage";

export default function MantenimientoBarredoraHome() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("todas");
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const data = getInspectionsByType("mantenimiento-barredora");
    setRegistros(data || []);
  }, []);

  const filtrados = registros.filter((r) => {
    if (filtro === "todas") return true;
    if (filtro === "borrador") return r.estado === "borrador";
    if (filtro === "completada") return r.estado === "completado";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">
          Mantenimiento Barredora
        </h1>

        <button
          onClick={() => navigate("/mantenimiento/barredora/crear")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear mantenimiento
        </button>
      </div>

      {/* SUBMENÚ */}
      <div className="flex gap-2 border-b pb-2 text-sm">
        {[
          ["todas", "Todos"],
          ["borrador", "Borrador"],
          ["completada", "Completada"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={`px-3 py-1 rounded ${
              filtro === key
                ? "bg-black text-white"
                : "border text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* HISTÓRICO */}
      <div className="border rounded p-4 space-y-2 text-sm">
        {filtrados.length === 0 && (
          <p className="text-gray-500">
            No hay mantenimientos aún.
          </p>
        )}

        {filtrados.map((r) => (
          <div
            key={r.id}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              <p className="font-semibold">
                {r.codInf || "Sin código"}
              </p>
              <p className="text-xs text-gray-500">
                {r.fecha || "Sin fecha"} · {r.estado}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate(`/mantenimiento/barredora/${r.id}`)
                }
                className="border px-3 py-1 rounded"
              >
                Abrir
              </button>

              {r.estado === "completado" && (
                <button
                  onClick={() =>
                    navigate(`/mantenimiento/barredora/${r.id}/pdf`)
                  }
                  className="border px-3 py-1 rounded"
                >
                  PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
