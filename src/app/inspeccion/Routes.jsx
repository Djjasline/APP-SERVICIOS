// src/app/inspeccion/Routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Formularios de inspección
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";

const InspeccionRoutes = () => {
  return (
    <Routes>
      {/* Hidrosuccionador */}
      <Route
        path="hidrosuccionador"
        element={<HojaInspeccionHidro />}
      />

      {/* Barredora */}
      <Route
        path="barredora"
        element={<HojaInspeccionBarredora />}
      />
    </Routes>
  );
};

export default InspeccionRoutes;
