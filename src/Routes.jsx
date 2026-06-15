import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

// 🔐 AUTH
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { AuthProvider } from "./context/AuthContext";

// 🧩 LAYOUT
import MainLayout from "./layouts/MainLayout";

// ================= PANEL =================
import PanelServicios from "./pages/PanelServicios";

// ================= PERFIL =================
import Perfil from "./pages/Perfil";

// ================= ÁREAS =================
import AreaVehiculos from "./pages/AreaVehiculos";
import AreaAgua from "./pages/AreaAgua";
import AreaPetroleo from "./pages/AreaPetroleo";
import AreaOperaciones from "./pages/AreaOperaciones";
import AreaRepositorios from "./pages/AreaRepositorios";

// ================= INFORMES VEHÍCULOS =================
import InformeHome from "./app/vehiculos/informe/InformeHome";
import NuevoInforme from "./app/vehiculos/informe/NuevoInforme";
import InformePDF from "./app/vehiculos/informe/InformePDF";

// ================= INFORMES AGUA =================
import AguaInformeHome from "./app/agua/informe/InformeHome";
import AguaNuevoInforme from "./app/agua/informe/NuevoInforme";
import AguaInformePDF from "./app/agua/informe/InformePDF";
import InformeAguaRoutes from "@/app/agua/recorrido/informe/InformeAguaRoutes";

// ================= INFORMES PETRÓLEO =================
import PetroleoInformeHome from "./app/petroleo/informe/InformeHome";
import PetroleoNuevoInforme from "./app/petroleo/informe/NuevoInforme";
import PetroleoInformePDF from "./app/petroleo/informe/InformePDF";

// ================= INSPECCIONES =================
import HistorialInspecciones from "./app/vehiculos/inspeccion/HistorialInspecciones";
import HojaInspeccionHidro from "./app/vehiculos/inspeccion/HojaInspeccionHidro";
import HojaInspeccionBarredora from "./app/vehiculos/inspeccion/HojaInspeccionBarredora";
import HojaInspeccionCamara from "./app/vehiculos/inspeccion/HojaInspeccionCamara";
import InspeccionHidroPDF from "./app/vehiculos/inspeccion/InspeccionHidroPDF";
import InspeccionBarredoraPDF from "./app/vehiculos/inspeccion/InspeccionBarredoraPDF";
import InspeccionCamaraPDF from "./app/vehiculos/inspeccion/InspeccionCamaraPDF";

// ================= MANTENIMIENTO =================
import IndexMantenimiento from "./app/vehiculos/mantenimiento/IndexMantenimiento";
import HojaMantenimientoHidro from "./app/vehiculos/mantenimiento/HojaMantenimientoHidro";
import HojaMantenimientoBarredora from "./app/vehiculos/mantenimiento/HojaMantenimientoBarredora";
import HojaMantenimientoVCam from "./app/vehiculos/mantenimiento/HojaMantenimientoVCam";
import MantenimientoHidroPDF from "./app/vehiculos/mantenimiento/MantenimientoHidroPdf";
import MantenimientoBarredoraPDF from "./app/vehiculos/mantenimiento/MantenimientoBarredoraPdf";
import MantenimientoVCamPDF from "./app/vehiculos/mantenimiento/MantenimientoVCamPdf";

// ================= REPOSITORIOS =================
import ManualesTecnicos from "./app/repositorios/ManualesTecnicos";

// ================= OPERACIONES =================
import LiberacionHome from "./app/operaciones/liberacion/LiberacionHome";
import LiberacionForm from "./app/operaciones/liberacion/LiberacionForm";
import LiberacionDetalle from "./app/operaciones/liberacion/LiberacionDetalle";

import RecepcionHome from "./app/operaciones/recepcion/RecepcionHome";
import HojaRecepcion from "./app/operaciones/recepcion/HojaRecepcion";
import HojaRecepcionPDF from "./app/operaciones/recepcion/HojaRecepcionPDF";

import RegistroHome from "./app/operaciones/registro/RegistroHome";
import HojaRegistroHerramientas from "./app/operaciones/registro/HojaRegistroHerramientas";
import RegistroPDF from "./app/operaciones/registro/RegistroPDF";

// ================= NOTIFICACIONES (nueva página) =================
import NotificationsPage from "./pages/Notifications";

const TechRoute = ({ children }) => (
  <RoleRoute
    allowedRoles={[
      "super_admin",
      "admin",
      "tecnico",
      "supervisor_operaciones",
    ]}
  >
    {children}
  </RoleRoute>
);

const AdminRoute = ({ children }) => (
  <RoleRoute allowedRoles={["super_admin", "admin"]}>
    {children}
  </RoleRoute>
);

const VehiculosRoute = ({ children }) => (
  <RoleRoute
    allowedRoles={[
      "super_admin",
      "admin",
      "tecnico",
      "supervisor_operaciones",
      "supervisor_proyecto",
      "proveedor_vehiculos",
    ]}
  >
    {children}
  </RoleRoute>
);

function LiberacionRedirect() {
  const { id } = useParams();
  return <Navigate to={`/operaciones/liberacion/${id}`} replace />;
}

function RecepcionRedirect() {
  const { id } = useParams();
  return <Navigate to={`/operaciones/recepcion/${id}`} replace />;
}

function RegistroRedirect() {
  const { id } = useParams();
  return <Navigate to={`/operaciones/registro/${id}`} replace />;
}

export default function RoutesApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🔐 LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 🔒 PROTEGIDO + LAYOUT */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* ================= PANEL ================= */}
            <Route path="/" element={<PanelServicios />} />

            {/* ================= PERFIL ================= */}
            <Route path="/perfil" element={<Perfil />} />

            {/* ================= ÁREAS ================= */}
            <Route path="/area/vehiculos" element={<VehiculosRoute><AreaVehiculos /></VehiculosRoute>} />
            <Route path="/area/agua" element={<TechRoute><AreaAgua /></TechRoute>} />
            <Route path="/area/petroleo" element={<TechRoute><AreaPetroleo /></TechRoute>} />
            <Route path="/operaciones" element={<TechRoute><AreaOperaciones /></TechRoute>} />
            <Route path="/repositorios" element={<TechRoute><AreaRepositorios /></TechRoute>} />

            {/* ================= PÁGINA DE NOTIFICACIONES (nueva) ================= */}
            <Route path="/notifications" element={<TechRoute><NotificationsPage /></TechRoute>} />

            {/* ================= VEHÍCULOS / INFORMES ================= */}
            <Route path="/informe" element={<VehiculosRoute><InformeHome /></VehiculosRoute>} />
            <Route path="/informe/nuevo" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />
            <Route path="/informe/:id" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />

            {/* ... resto del archivo igual (no cambiar) ... */}
            {/* MANTÉN el resto tal como lo tienes actualmente para no romper otras rutas */}
          </Route>

          {/* ================= PDF FUERA DEL LAYOUT ================= */}
          {/* Mantén el resto del archivo igual (PDF routes...) */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
