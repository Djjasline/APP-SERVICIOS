import React, { useEffect } from "react";
import { addInspection } from "./utilidades/inspectionStorage";

export default function HojaInspeccionBarredora() {
  useEffect(() => {
    addInspection("barredora", {
      cliente: "",
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6 space-y-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Hoja de Inspección – Barredora
        </h1>

        <p className="text-sm text-slate-600">
          Inspección y valoración del equipo barredora.
        </p>

        {/* AQUÍ VA TU FORMULARIO */}
      </div>
    </div>
  );
}
