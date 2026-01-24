import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HojaFirma from "./HojaFirma";
import InspeccionHidroPdf from "./pages/pdf/InspeccionHidroPdf";

export default function InspectionRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInspeccion />} />

      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="hidro/:id/pdf" element={<InspeccionHidroPdf />} />

      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      <Route path="hidro/:id/firma" element={<HojaFirma />} />
    </Routes>
  );
}
