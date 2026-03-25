import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// páginas
import PanelServicios from "./pages/PanelServicios";

// módulos reales
import InformeHome from "./app/informe/InformeHome";
import IndexInspeccion from "./app/inspeccion/HistorialInspecciones";

// formularios
import NuevoInforme from "./app/informe/NuevoInforme";
import HojaInspeccionHidro from "./app/inspeccion/HojaInspeccionHidro";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 Layout principal con sidebar */}
        <Route element={<MainLayout />}>

          {/* PANEL PRINCIPAL */}
          <Route path="/" element={<PanelServicios />} />

          {/* ================= VEHÍCULOS ================= */}
          <Route path="/informes" element={<InformeHome />} />
          <Route path="/informe/nuevo" element={<NuevoInforme />} />
          <Route path="/informe/:id" element={<NuevoInforme />} />

          <Route path="/inspeccion" element={<IndexInspeccion />} />
          <Route path="/inspeccion/hidro/new" element={<HojaInspeccionHidro />} />
          <Route path="/inspeccion/hidro/:id" element={<HojaInspeccionHidro />} />

          {/* ================= TEMPORALES ================= */}
          <Route path="/mantenimiento" element={<div>Mantenimiento</div>} />

          {/* ================= OPERACIONES ================= */}
          <Route path="/herramientas" element={<div>Herramientas</div>} />
          <Route path="/recepcion" element={<div>Recepción</div>} />
          <Route path="/liberacion" element={<div>Liberación</div>} />

          {/* ================= REPOSITORIOS ================= */}
          <Route path="/repositorios/documentos" element={<div>Documentos</div>} />
          <Route path="/repositorios/pdf" element={<div>PDFs</div>} />
          <Route path="/repositorios/archivos" element={<div>Archivos</div>} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
