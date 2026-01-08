// APP-SERVICIOS/src/app/inspeccion/Routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./pages/IndexInspeccion";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./HojaInspeccionBarredora";
import HojaInspeccionCamara from "./HojaInspeccionCamara";
import HistorialInspecciones from "./HistorialInspecciones";

export default function InspectionRoutes() {
  return (
    <Routes>
      {/* MENÚ DE INSPECCIONES */}
      <Route index element={<IndexInspeccion />} />

      {/* HISTORIAL HIDRO (NUEVO) */}
      <Route
        path="hidro/historial"
        element={<HistorialInspecciones />}
      />

      {/* FORMULARIOS CON ID */}
      <Route path="hidro/:id" element={<HojaInspeccionHidro />} />
      <Route path="barredora/:id" element={<HojaInspeccionBarredora />} />
      <Route path="camara/:id" element={<HojaInspeccionCamara />} />
    </Routes>
  );
}
