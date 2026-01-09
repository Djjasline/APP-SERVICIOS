// APP-SERVICIOS/src/app/inspeccion/Routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import FirmaInspeccion from "./FirmaInspeccion";

<Route path="hidro/:id/firma" 
element={<FirmaInspeccion />} 
/>

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HistorialInspecciones from "./HistorialInspecciones";

/* ✅ NUEVO: pantalla aislada de firma */
import HojaFirma from "./HojaFirma";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* MENÚ DE INSPECCIONES */}
      <Route index element={<IndexInspeccion />} />

      {/* HISTORIAL HIDRO */}
      <Route
        path="hidro/historial"
        element={<HistorialInspecciones />}
      />

      {/* FORMULARIOS CON ID */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />

      {/* ✅ NUEVA RUTA DE FIRMA (AISLADA, SEGURA) */}
      <Route path="hidro/:id/firma" element={<HojaFirma />} />
    </Routes>
  );
}
