import { Routes, Route } from "react-router-dom";

import ReportHistoryManagement from "./pages/report-history-management";
import HojaInspeccionHidro from "./HojaInspeccionHidro";
import HojaInspeccionBarredora from "./pages/barredora";

export default function InspeccionRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ReportHistoryManagement />} />
      <Route path="/hidro" element={<HidroInspeccion />} />
      <Route path="/barredora" element={<BarredoraInspeccion />} />
    </Routes>
  );
}
