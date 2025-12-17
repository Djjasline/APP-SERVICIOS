// src/app/inspeccion/Routes.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";

const InspeccionHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Inspección y valoración de equipos
        </h1>
        <p className="text-sm text-slate-600">
          Selecciona el tipo de inspección que deseas realizar.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("hidrosuccionador")}
            className="bg-white border rounded-xl p-6 text-left hover:shadow transition"
          >
            <h2 className="font-semibold text-lg">
              Inspección Hidrosuccionador
            </h2>
            <p className="text-sm text-slate-500">
              Formato de inspección hidráulica.
            </p>
          </button>

          <button
            onClick={() => navigate("barredora")}
            className="bg-white border rounded-xl p-6 text-left hover:shadow transition"
          >
            <h2 className="font-semibold text-lg">
              Inspección Barredora
            </h2>
            <p className="text-sm text-slate-500">
              Formato de inspección para barredoras.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

const InspeccionRoutes = () => {
  return (
    <Routes>
      <Route index element={<InspeccionHome />} />
      <Route path="hidrosuccionador" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
    </Routes>
  );
};

export default InspeccionRoutes;
