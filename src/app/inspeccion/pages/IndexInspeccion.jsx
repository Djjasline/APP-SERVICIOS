import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInspections } from "@/utils/inspectionStorage";

/* =========================
   Badge visual de estado
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
      {estado || "—"}
    </span>
  );
};

/* =========================
   Card reutilizable
========================= */
const Card = ({ title, type, description }) => {
  const navigate = useNavigate();

  // 🔑 SOLO usamos lo que EXISTE en inspectionStorage.js
  const inspections = getAllInspections().filter(
    (i) => i.type === type
  );

  const [filter, setFilter] = useState("todas");

  const filteredInspections = inspections
    .filter((i) =>
      filter === "todas" ? true : i.estado === filter
    )
    .sort(
      (a, b) =>
        new Date(b.fecha || 0) -
        new Date(a.fecha || 0)
    );

  const crearNuevaInspeccion = () => {
    const id = Date.now();
    navigate(`/inspeccion/${type}/${id}`);
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="text-sm text-slate-600">
          {description}
        </p>
      </div>

      <button
        onClick={crearNuevaInspeccion}
        className="px-3 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800"
      >
        + Nueva inspección
      </button>

      <div className="flex gap-2 text-xs">
        {["todas", "borrador", "completada"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded border ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          Historial
        </p>

        {filteredInspections.length === 0 ? (
          <p className="text-xs text-slate-400">
            No hay inspecciones aún.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {filteredInspections.map((item) => (
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
                      navigate(
                        `/inspeccion/${type}/${item.id}`
                      )
                    }
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Abrir
                  </button>
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
        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al panel principal
        </button>

        <h1 className="text-2xl font-semibold text-slate-900">
          Inspección y valoración
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            title="Hidrosuccionador"
            type="hidro"
            description="Inspección general del equipo hidrosuccionador."
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
