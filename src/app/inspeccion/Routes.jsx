import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./paginas/IndexInspeccion";
import HojaInspeccionCamara from "./HojaInspeccionCamara";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* Menú principal de inspección */}
      <Route index element={<IndexInspeccion />} />

      {/* Formatos disponibles */}
      <Route path="camara" element={<HojaInspeccionCamara />} />
    </Routes>
  );
}
