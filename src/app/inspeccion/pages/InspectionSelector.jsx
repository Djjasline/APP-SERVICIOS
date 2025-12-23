import React from "react";
import { useNavigate } from "react-router-dom";

const InspectionSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Inspección y valoración de equipos
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Hidrosuccionador</h2>
          <button
            className="btn-primary"
            onClick={() => navigate("/inspeccion/hidro")}
          >
            Ingresar
          </button>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Barredora</h2>
          <button
            className="btn-primary"
            onClick={() => navigate("/inspeccion/barredora")}
          >
            Ingresar
          </button>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Cámara (VCAM / Metrotech)</h2>
          <button
            className="btn-primary"
            onClick={() => navigate("/inspeccion/camara")}
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionSelector;
