import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";

import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HojaFirma from "./HojaFirma";

/* ===== PDFS ===== */
import InspeccionHidroPdf from "./pages/pdf/InspeccionHidroPdf";
import InspeccionBarredoraPdf from "./pages/pdf/InspeccionBarredoraPdf";
import InspeccionCamaraPdf from "./pages/pdf/InspeccionCamaraPdf";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* ================= INDEX ================= */}
      <Route index element={<IndexInspeccion />} />

      {/* ================= HIDRO ================= */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="hidro/:id/pdf" element={<InspeccionHidroPdf />} />
      <Route path="hidro/:id/firma" element={<HojaFirma />} />

      {/* ================= BARREDORA ================= */}
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route
        path="barredora/:id/pdf"
        element={<InspeccionBarredoraPdf />}
      />

      {/* ================= CÁMARA ================= */}
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />
      <Route
        path="camara/:id/pdf"
        element={<InspeccionCamaraPdf />}
      />
    </Routes>
  );
}
