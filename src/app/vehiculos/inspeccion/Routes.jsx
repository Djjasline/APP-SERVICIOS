import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";

import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HojaFirma from "./HojaFirma";

/* ===== PDFS ===== */
import InspeccionHidroPDF from "./InspeccionHidroPDF";
import InspeccionBarredoraPDF from "./InspeccionBarredoraPDF";
import InspeccionCamaraPDF from "./InspeccionCamaraPDF";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* ================= INDEX ================= */}
      <Route index element={<IndexInspeccion />} />

      {/* ================= HIDRO ================= */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="hidro/:id/pdf" element={<InspeccionHidroPDF />} />
      <Route path="hidro/:id/firma" element={<HojaFirma />} />

      {/* ================= BARREDORA ================= */}
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="barredora/:id/pdf" element={<InspeccionBarredoraPDF />} /> 
      <Route path="barredora/:id/firma" element={<HojaFirma />} />

      {/* ================= CÁMARA ================= */}
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />
      <Route path="camara/:id/pdf" element={<InspeccionCamaraPDF />} />
      <Route path="camara/:id/firma" element={<HojaFirma />} />
    </Routes>
  );
}
