import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";

const InspeccionRoutes = () => {
  return (
    <Routes>
      {/* Índice de inspecciones */}
      <Route index element={<IndexInspeccion />} />

      <Route
        path="hidrosuccionador"
        element={<HojaInspeccionHidro />}
      />

      <Route
        path="barredora"
        element={<HojaInspeccionBarredora />}
      />
    </Routes>
  );
};

export default InspeccionRoutes;
