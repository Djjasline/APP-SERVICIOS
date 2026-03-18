import { BrowserRouter, Routes, Route } from "react-router-dom";

import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

// Módulo informe
import InformeRoutes from "./app/informe/Routes";

// Módulo inspección
import InspectionRoutes from "./app/inspeccion/Routes";

// Módulo mantenimiento
import MaintenanceRoutes from "./app/mantenimiento/Routes";

// 🔥 Módulo registro herramientas
import RegistroRoutes from "./app/registro/Routes";

// 🔥 NUEVO MÓDULO RECEPCIÓN
import HojaRecepcion from "./app/recepcion/HojaRecepcion";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MENÚ PRINCIPAL */}
        <Route path="/" element={<PanelServicios />} />

        {/* INFORME GENERAL */}
        <Route path="/informe/*" element={<InformeRoutes />} />

        {/* INSPECCIONES */}
        <Route path="/inspeccion/*" element={<InspectionRoutes />} />

        {/* MANTENIMIENTO */}
        <Route path="/mantenimiento/*" element={<MaintenanceRoutes />} />

        {/* 🔥 CONTROL DE HERRAMIENTAS */}
        <Route path="/registro-salida/*" element={<RegistroRoutes />} />

        {/* 🚛 RECEPCIÓN VEHICULAR */}
        <Route path="/recepcion" element={<HojaRecepcion />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
