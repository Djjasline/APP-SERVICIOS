import React from "react";
import { useNavigate } from "react-router-dom";
import {
  getInspections,
  createInspection,
} from "../utilidades/inspectionStorage";

/* ===============================
   CARD REUTILIZABLE
================================ */
const Card = ({ title, type, description }) => {
  const navigate = useNavigate();
  const inspections = getInspections(type);

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      {/* NUEVA INSPECCIÓN */}
      <button
        onClick={() => {
          const inspection = createInspection(type);
          navigate(`/inspeccion/${type}/${inspection.id}`);
        }}
        className="px-3 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800"
      >
        + Nueva inspección
      </button>

      {/* HISTORIAL */}
      <div className="pt-2">
        <p className="text-xs font-medium text-slate-500 mb-2">
          Historial
        </p>

        {inspections.length === 0 ? (
          <p className="text-xs text-slate-400">
            No hay inspecciones aún.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {inspections.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border rounded px-2 py-1"
              >
                <span>
                  {item.cliente || "Sin cliente"} —{" "}
                  <span className="text-xs text-slate-500">
                    {item.estado}
                  </span>
                </span>

                <button
                  onClick={() =>
                    navigate(`/inspeccion/${type}/${item.id}`)
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  Abrir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ===============================
   PANTALLA PRINCIPAL INSPECCIÓN
================================ */
export default function IndexInspeccion() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
