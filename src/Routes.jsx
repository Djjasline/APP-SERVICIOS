import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// PANEL
import PanelServicios from "./pages/PanelServicios";

// SUBMENÚS (ÁREAS)
import AreaVehiculos from "./pages/AreaVehiculos";
import AreaAgua from "./pages/AreaAgua";
import AreaPetroleo from "./pages/AreaPetroleo";
import AreaOperaciones from "./pages/AreaOperaciones";
import AreaRepositorios from "./pages/AreaRepositorios";

// INFORMES
import InformeHome from "./app/informe/InformeHome";
import NuevoInforme from "./app/informe/NuevoInforme";

// INSPECCIONES
import IndexInspeccion from "./app/inspeccion/HistorialInspecciones";
import HojaInspeccionHidro from "./app/inspeccion/HojaInspeccionHidro";

// OPERACIONES (FORMULARIOS YA EXISTENTES)
import LiberacionHome from "./app/liberacion/LiberacionHome";
import LiberacionForm from "./app/liberacion/LiberacionForm";

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 Layout con sidebar */}
        <Route element={<MainLayout />}>

          {/* ================= PANEL PRINCIPAL ================= */}
          <Route path="/" element={<PanelServicios />} />

          {/* ================= ÁREAS ================= */}
          <Route path="/area/vehiculos" element={<AreaVehiculos />} />
          <Route path="/area/agua" element={<AreaAgua />} />
          <Route path="/area/petroleo" element={<AreaPetroleo />} />

          {/* ================= MÓDULOS PRINCIPALES ================= */}
          <Route path="/operaciones" element={<AreaOperaciones />} />
          <Route path="/repositorios" element={<AreaRepositorios />} />

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
          <Route
            path="/mantenimiento"
            element={<div className="p-6">Mantenimiento en construcción</div>}
          />

          {/* ================= OPERACIONES (FUNCIONALES) ================= */}
          <Route path="/liberacion" element={<LiberacionHome />} />
          <Route path="/liberacion/new" element={<LiberacionForm />} />

          <Route
            path="/recepcion"
            element={<div className="p-6">Recepción</div>}
          />

          <Route
            path="/registro"
            element={<div className="p-6">Herramientas</div>}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
