import React from "react";
import { Routes, Route } from "react-router-dom";

import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./pages/barredora";

export default function InspeccionRoutes() {
  return (
    <Routes>
      <Route path="hidro" element={<HojaInspeccionHidro />} />
      <Route path="barredora" element={<HojaInspeccionBarredora />} />
    </Routes>
  );
}
