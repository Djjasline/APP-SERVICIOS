import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInspections,
  createInspection,
} from "@/utils/inspectionStorage";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState("todas");
  const [inspections, setInspections] = useState([]);

  /* =============================
     CARGA HISTORIAL
  ============================= */
  useEffect(() => {
    setInspections(getInspections("hidro"));
  }, []);

  /* =============================
     NUEVA INSPECCIÓN
  ============================= */
  const handleNueva = () => {
    const id = Date.now().toString();
    createInspection("hidro", id);
    navigate(`/inspeccion/hidro/${id}`);
  };

  /* =============================
     FILTRO
  ============================= */
  const filtradas = inspections.filter((i) => {
    if (filtro === "todas") return true;
    return i.estado === filtro;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">Inspección y valoración</h1>

      {/* CARD HIDRO */}
      <section className="border rounded-xl p-4 space-y-4 bg-white">
        <h2 className="font-semibold">Hidrosuccionador</h2>
        <p className="text-sm text-gray-500">
          Inspección del equipo hidrosuccionador.
        </p>

        <button
          onClick={handleNueva}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Nueva inspección
        </button>

        {/* FILTROS */}
        <div className="flex gap-2 text-xs">
          {["todas", "borrador", "completada"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-2 py-1 border rounded ${
                filtro === f ? "bg-blue-600 text-white" : ""
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* HISTORIAL */}
        <div className="space-y-2">
          {filtradas.length === 0 && (
            <p className="text-sm text-gray-400">
              No hay inspecciones aún.
            </p>
          )}

          {filtradas.map((ins) => (
            <div
              key={ins.id}
              className="flex justify-between items-center border rounded px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">
                  {ins.data?.cliente || "Sin cliente"}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(ins.fecha).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    ins.estado === "completada"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {ins.estado}
                </span>

                <button
                  onClick={() =>
                    navigate(`/inspeccion/hidro/${ins.id}`)
                  }
                  className="text-blue-600 text-sm"
                >
                  Abrir
                </button>

                <button
                  onClick={() =>
                    navigate(`/inspeccion/hidro/${ins.id}?pdf=1`)
                  }
                  className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
