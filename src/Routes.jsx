// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PanelServicios from "./pages/PanelServicios";
import ReportHistoryManagement from "./pages/report-history-management";
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import NotFound from "./pages/NotFound";

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Menú principal */}
        <Route path="/" element={<PanelServicios />} />

        {/* Informes */}
        <Route
          path="/report-history-management"
          element={<ReportHistoryManagement />}
        />
        <Route
          path="/service-report-creation"
          element={<ServiceReportCreation />}
        />
        <Route path="/pdf-report-preview" element={<PDFReportPreview />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
