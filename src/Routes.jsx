import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

// Módulos
import InformeRoutes from "./app/informe/Routes";
import InspectionRoutes from "./app/inspeccion/Routes";
import MaintenanceRoutes from "./app/mantenimiento/Routes";
import RegistroRoutes from "./app/registro/Routes";
import HojaRecepcion from "./app/recepcion/HojaRecepcion";

// 🔥 NUEVO (cuando lo tengas)
import LiberacionRoutes from "./app/liberacion/Routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 TODO DENTRO DEL LAYOUT */}
        <Route path="/" element={<MainLayout />}>

          {/* DASHBOARD */}
          <Route index element={<PanelServicios />} />

          {/* INFORME */}
          <Route path="informe/*" element={<InformeRoutes />} />

          {/* INSPECCIÓN */}
          <Route path="inspeccion/*" element={<InspectionRoutes />} />

          {/* MANTENIMIENTO */}
          <Route path="mantenimiento/*" element={<MaintenanceRoutes />} />

          {/* HERRAMIENTAS */}
          <Route path="registro-salida/*" element={<RegistroRoutes />} />

          {/* RECEPCIÓN */}
          <Route path="recepcion" element={<HojaRecepcion />} />

          {/* 🔥 LIBERACIÓN */}
          <Route path="liberacion/*" element={<LiberacionRoutes />} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
