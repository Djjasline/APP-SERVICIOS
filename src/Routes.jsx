import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReportHistoryManagement from "./pages/report-history-management";
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";

/* INSPECCIONES (rutas reales) */
import HojaInspeccionHidro from "./app/inspeccion/pages/hidro";
import HojaInspeccionBarredora from "./app/inspeccion/pages/barredora";
import HojaInspeccionCamara from "./app/inspeccion/pages/camara/HojaInspeccionCamara";

import NotFound from "./pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MENÚ PRINCIPAL */}
        <Route path="/" element={<ReportHistoryManagement />} />

        {/* INFORMES */}
        <Route path="/service-report-creation" element={<ServiceReportCreation />} />
        <Route path="/pdf-report-preview" element={<PDFReportPreview />} />
        <Route path="/email-integration-interface" element={<EmailIntegrationInterface />} />
        <Route path="/digital-signature-capture" element={<DigitalSignatureCapture />} />

        {/* INSPECCIONES */}
        <Route path="/inspeccion/hidro" element={<HojaInspeccionHidro />} />
        <Route path="/inspeccion/barredora" element={<HojaInspeccionBarredora />} />
        <Route path="/inspeccion/camara" element={<HojaInspeccionCamara />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
