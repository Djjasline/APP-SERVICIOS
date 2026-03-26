import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// ================= PANEL =================
import PanelServicios from "./pages/PanelServicios";

// ================= ÁREAS =================
import AreaVehiculos from "./pages/AreaVehiculos";
import AreaAgua from "./pages/AreaAgua";
import AreaPetroleo from "./pages/AreaPetroleo";
import AreaOperaciones from "./pages/AreaOperaciones";
import AreaRepositorios from "./pages/AreaRepositorios";

// ================= INFORMES =================
import InformeHome from "./app/informe/InformeHome";
import NuevoInforme from "./app/informe/NuevoInforme";

// ================= INSPECCIONES =================
import HistorialInspecciones from "./app/inspeccion/HistorialInspecciones";
import HojaInspeccionHidro from "./app/inspeccion/HojaInspeccionHidro";
import HojaInspeccionBarredora from "./app/inspeccion/HojaInspeccionBarredora";
import HojaInspeccionCamara from "./app/inspeccion/HojaInspeccionCamara";

// ================= MANTENIMIENTO =================
import IndexMantenimiento from "./app/mantenimiento/IndexMantenimiento";
import HojaMantenimientoHidro from "./app/mantenimiento/HojaMantenimientoHidro";
import HojaMantenimientoBarredora from "./app/mantenimiento/HojaMantenimientoBarredora";

// ================= OPERACIONES =================
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
          <Route path="/inspeccion" element={<HistorialInspecciones />} />

          {/* HIDRO */}
          <Route path="/inspeccion/hidro/new" element={<HojaInspeccionHidro />} />
          <Route path="/inspeccion/hidro/:id" element={<HojaInspeccionHidro />} />

          {/* BARREDORA */}
          <Route path="/inspeccion/barredora/new" element={<HojaInspeccionBarredora />} />
          <Route path="/inspeccion/barredora/:id" element={<HojaInspeccionBarredora />} />

          {/* CAMARA */}
          <Route path="/inspeccion/camara/new" element={<HojaInspeccionCamara />} />
          <Route path="/inspeccion/camara/:id" element={<HojaInspeccionCamara />} />

          {/* ================= MANTENIMIENTO ================= */}
          <Route path="/mantenimiento" element={<IndexMantenimiento />} />

          {/* HIDRO */}
          <Route path="/mantenimiento/hidro/new" element={<HojaMantenimientoHidro />} />
          <Route path="/mantenimiento/hidro/:id" element={<HojaMantenimientoHidro />} />

          {/* BARREDORA */}
          <Route path="/mantenimiento/barredora/new" element={<HojaMantenimientoBarredora />} />
          <Route path="/mantenimiento/barredora/:id" element={<HojaMantenimientoBarredora />} />

          {/* ================= OPERACIONES ================= */}

<Route path="/liberacion" element={<LiberacionHome />} />
<Route path="/liberacion/new" element={<LiberacionForm />} />
<Route path="/liberacion/:id" element={<LiberacionDetalle />} />

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
