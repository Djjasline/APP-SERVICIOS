import React from "react";
import { useNavigate } from "react-router-dom";

const IndexInspeccion = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Título */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Inspección y valoración de equipos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona el tipo de equipo a inspeccionar.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Hidro */}
          <div className="bg-white border rounded-xl p-5 space-y-3 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              Hidrosuccionadora
            </h2>
            <p className="text-sm text-slate-600">
              Inspección hidráulica y valoración general del equipo.
            </p>
            <button
              onClick={() => navigate("/inspeccion/hidro")}
              className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Ver historial
            </button>
          </div>

          {/* Barredora */}
          <div className="bg-white border rounded-xl p-5 space-y-3 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              Barredora
            </h2>
            <p className="text-sm text-slate-600">
              Inspección y evaluación de barredoras.
            </p>
            <button
              onClick={() => navigate("/inspeccion/barredora")}
              className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Ver historial
            </button>
          </div>

          {/* Cámara */}
          <div className="bg-white border rounded-xl p-5 space-y-3 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              Cámara (VCAM / Metrotech)
            </h2>
            <p className="text-sm text-slate-600">
              Inspección de cámaras de tuberías.
            </p>
            <button
              onClick={() => navigate("/inspeccion/camara")}
              className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Ver historial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexInspeccion;
