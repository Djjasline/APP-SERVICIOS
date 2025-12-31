import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "./utilidades/inspectionStorage";
import { useNavigate } from "react-router-dom";

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white border rounded-xl p-6 space-y-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Hoja de Inspección – Hidrosuccionador
        </h1>

        {/* AQUÍ VA TODO TU FORMULARIO REAL */}
        <div className="border rounded p-4 text-sm text-slate-600">
          Formulario de inspección (editable siempre)
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              markInspectionCompleted("hidro", id);
              alert("Inspección marcada como completada");
            }}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Marcar como completada
          </button>

          <button
            type="button"
            onClick={() => navigate("/inspeccion")}
            className="px-4 py-2 rounded-md border"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
