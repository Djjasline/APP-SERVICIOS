import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HistorialInspecciones from "./HistorialInspecciones";
import HojaFirma from "./HojaFirma";

// 👉 NUEVO PDF
import InspeccionPdf from "./pdf/InspeccionPdf";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* MENÚ */}
      <Route index element={<IndexInspeccion />} />

      {/* HISTORIAL HIDRO (si lo usas aparte) */}
      <Route path="hidro/historial" element={<HistorialInspecciones />} />

      {/* FORMULARIOS */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      {/* FIRMA */}
      <Route path="hidro/:id/firma" element={<HojaFirma />} />

      {/* ✅ PDF (VISTA PREVIA / DESCARGA) */}
      <Route path=":type/:id/pdf" element={<InspeccionPdf />} />
    </Routes>
  );
}
