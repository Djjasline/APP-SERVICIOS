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

// 👇 IMPORTANTE
import InspeccionRoutes from "./app/inspeccion/Routes";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Pantalla inicial */}
          <Route path="/" element={<ReportHistoryManagement />} />

          <Route
            path="/report-history-management"
            element={<ReportHistoryManagement />}
          />

          {/* Informe general */}
          <Route
            path="/service-report-creation"
            element={<ServiceReportCreation />}
          />

          {/* Inspecciones */}
          <Route path="/inspeccion/*" element={<InspeccionRoutes />} />

          {/* Otros */}
          <Route
            path="/digital-signature-capture"
            element={<DigitalSignatureCapture />}
          />
          <Route path="/pdf-report-preview" element={<PDFReportPreview />} />
          <Route
            path="/email-integration-interface"
            element={<EmailIntegrationInterface />}
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
