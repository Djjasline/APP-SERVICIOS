import React from "react";
import { Routes, Route } from "react-router-dom";

import InspectionSelector from "./pages/InspectionSelector";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";

const InspectionRoutes = () => {
  return (
    <Routes>
      <Route index element={<InspectionSelector />} />
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
      <Route path="camara" element={<HojaInspeccionCamara />} />
    </Routes>
  );
};

export default InspectionRoutes;
