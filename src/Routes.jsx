import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PanelServicios from "./pages/PanelServicios";
import ReportHistoryManagement from "./pages/report-history-management";
import ServiceReportCreation from "./pages/service-report-creation";

import InspectionRoutes from "./app/inspeccion/Routes";
import NotFound from "./pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MENÚ PRINCIPAL */}
        <Route path="/" element={<PanelServicios />} />

        {/* INFORMES */}
        <Route
          path="/report-history-management"
          element={<ReportHistoryManagement />}
        />
        <Route
          path="/service-report-creation"
          element={<ServiceReportCreation />}
        />

        {/* INSPECCIONES */}
        <Route path="/inspeccion/*" element={<InspectionRoutes />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
