import { Routes, Route, Navigate } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HojaFirma from "./HojaFirma";

export default function InspectionRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInspeccion />} />

      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      <Route path="hidro/:id/firma" element={<HojaFirma />} />

      {/* 🔒 CAPTURA DE RUTA PDF INVÁLIDA */}
      <Route
        path="hidro/:id/pdf"
        element={<Navigate to="/inspeccion" replace />}
      />
    </Routes>
  );
}
