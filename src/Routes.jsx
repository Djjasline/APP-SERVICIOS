import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// PANEL
import PanelServicios from "./pages/PanelServicios";

// SUBMENÚS
import AreaVehiculos from "./pages/AreaVehiculos";

// INFORMES
import InformeHome from "./app/informe/InformeHome";
import NuevoInforme from "./app/informe/NuevoInforme";

// INSPECCIONES
import IndexInspeccion from "./app/inspeccion/HistorialInspecciones";
import HojaInspeccionHidro from "./app/inspeccion/HojaInspeccionHidro";

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 Layout con sidebar */}
        <Route element={<MainLayout />}>

          {/* ================= PANEL PRINCIPAL ================= */}
          <Route path="/" element={<PanelServicios />} />

          {/* ================= SUBMENÚ VEHÍCULOS ================= */}
          <Route path="/area/vehiculos" element={<AreaVehiculos />} />

          {/* ================= INFORMES ================= */}
          <Route path="/informe" element={<InformeHome />} />
          <Route path="/informe/nuevo" element={<NuevoInforme />} />
          <Route path="/informe/:id" element={<NuevoInforme />} />

          {/* ================= INSPECCIÓN ================= */}
          <Route path="/inspeccion" element={<IndexInspeccion />} />

          {/* HIDRO */}
          <Route path="/inspeccion/hidro/new" element={<HojaInspeccionHidro />} />
          <Route path="/inspeccion/hidro/:id" element={<HojaInspeccionHidro />} />

          {/* ================= MANTENIMIENTO ================= */}
          <Route path="/mantenimiento" element={<div>Mantenimiento en construcción</div>} />

          {/* ================= OPERACIONES ================= */}
          <Route path="/registro" element={<div>Herramientas</div>} />
          <Route path="/recepcion" element={<div>Recepción</div>} />
          <Route path="/liberacion" element={<div>Liberación</div>} />

          {/* ================= REPOSITORIOS ================= */}
          <Route path="/repositorios" element={<div>Repositorios</div>} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
