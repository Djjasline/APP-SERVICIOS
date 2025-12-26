// src/app/inspeccion/Routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ===== Formularios de inspección ===== */
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";

const InspectionRoutes = () => {
  return (
    <Routes>
      {/* Ruta base: redirige a hidrosuccionador */}
      <Route index element={<Navigate to="hidro" replace />} />

      {/* Inspección Hidrosuccionador */}
      <Route
        path="hidro"
        element={<HojaInspeccionHidro />}
      />

      {/* Inspección Barredora */}
      <Route
        path="barredora"
        element={<HojaInspeccionBarredora />}
      />
    </Routes>
  );
};

export default InspectionRoutes;
