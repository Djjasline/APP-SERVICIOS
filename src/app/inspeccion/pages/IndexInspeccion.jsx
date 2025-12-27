import React from "react";
import { useNavigate } from "react-router-dom";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Inspección y valoración de equipos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona el tipo de inspección que deseas realizar.  
            Cada formato mantiene su propio historial.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HIDROSUCCIONADOR */}
          <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h2 className="font-semibold text-slate-900">
                Inspección Hidrosuccionadora
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Inspección y valoración de equipos hidrosuccionadores.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/inspeccion/hidro")}
                className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Nuevo
              </button>

              <button
                disabled
                className="px-4 py-2 rounded-md border text-sm text-slate-400 cursor-not-allowed"
              >
                Ver historial
              </button>
            </div>
          </div>

          {/* BARREDORA */}
          <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h2 className="font-semibold text-slate-900">
                Inspección Barredora
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Evaluación técnica de barredoras mecánicas.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/inspeccion/barredora")}
                className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Nuevo
              </button>

              <button
                disabled
                className="px-4 py-2 rounded-md border text-sm text-slate-400 cursor-not-allowed"
              >
                Ver historial
              </button>
            </div>
          </div>

          {/* CÁMARA */}
          <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h2 className="font-semibold text-slate-900">
                Inspección con Cámara
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Inspección con cámaras VCAM / Metrotech.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/inspeccion/camara")}
                className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Nuevo
              </button>

              <button
                disabled
                className="px-4 py-2 rounded-md border text-sm text-slate-400 cursor-not-allowed"
              >
                Ver historial
              </button>
            </div>
          </div>
        </div>

        {/* Nota inferior */}
        <p className="text-xs text-slate-400">
          * El historial se habilitará en la siguiente fase del desarrollo.
        </p>
      </div>
    </div>
  );
}
