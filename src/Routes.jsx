import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* 🏠 PANEL PRINCIPAL */
import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

/* 📄 INFORME GENERAL (LEGADO / ACTUAL) */
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";

/* 🔍 MÓDULO INSPECCIÓN */
import InspectionRoutes from "./app/inspeccion/Routes.jsx";

/* 🛠️ MÓDULO MANTENIMIENTO */
import MantenimientoRoutes from "./app/mantenimiento/Routes.jsx";

/* 📚 HISTORIAL GLOBAL */
import Historial from "./app/historial/Historial";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================== */}
        {/* 🏠 MENÚ PRINCIPAL */}
        {/* ===================== */}
        <Route path="/" element={<PanelServicios />} />

        {/* ===================== */}
        {/* 📄 INFORME GENERAL */}
        {/* ===================== */}
        <Route
          path="/service-report-creation"
          element={<ServiceReportCreation />}
        />

        <Route
          path="/report-history-management"
          element={<ReportHistoryManagement />}
        />

        <Route
          path="/pdf-report-preview"
          element={<PDFReportPreview />}
        />

        <Route
          path="/email-integration-interface"
          element={<EmailIntegrationInterface />}
        />

        <Route
          path="/digital-signature-capture"
          element={<DigitalSignatureCapture />}
        />

        {/* ===================== */}
        {/* 🔍 INSPECCIONES */}
        {/* ===================== */}
        <Route path="/inspeccion/*" element={<InspectionRoutes />} />

        {/* ===================== */}
        {/* 🛠️ MANTENIMIENTO */}
        {/* ===================== */}
        <Route path="/mantenimiento/*" element={<MantenimientoRoutes />} />

        {/* ===================== */}
        {/* 📚 HISTORIAL */}
        {/* ===================== */}
        <Route path="/historial" element={<Historial />} />

        {/* ===================== */}
        {/* ❌ 404 */}
        {/* ===================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
