import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HistorialInspecciones from "./HistorialInspecciones";
import HojaFirma from "./HojaFirma";

export default function InspectionRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInspeccion />} />

      <Route path="hidro/historial" element={<HistorialInspecciones />} />

      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      <Route path="hidro/:id/firma" element={<HojaFirma />} />
    </Routes>
  );
}
