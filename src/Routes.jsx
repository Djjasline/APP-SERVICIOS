import PanelServicios from "./pages/panel-servicios";
import InspectionRoutes from "./app/inspeccion/Routes";

<RouterRoutes>
  {/* PANEL GENERAL */}
  <Route path="/" element={<PanelServicios />} />

  {/* INFORMES */}
  <Route path="/reports" element={<ReportHistoryManagement />} />
  <Route path="/service-report-creation" element={<ServiceReportCreation />} />

  {/* INSPECCIONES */}
  <Route path="/inspeccion/*" element={<InspectionRoutes />} />

  <Route path="*" element={<NotFound />} />
</RouterRoutes>
