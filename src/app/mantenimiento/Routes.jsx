import { Routes, Route, Navigate } from "react-router-dom";

import IndexMantenimiento from "./IndexMantenimiento";

// HIDRO
import MantenimientoHidroHome from "./MantenimientoHidroHome";
import HojaMantenimientoHidro from "./HojaMantenimientoHidro";

// BARREDORA
import MantenimientoBarredoraHome from "./MantenimientoBarredoraHome";
import HojaMantenimientoBarredora from "./HojaMantenimientoBarredora";

export default function MantenimientoRoutes() {
  return (
    <Routes>
      {/* HOME GENERAL */}
      <Route index element={<IndexMantenimiento />} />

      {/* =============================
          HIDRO
      ============================== */}
      <Route path="hidro" element={<MantenimientoHidroHome />} />
      <Route path="hidro/crear" element={<HojaMantenimientoHidro />} />
      <Route path="hidro/:id" element={<HojaMantenimientoHidro />} />

      {/* =============================
          BARREDORA
      ============================== */}
      <Route path="barredora" element={<MantenimientoBarredoraHome />} />
      <Route path="barredora/crear" element={<HojaMantenimientoBarredora />} />
      <Route path="barredora/:id" element={<HojaMantenimientoBarredora />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/mantenimiento" replace />} />
    </Routes>
  );
}
