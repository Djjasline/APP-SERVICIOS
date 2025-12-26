import React from "react";
import { useNavigate } from "react-router-dom";

const InspectionSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">
            Inspección y valoración de equipos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona el tipo de equipo para iniciar la inspección.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hidrosuccionador */}
          <button
            onClick={() => navigate("/inspeccion/hidro")}
            className="border rounded-xl p-6 text-left bg-white shadow hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Hidrosuccionador
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Inspección y valoración de equipos hidrosuccionadores.
            </p>
          </button>

          {/* Barredora */}
          <button
  onClick={() => navigate("/inspeccion/camara")}
  className="border rounded-xl p-6 text-left bg-white shadow hover:shadow-md transition"
>
  <h2 className="text-lg font-semibold text-slate-900">
    Cámara / VCAM / Metrotech
  </h2>
  <p className="text-sm text-slate-600 mt-2">
    Inspección con cámara de tuberías.
  </p>
</button>
        </div>
      </div>
    </div>
  );
};

export default InspectionSelector;
