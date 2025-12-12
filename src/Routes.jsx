// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

import HomeDashboard from "./pages/home";
import ServiceReportCreation from "./pages/service-report-creation";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";

// módulo de inspección (ya creado en src/app/inspeccion)
import InspeccionHidro from "./app/inspeccion";

// placeholder de mantenimiento
import MaintenanceLanding from "./pages/maintenance";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Pantalla de inicio con las 3 familias */}
          <Route path="/" element={<HomeDashboard />} />

          {/* 1. INFORME GENERAL DE SERVICIOS */}
          {/* Listado / historial */}
          <Route
            path="/informes-servicio"
            element={<ReportHistoryManagement />}
          />
          {/* Alias para compatibilidad con enlaces antiguos */}
          <Route
            path="/report-history-management"
            element={<ReportHistoryManagement />}
          />
          {/* Flujo del informe */}
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

          {/* 2. INSPECCIÓN Y VALORACIÓN DE EQUIPOS */}
          <Route path="/inspeccion" element={<InspeccionHidro />} />

          {/* 3. SERVICIO DE MANTENIMIENTOS */}
          <Route path="/mantenimiento" element={<MaintenanceLanding />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
