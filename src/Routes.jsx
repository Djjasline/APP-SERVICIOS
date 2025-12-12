// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

import ServiceReportCreation from "./pages/service-report-creation";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";

// Nueva pantalla de inicio general
import Home from "./pages/home";

// App de inspección hidráulica migrada
import InspeccionHidro from "./app/inspeccion";

// Placeholder para mantenimientos (cuando lo usemos)
import MaintenanceMenu from "./pages/maintenance-menu";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* ✅ Pantalla inicial general */}
          <Route path="/" element={<Home />} />

          {/* 1. Informe general de servicios */}
          <Route
            path="/report-history-management"
            element={<ReportHistoryManagement />}
          />
          <Route
            path="/service-report-creation"
            element={<ServiceReportCreation />}
          />
          <Route
            path="/digital-signature-capture"
            element={<DigitalSignatureCapture />}
          />
          <Route path="/pdf-report-preview" element={<PDFReportPreview />} />
          <Route
            path="/email-integration-interface"
            element={<EmailIntegrationInterface />}
          />

          {/* 2. Inspección y valoración de equipos */}
          <Route path="/inspeccion-hidro" element={<InspeccionHidro />} />

          {/* 3. Servicio de mantenimientos (placeholder) */}
          <Route path="/mantenimiento" element={<MaintenanceMenu />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
