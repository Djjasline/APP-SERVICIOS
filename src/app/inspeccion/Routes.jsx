import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HistorialInspecciones from "./HistorialInspecciones";
import HojaFirma from "./HojaFirma";

/* ✅ PDF SOLO HIDRO */
import InspeccionHidroPDF from "./pages/InspeccionHidroPDF";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* MENÚ PRINCIPAL */}
      <Route index element={<IndexInspeccion />} />

      {/* HISTORIAL (si lo usas) */}
      <Route path="hidro/historial" element={<HistorialInspecciones />} />

      {/* FORMULARIOS */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      {/* FIRMA */}
      <Route path="hidro/:id/firma" element={<HojaFirma />} />

      {/* ✅ PDF HIDRO */}
      <Route path="hidro/:id/pdf" element={<InspeccionHidroPDF />} />
    </Routes>
  );
}
