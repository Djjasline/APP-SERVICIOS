import React from "react";
import { Routes, Route } from "react-router-dom";

import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";

const InspeccionRoutes = () => {
  return (
    <Routes>
      {/* Ruta base del módulo de inspección */}
      <Route
        index
        element={
          <div className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white border rounded-xl p-6 space-y-4">
              <h1 className="text-xl font-semibold text-slate-900">
                Inspección y valoración de equipos
              </h1>

              <p className="text-sm text-slate-600">
                Selecciona el tipo de inspección que deseas realizar.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/inspeccion/hidro"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium text-center"
                >
                  Inspección Hidrosuccionador
                </a>

                <a
                  href="/inspeccion/barredora"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium text-center"
                >
                  Inspección Barredora
                </a>

                <a
                  href="/inspeccion/camara"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium text-center"
                >
                  Inspección Cámara (VCAM / Metrotech)
                </a>
              </div>
            </div>
          </div>
        }
      />

      {/* Formularios */}
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
      <Route path="camara" element={<HojaInspeccionCamara />} />
    </Routes>
  );
};

export default InspeccionRoutes;
