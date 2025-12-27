import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* 📌 PANTALLA PRINCIPAL DEL MÓDULO INSPECCIÓN */}
      <Route index element={<IndexInspeccion />} />

      {/* 📄 FORMATOS */}
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
      <Route path="camara" element={<HojaInspeccionCamara />} />
    </Routes>
  );
}
