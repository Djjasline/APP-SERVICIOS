import { BrowserRouter, Routes, Route } from "react-router-dom";

import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

// Informe general
import ServiceReportCreation from "./pages/service-report-creation";
import ServiceReportHistory from "./pages/service-report-history";
import ServiceReportPreview from "./pages/service-report-preview";

// Módulo inspección
import InspectionRoutes from "./app/inspeccion/Routes";

// Módulo mantenimiento
import MaintenanceRoutes from "./app/mantenimiento/Routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MENÚ PRINCIPAL */}
        <Route path="/" element={<PanelServicios />} />

        {/* INFORME GENERAL */}
        <Route
          path="/service-report-creation/:id?"
          element={<ServiceReportCreation />}
        />
        <Route
          path="/service-report-history"
          element={<ServiceReportHistory />}
        />
        <Route
          path="/service-report-preview"
          element={<ServiceReportPreview />}
        />

        {/* INSPECCIONES */}
        <Route path="/inspeccion/*" element={<InspectionRoutes />} />

        {/* MANTENIMIENTO */}
        <Route path="/mantenimiento/*" element={<MaintenanceRoutes />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
