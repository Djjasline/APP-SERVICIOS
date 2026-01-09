import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HistorialInspecciones from "./HistorialInspecciones";
import HojaFirma from "./HojaFirma"; // 👈 IMPORTANTE

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* MENÚ */}
      <Route index element={<IndexInspeccion />} />

      {/* HISTORIAL */}
      <Route path="hidro/historial" element={<HistorialInspecciones />} />

      {/* FORMULARIOS */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      {/* FIRMA (ESTA ERA LA QUE FALTABA) */}
      <Route path="hidro/:id/firma" element={<HojaFirma />} />
    </Routes>
  );
}
