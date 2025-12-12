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

// 🔹 Nueva pantalla de inicio
import Home from "./pages/home";

// 🔹 Módulo 1: Informe general de servicios
import ServiceReportCreation from "./pages/service-report-creation";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";

// 🔹 Módulo 2: Inspección hidráulica (placeholder actual)
import InspeccionHidro from "./app/inspeccion";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* ======================= */}
          {/* Pantalla inicial general */}
          {/* ======================= */}
          <Route path="/" element={<Home />} />

          {/* ======================= */}
          {/* Familia 1: Informes de servicio */}
          {/* ======================= */}

          {/* Listado principal de informes de servicio */}
          <Route path="/servicios" element={<ReportHistoryManagement />} />

          {/* Alias para compatibilidad con el proyecto antiguo */}
          <Route
            path="/report-history-management"
            element={<ReportHistoryManagement />}
          />

          {/* Flujo de creación de informe */}
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

          {/* ======================= */}
          {/* Familia 2: Inspección y valoración de equipos */}
          {/* ======================= */}
          <Route path="/inspeccion-hidro" element={<InspeccionHidro />} />

          {/* ======================= */}
          {/* 404 */}
          {/* ======================= */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
