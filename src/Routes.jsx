import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

// Informe general
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";

// Módulo inspección
import InspectionRoutes from "./app/inspeccion/Routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 MENÚ PRINCIPAL */}
        <Route path="/" element={<PanelServicios />} />

        {/* 📄 INFORME GENERAL */}
        <Route
          path="/report-history-management"
          element={<ReportHistoryManagement />}
        />
        <Route
          path="/service-report-creation"
          element={<ServiceReportCreation />}
        />
        <Route path="/pdf-report-preview" element={<PDFReportPreview />} />
        <Route
          path="/email-integration-interface"
          element={<EmailIntegrationInterface />}
        />
        <Route
          path="/digital-signature-capture"
          element={<DigitalSignatureCapture />}
        />

        {/* 🔍 INSPECCIONES */}
        <Route path="/inspeccion/*" element={<InspectionRoutes />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
