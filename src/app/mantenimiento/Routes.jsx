import { Routes, Route, Navigate } from "react-router-dom";

import IndexMantenimiento from "./IndexMantenimiento";

// =============================
// HIDRO
// =============================
import MantenimientoHidroHome from "./MantenimientoHidroHome";
import HojaMantenimientoHidro from "./HojaMantenimientoHidro";
import MantenimientoHidroPdf from "./pdf/MantenimientoHidroPdf";

// =============================
// BARREDORA
// =============================
import MantenimientoBarredoraHome from "./MantenimientoBarredoraHome";
import HojaMantenimientoBarredora from "./HojaMantenimientoBarredora";
import MantenimientoBarredoraPdf from "./pdf/MantenimientoBarredoraPdf";

export default function RoutesMantenimiento() {
  return (
    <Routes>
      {/* =============================
          HOME GENERAL
      ============================== */}
      <Route index element={<IndexMantenimiento />} />

      {/* =============================
          HIDRO
      ============================== */}
      <Route path="hidro" element={<MantenimientoHidroHome />} />
      <Route path="hidro/crear" element={<HojaMantenimientoHidro />} />
      <Route path="hidro/:id" element={<HojaMantenimientoHidro />} />
      <Route path="hidro/:id/pdf" element={<MantenimientoHidroPdf />} />

      {/* =============================
          BARREDORA
      ============================== */}
      <Route path="barredora" element={<MantenimientoBarredoraHome />} />
      <Route path="barredora/crear" element={<HojaMantenimientoBarredora />} />
      <Route path="barredora/:id" element={<HojaMantenimientoBarredora />} />
      <Route path="barredora/:id/pdf" element={<MantenimientoBarredoraPdf />} />

      {/* =============================
          FALLBACK
      ============================== */}
      <Route path="*" element={<Navigate to="/mantenimiento" replace />} />
    </Routes>
  );
}
