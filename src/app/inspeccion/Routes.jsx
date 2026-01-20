import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HojaFirma from "./HojaFirma";

// ✅ PDF NUEVO (EL CORRECTO)
import InspeccionPdf from "./pdf/InspeccionPdf";

export default function InspectionRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInspeccion />} />

      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      <Route path="hidro/:id/firma" element={<HojaFirma />} />

      {/* ✅ PDF REAL */}
      <Route path="hidro/:id/pdf" element={<InspeccionPdf />} />
    </Routes>
  );
}
