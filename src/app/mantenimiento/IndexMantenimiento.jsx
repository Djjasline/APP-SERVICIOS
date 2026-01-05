import React from "react";
import { useNavigate } from "react-router-dom";

export default function IndexMantenimiento() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Servicio de mantenimiento
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* MANTENIMIENTO HIDRO */}
          <div className="bg-white border rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold">
              Hidrosuccionador
            </h2>

            <p className="text-sm text-slate-600">
              Servicio de mantenimiento para equipos hidrosuccionadores.
            </p>

            <button
              onClick={() => navigate("/mantenimiento/hidro")}
              className="mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
                         bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Nuevo mantenimiento
            </button>
          </div>

          {/* MANTENIMIENTO BARREDORA */}
          <div className="bg-white border rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold">
              Barredora
            </h2>

            <p className="text-sm text-slate-600">
              Servicio de mantenimiento para equipos barredora.
            </p>

            <button
              onClick={() => navigate("/mantenimiento/barredora")}
              className="mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
                         bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              Nuevo mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
