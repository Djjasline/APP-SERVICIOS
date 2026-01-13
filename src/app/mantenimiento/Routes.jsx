import { Routes, Route, Navigate } from "react-router-dom";

import IndexMantenimiento from "./IndexMantenimiento";

// HIDRO
import MantenimientoHidroHome from "./hidro/Home";
import HojaMantenimientoHidro from "./hidro/Form";

// BARREDORA
import MantenimientoBarredoraHome from "./barredora/Home";
import HojaMantenimientoBarredora from "./barredora/Form";

export default function MantenimientoRoutes() {
  return (
    <Routes>
      {/* HOME GENERAL */}
      <Route index element={<IndexMantenimiento />} />

      {/* =============================
          HIDRO
      ============================== */}
      <Route path="hidro">
        <Route index element={<MantenimientoHidroHome />} />
        <Route path="crear" element={<HojaMantenimientoHidro />} />
        <Route path=":id" element={<HojaMantenimientoHidro />} />
      </Route>

      {/* =============================
          BARREDORA
      ============================== */}
      <Route path="barredora">
        <Route index element={<MantenimientoBarredoraHome />} />
        <Route path="crear" element={<HojaMantenimientoBarredora />} />
        <Route path=":id" element={<HojaMantenimientoBarredora />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/mantenimiento" replace />} />
    </Routes>
  );
}
