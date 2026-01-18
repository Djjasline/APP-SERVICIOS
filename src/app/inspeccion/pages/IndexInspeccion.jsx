import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInspections } from "@/utils/inspectionStorage";
import { generarInformePdf } from "@/utils/generarInformePdf";

/* =========================
   Badge de estado
========================= */
const StatusBadge = ({ estado }) => {
  const styles = {
    borrador: "bg-yellow-100 text-yellow-800",
    completada: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[estado] || "bg-gray-100 text-gray-700"
      }`}
    >
      {estado}
    </span>
  );
};

/* =========================
   Card por tipo de inspección
========================= */
const Card = ({ title, type, description }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("todas");

  // 🔹 SOLO inspecciones del tipo actual
  const inspections = getAllInspections()
    .filter((i) => i.type === type)
    .filter((i) =>
      filter === "todas" ? true : i.estado === filter
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const crearNuevaInspeccion = () => {
    const id = crypto.randomUUID();
    navigate(`/inspeccion/${type}/${id}`);
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <button
        onClick={crearNuevaInspeccion}
        className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white"
      >
        + Nueva inspección
      </button>

      {/* FILTROS */}
      <div className="flex gap-2 text-xs">
        {["todas", "borrador", "completada"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded border ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* HISTORIAL */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">
          Historial
        </p>

        {inspections.length === 0 ? (
          <p className="text-xs text-gray-400">
            No hay inspecciones aún.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {inspections.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border rounded px-2 py-1"
              >
                <span className="truncate">
                  {item.data?.cliente || "Sin cliente"}
                </span>

                <div className="flex items-center gap-2">
                  <StatusBadge estado={item.estado} />

                  <button
                    onClick={() =>
                      navigate(`/inspeccion/${type}/${item.id}`)
                    }
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Abrir
                  </button>

                  {item.estado === "completada" && (
                    <button
                      onClick={() =>
                        generarInformePdf({
                          type,
                          inspection: item,
                        })
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      PDF
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* =========================
   INDEX INSPECCIÓN
========================= */
export default function IndexInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al panel principal
        </button>

        <h1 className="text-2xl font-semibold">
          Inspección y valoración
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            title="Hidrosuccionador"
            type="hidro"
            description="Inspección del equipo hidrosuccionador."
          />

          <Card
            title="Barredora"
            type="barredora"
            description="Inspección y valoración de barredoras."
          />

          <Card
            title="Cámara (VCAM / Metrotech)"
            type="camara"
            description="Inspección con sistema de cámara."
          />
        </div>
      </div>
    </div>
  );
}
