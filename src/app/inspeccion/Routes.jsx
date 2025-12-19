import { Routes, Route } from "react-router-dom";

import ReportHistoryManagement from "./pages/report-history-management";
import HidroInspeccion from "./pages/hidro";
import BarredoraInspeccion from "./pages/barredora";

export default function InspeccionRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ReportHistoryManagement />} />
      <Route path="/hidro" element={<HidroInspeccion />} />
      <Route path="/barredora" element={<BarredoraInspeccion />} />
    </Routes>
  );
}
