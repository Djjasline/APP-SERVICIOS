// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Páginas principales
import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

// Módulo informes de servicio
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";

// Módulo inspección (rutas hijas)
import InspectionRoutes from "./app/inspeccion/Routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />

        <Routes>
          {/* =============================
              PANEL PRINCIPAL
          ============================== */}
          <Route path="/" element={<PanelServicios />} />

          {/* =============================
              INFORMES DE SERVICIO
          ============================== */}
          <Route
            path="/report-history-management"
            element={<ReportHistoryManagement />}
          />

          <Route
            path="/service-report-creation"
            element={<ServiceReportCreation />}
          />

          <Route
            path="/pdf-report-preview"
            element={<PDFReportPreview />}
          />

          <Route
            path="/digital-signature-capture"
            element={<DigitalSignatureCapture />}
          />

          <Route
            path="/email-integration-interface"
            element={<EmailIntegrationInterface />}
          />

          {/* =============================
              INSPECCIÓN Y VALORACIÓN
              (IMPORTANTE EL *)
          ============================== */}
          <Route
            path="/inspeccion/*"
            element={<InspectionRoutes />}
          />

          {/* =============================
              404
          ============================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>

      </ErrorBoundary>
    </BrowserRouter>
  );
}
