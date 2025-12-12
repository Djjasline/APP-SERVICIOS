// src/Routes.jsx
import React from "react";
import {
  BrowserRouter,
  Routes as RouterRoutes,
  Route,
} from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

// Pantalla de inicio
import Home from "./pages/home";

// Módulo 1: Informe general de servicios
import ServiceReportCreation from "./pages/service-report-creation";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";

// Módulo 2: Inspección hidráulica (placeholder)
import InspeccionHidro from "./app/inspeccion";

// Módulo 3: Mantenimiento (placeholder nuevo)
import Maintenance from "./pages/maintenance";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Inicio general */}
          <Route path="/" element={<Home />} />

          {/* Familia 1: Informes de servicio */}
          <Route path="/servicios" element={<ReportHistoryManagement />} />
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

          {/* Familia 2: Inspección y valoración */}
          <Route path="/inspeccion-hidro" element={<InspeccionHidro />} />

          {/* Familia 3: Mantenimientos */}
          <Route path="/mantenimiento" element={<Maintenance />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
