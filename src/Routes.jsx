import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔐 AUTH
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { AuthProvider } from "./context/AuthContext";

// 🧩 LAYOUT
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
import InformeHome from "./app/vehiculos/informe/InformeHome";
import NuevoInforme from "./app/vehiculos/informe/NuevoInforme";

// ================= INSPECCIONES =================
import HistorialInspecciones from "./app/vehiculos/inspeccion/HistorialInspecciones";
import HojaInspeccionHidro from "./app/vehiculos/inspeccion/HojaInspeccionHidro";
import HojaInspeccionBarredora from "./app/vehiculos/inspeccion/HojaInspeccionBarredora";
import HojaInspeccionCamara from "./app/vehiculos/inspeccion/HojaInspeccionCamara";

// ================= MANTENIMIENTO =================
import IndexMantenimiento from "./app/vehiculos/mantenimiento/IndexMantenimiento";
import HojaMantenimientoHidro from "./app/vehiculos/mantenimiento/HojaMantenimientoHidro";
import HojaMantenimientoBarredora from "./app/vehiculos/mantenimiento/HojaMantenimientoBarredora";

// ================= OPERACIONES =================
import LiberacionHome from "./app/operaciones/liberacion/LiberacionHome";
import LiberacionForm from "./app/operaciones/liberacion/LiberacionForm";
import LiberacionDetalle from "./app/operaciones/liberacion/LiberacionDetalle";

import RecepcionHome from "./app/operaciones/recepcion/RecepcionHome";
import HojaRecepcion from "./app/operaciones/recepcion/HojaRecepcion";

import RegistroHome from "./app/operaciones/registro/RegistroHome";

export default function RoutesApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🔐 LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 🔒 PROTEGIDO */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >

            {/* ================= PANEL ================= */}
            <Route path="/" element={<PanelServicios />} />

            {/* ================= ÁREAS ================= */}
            <Route path="/area/vehiculos" element={<RoleRoute allowedRoles={["admin","tecnico"]}><AreaVehiculos /></RoleRoute>} />
            <Route path="/area/agua" element={<RoleRoute allowedRoles={["admin","tecnico"]}><AreaAgua /></RoleRoute>} />
            <Route path="/area/petroleo" element={<RoleRoute allowedRoles={["admin","tecnico"]}><AreaPetroleo /></RoleRoute>} />
            <Route path="/operaciones" element={<RoleRoute allowedRoles={["admin","tecnico"]}><AreaOperaciones /></RoleRoute>} />

            {/* ADMIN */}
            <Route path="/repositorios" element={<RoleRoute allowedRoles={["admin"]}><AreaRepositorios /></RoleRoute>} />

            {/* ================= INFORMES ================= */}
            <Route path="/informe" element={<RoleRoute allowedRoles={["admin","tecnico"]}><InformeHome /></RoleRoute>} />
            <Route path="/informe/nuevo" element={<RoleRoute allowedRoles={["admin","tecnico"]}><NuevoInforme /></RoleRoute>} />
            <Route path="/informe/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><NuevoInforme /></RoleRoute>} />

            {/* ================= INSPECCIÓN ================= */}
            <Route path="/inspeccion" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HistorialInspecciones /></RoleRoute>} />

            <Route path="/inspeccion/hidro/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaInspeccionHidro /></RoleRoute>} />
            <Route path="/inspeccion/hidro/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaInspeccionHidro /></RoleRoute>} />

            <Route path="/inspeccion/barredora/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaInspeccionBarredora /></RoleRoute>} />
            <Route path="/inspeccion/barredora/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaInspeccionBarredora /></RoleRoute>} />

            <Route path="/inspeccion/camara/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaInspeccionCamara /></RoleRoute>} />
            <Route path="/inspeccion/camara/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaInspeccionCamara /></RoleRoute>} />

            {/* ================= MANTENIMIENTO ================= */}
            <Route path="/mantenimiento" element={<RoleRoute allowedRoles={["admin","tecnico"]}><IndexMantenimiento /></RoleRoute>} />

            <Route path="/mantenimiento/hidro/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaMantenimientoHidro /></RoleRoute>} />
            <Route path="/mantenimiento/hidro/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaMantenimientoHidro /></RoleRoute>} />

            <Route path="/mantenimiento/barredora/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaMantenimientoBarredora /></RoleRoute>} />
            <Route path="/mantenimiento/barredora/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaMantenimientoBarredora /></RoleRoute>} />

            {/* ================= LIBERACIÓN ================= */}
            <Route path="/liberacion" element={<RoleRoute allowedRoles={["admin","tecnico"]}><LiberacionHome /></RoleRoute>} />
            <Route path="/liberacion/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><LiberacionForm /></RoleRoute>} />
            <Route path="/liberacion/:id" element={<RoleRoute allowedRoles={["admin","tecnico"]}><LiberacionDetalle /></RoleRoute>} />

            {/* ================= RECEPCIÓN ================= */}
            <Route path="/recepcion" element={<RoleRoute allowedRoles={["admin","tecnico"]}><RecepcionHome /></RoleRoute>} />
            <Route path="/recepcion/new" element={<RoleRoute allowedRoles={["admin","tecnico"]}><HojaRecepcion /></RoleRoute>} />

            {/* ================= REGISTRO ================= */}
            <Route path="/registro" element={<RoleRoute allowedRoles={["admin","tecnico"]}><RegistroHome /></RoleRoute>} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
