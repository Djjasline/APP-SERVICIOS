// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

// 🔹 Módulo 1: Informe general de servicios
import ServiceReportCreation from "./pages/service-report-creation";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";

// 🔹 Módulo 2: Hoja de Inspección Hidráulica (nuevo)
import InspeccionHidro from "./app/inspeccion"; // <- src/app/inspeccion/index.jsx

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Pantalla inicial (de momento dejamos el historial del informe general) */}
          <Route path="/" element={<ReportHistoryManagement />} />

          {/* Alias extra por compatibilidad */}
          <Route
            path="/report-history-management"
            element={<ReportHistoryManagement />}
          />

          {/* Flujo del Informe general de servicios */}
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

          {/* 🔹 Nueva ruta: Hoja de Inspección Hidráulica */}
          <Route path="/inspeccion-hidro" element={<InspeccionHidro />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
