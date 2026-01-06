import { Routes, Route } from "react-router-dom";
import IndexMantenimiento from "./IndexMantenimiento";
import HojaMantenimientoHidro from "./HojaMantenimientoHidro";
import HojaMantenimientoBarredora from "./HojaMantenimientoBarredora";

export default function MantenimientoRoutes() {
  return (
    <Routes>
      <Route index element={<IndexMantenimiento />} />
      <Route path="hidro" element={<HojaMantenimientoHidro />} />
      <Route path="barredora" element={<HojaMantenimientoBarredora />} />
    </Routes>
  );
}
