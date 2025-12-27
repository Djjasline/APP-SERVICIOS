import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion.jsx";

import HojaInspeccionHidro from "./HojaInspeccionHidro/index.jsx";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora/index.jsx";
import HojaInspeccionCamara from "./HojaInspeccionCamara/index.jsx";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* 📌 MENÚ DE INSPECCIONES */}
      <Route index element={<IndexInspeccion />} />

      {/* 📄 FORMATOS */}
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
      <Route path="camara" element={<HojaInspeccionCamara />} />
    </Routes>
  );
}
