import React from "react";
import { Routes, Route } from "react-router-dom";

import InspectionSelector from "./pages/InspectionSelector";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./pages/HojaInspeccionCamara";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* Selector principal */}
      <Route index element={<InspectionSelector />} />

      {/* Formatos */}
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
      <Route path="camara" element={<HojaInspeccionCamara />} />
    </Routes>
  );
}
