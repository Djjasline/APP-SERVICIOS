import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion.jsx";

import HojaInspeccionHidro from "./HojaInspeccionHidro.jsx";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora.jsx";
import HojaInspeccionCamara from "./HojaInspeccionCamara.jsx";

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
