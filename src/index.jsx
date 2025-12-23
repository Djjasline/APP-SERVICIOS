// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PanelServicios from "./pages/panel-servicios";
import ReportHistoryManagement from "./pages/report-history-management";
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import NotFound from "./pages/NotFound";

// Inspecciones
import HojaInspeccionHidro from "./app/inspeccion/Hidro";
import HojaInspeccionBarredora from "./app/inspeccion/Barredora";
import HojaInspeccionCamara from "./app/inspeccion/Camara";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MENÚ PRINCIPAL */}
        <Route path="/" element={<PanelServicios />} />

        {/* INFORMES */}
        <Route
          path="/report-history-management"
          element={<ReportHistoryManagement />}
        />
        <Route
          path="/service-report-creation"
          element={<ServiceReportCreation />}
        />
        <Route path="/pdf-report-preview" element={<PDFReportPreview />} />

        {/* INSPECCIONES */}
        <Route path="/inspeccion/hidro" element={<HojaInspeccionHidro />} />
        <Route
          path="/inspeccion/barredora"
          element={<HojaInspeccionBarredora />}
        />
        <Route path="/inspeccion/camara" element={<HojaInspeccionCamara />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
