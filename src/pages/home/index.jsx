import Home from "./pages/home";
import ReportHistoryManagement from "./pages/report-history-management";

<RouterRoutes>
  {/* ✅ PANEL GENERAL */}
  <Route path="/" element={<Home />} />

  {/* INFORMES */}
  <Route path="/reports" element={<ReportHistoryManagement />} />
  <Route path="/service-report-creation" element={<ServiceReportCreation />} />

  {/* INSPECCIONES */}
  <Route path="/inspeccion/*" element={<InspectionRoutes />} />

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</RouterRoutes>
