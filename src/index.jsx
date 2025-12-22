import React from "react";
import { Routes, Route } from "react-router-dom";

import InspectionSelector from "./pages/InspectionSelector";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";

const InspectionRoutes = () => {
  return (
    <Routes>
      {/* Selector */}
      <Route index element={<InspectionSelector />} />

      {/* Formularios */}
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
    </Routes>
  );
};

export default InspectionRoutes;
