import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// STORAGE
import { getAllInspections } from "@/app/inspeccion/utils/reportStorage";

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);

  /* =============================
     CARGAR INSPECCIONES
  ============================== */
  useEffect(() => {
    const data = getAllInspections();

    const ordered = [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    setInspections(ordered);
  }, []);

  /* =============================
     AGRUPAR POR TIPO
  ============================== */
  const byType = {
    hidro: inspections.filter((i) => i.type === "hidro"),
    barredora: inspections.filter((i) => i.type === "barredora"),
    camara: inspections.filter((i) => i.type === "camara"),
  };

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (type, id) => {
    navigate(`/inspeccion/${type}/${id}`);
  };

  const handleGeneratePdf = (inspection) => {
    if (!inspection?.data) {
      alert("No hay datos para generar el PDF.");
      return;
    }

    generateInspectionPdf(inspection.data);
  };

  /* =============================
     RENDER
  ============================== */
  const renderColumn = (title, type, description) => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-xs text-gray-500">{description}</p>

      <button
        onClick={() => navigate(`/inspeccion/${type}/new`)}
        className="px-3 py-2 bg-black text-white rounded text-sm"
      >
        + Nueva inspección
      </button>

      <div className="space-y-2">
        {byType[type].length === 0 ? (
          <p className="text-xs text-gray-400">
            No hay inspecciones registradas.
          </p>
        ) : (
          byType[type].map((item) => (
            <div
              key={item.id}
              className="border rounded p-2 text-xs flex flex-col gap-1"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {item.data?.cliente?.nombre || "Sin cliente"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    item.status === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <span className="text-[10px] text-gray-500">
                {new Date(item.updatedAt || item.createdAt).toLocaleString()}
              </span>

              <div className="flex gap-3 pt-1">
                {item.status === "completado" && (
                  <button
                    type="button"
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-600 hover:underline"
                  >
                    PDF
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpen(type, item.id)}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </button>

                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => {
                    if (confirm("¿Eliminar inspección?")) {
                      const filtered = inspections.filter(
                        (i) => i.id !== item.id
                      );
                      localStorage.setItem(
                        "inspections",
                        JSON.stringify(filtered)
                      );
                      setInspections(filtered);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">Inspección y valoración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn(
          "Hidrosuccionador",
          "hidro",
          "Inspección general del equipo hidrosuccionador"
        )}

        {renderColumn(
          "Barredora",
          "barredora",
          "Inspección y valoración de barredoras"
        )}

        {renderColumn(
          "Cámara (VCAM / Metrotech)",
          "camara",
          "Inspección con sistema de cámara"
        )}
      </div>
    </div>
  );
}
