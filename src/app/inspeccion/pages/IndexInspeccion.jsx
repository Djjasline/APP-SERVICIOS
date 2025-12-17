// src/app/inspeccion/pages/IndexInspeccion.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const IndexInspeccion = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">
            Inspección y valoración de equipos
          </h1>
          <p className="text-sm text-slate-600">
            Seleccione el tipo de equipo a inspeccionar.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hidrosuccionador */}
          <div className="bg-white border rounded-xl p-6 shadow space-y-3">
            <h2 className="font-semibold text-slate-900">
              Inspección Hidrosuccionador
            </h2>
            <p className="text-sm text-slate-600">
              Formato de inspección hidráulica del equipo.
            </p>
            <button
              onClick={() => navigate("/inspeccion/hidrosuccionador")}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
            >
              Ingresar
            </button>
          </div>

          {/* Barredora */}
          <div className="bg-white border rounded-xl p-6 shadow space-y-3">
            <h2 className="font-semibold text-slate-900">
              Inspección Barredora
            </h2>
            <p className="text-sm text-slate-600">
              Formato de inspección para equipos barredores.
            </p>
            <button
              onClick={() => navigate("/inspeccion/barredora")}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexInspeccion;
