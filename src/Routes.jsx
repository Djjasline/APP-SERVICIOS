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

            {/* ================= VEHÍCULOS / INFORMES ================= */}
            <Route path="/informe" element={<VehiculosRoute><InformeHome /></VehiculosRoute>} />
            <Route path="/informe/nuevo" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />
            <Route path="/informe/:id" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />

            <Route path="/vehiculos/informe" element={<VehiculosRoute><InformeHome /></VehiculosRoute>} />
            <Route path="/vehiculos/informe/nuevo" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />
            <Route path="/vehiculos/informe/:id" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />

            {/* ================= AGUA / INFORMES ================= */}
            <Route path="/agua/informe" element={<TechRoute><AguaInformeHome /></TechRoute>} />
            <Route path="/agua/informe/nuevo" element={<TechRoute><AguaNuevoInforme /></TechRoute>} />
            <Route path="/agua/informe/:id" element={<TechRoute><AguaNuevoInforme /></TechRoute>} />
            <Route path="/agua/recorrido/informe/*" element={<TechRoute><InformeAguaRoutes /></TechRoute>} />

            {/* ================= PETRÓLEO / INFORMES ================= */}
            <Route path="/petroleo/informe" element={<TechRoute><PetroleoInformeHome /></TechRoute>} />
            <Route path="/petroleo/informe/nuevo" element={<TechRoute><PetroleoNuevoInforme /></TechRoute>} />
            <Route path="/petroleo/informe/:id" element={<TechRoute><PetroleoNuevoInforme /></TechRoute>} />

            {/* ================= VEHÍCULOS / INSPECCIÓN ================= */}
            <Route path="/inspeccion" element={<VehiculosRoute><HistorialInspecciones /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion" element={<VehiculosRoute><HistorialInspecciones /></VehiculosRoute>} />

            <Route path="/petroleo/inspeccion" element={<Navigate to="/petroleo/informe" replace />} />

            <Route path="/inspeccion/hidro/new" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />
            <Route path="/inspeccion/hidro/:id" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />

            <Route path="/inspeccion/barredora/new" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />
            <Route path="/inspeccion/barredora/:id" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />

            <Route path="/inspeccion/camara/new" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />
            <Route path="/inspeccion/camara/:id" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/hidro/new" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/hidro/:id" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/barredora/new" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora/:id" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/camara/new" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/camara/:id" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />

            {/* ================= VEHÍCULOS / MANTENIMIENTO ================= */}
            <Route path="/mantenimiento" element={<VehiculosRoute><IndexMantenimiento /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento" element={<VehiculosRoute><IndexMantenimiento /></VehiculosRoute>} />

            <Route path="/petroleo/mantenimiento" element={<Navigate to="/petroleo/informe" replace />} />

            <Route path="/mantenimiento/hidro/new" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />
            <Route path="/mantenimiento/hidro/:id" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />

            <Route path="/mantenimiento/barredora/new" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora/:id" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />

            <Route path="/mantenimiento/vcam/new" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />
            <Route path="/mantenimiento/vcam/:id" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/hidro/new" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/hidro/:id" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/barredora/new" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora/:id" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/vcam/new" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/vcam/:id" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />

            {/* ================= OPERACIONES ================= */}
            <Route path="/liberacion" element={<Navigate to="/operaciones/liberacion" replace />} />
            <Route path="/liberacion/nuevo" element={<Navigate to="/operaciones/liberacion/nuevo" replace />} />
            <Route path="/liberacion/:id" element={<LiberacionRedirect />} />

            <Route path="/recepcion" element={<Navigate to="/operaciones/recepcion" replace />} />
            <Route path="/recepcion/new" element={<Navigate to="/operaciones/recepcion/new" replace />} />
            <Route path="/recepcion/:id" element={<RecepcionRedirect />} />

            <Route path="/registro" element={<Navigate to="/operaciones/registro" replace />} />
            <Route path="/registro/new" element={<Navigate to="/operaciones/registro/new" replace />} />
            <Route path="/registro/:id" element={<RegistroRedirect />} />

            <Route path="/operaciones/liberacion" element={<TechRoute><LiberacionHome /></TechRoute>} />
            <Route path="/operaciones/liberacion/nuevo" element={<TechRoute><LiberacionForm /></TechRoute>} />
            <Route path="/operaciones/liberacion/:id" element={<TechRoute><LiberacionDetalle /></TechRoute>} />

            <Route path="/operaciones/recepcion" element={<TechRoute><RecepcionHome /></TechRoute>} />
            <Route path="/operaciones/recepcion/new" element={<TechRoute><HojaRecepcion /></TechRoute>} />
            <Route path="/operaciones/recepcion/:id" element={<TechRoute><HojaRecepcion /></TechRoute>} />

            <Route path="/operaciones/registro" element={<TechRoute><RegistroHome /></TechRoute>} />
            <Route path="/operaciones/registro/new" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />
            <Route path="/operaciones/registro/pdf/:id" element={<TechRoute><RegistroPDF /></TechRoute>} />
            <Route path="/operaciones/registro/:id" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />

            {/* ================= REPOSITORIOS ================= */}
            <Route path="/repositorios/documentos" element={<TechRoute><AreaRepositorios /></TechRoute>} />
            <Route path="/repositorios/pdf" element={<TechRoute><AreaRepositorios /></TechRoute>} />
            <Route path="/repositorios/archivos" element={<TechRoute><AreaRepositorios /></TechRoute>} />
            <Route path="/repositorios/manuales-tecnicos" element={<TechRoute><ManualesTecnicos /></TechRoute>} />
          </Route>

          {/* ================= PDF FUERA DEL LAYOUT ================= */}

          {/* Informes PDF */}
          <Route path="/informe/pdf/:id" element={<ProtectedRoute><VehiculosRoute><InformePDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/informe/pdf/:id" element={<ProtectedRoute><VehiculosRoute><InformePDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/agua/informe/pdf/:id" element={<ProtectedRoute><TechRoute><AguaInformePDF /></TechRoute></ProtectedRoute>} />
          <Route path="/petroleo/informe/pdf/:id" element={<ProtectedRoute><TechRoute><PetroleoInformePDF /></TechRoute></ProtectedRoute>} />

          {/* Inspecciones PDF */}
          <Route path="/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><InspeccionHidroPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><InspeccionBarredoraPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/camara/:id/pdf" element={<ProtectedRoute><VehiculosRoute><InspeccionCamaraPDF /></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><InspeccionHidroPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><InspeccionBarredoraPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/camara/:id/pdf" element={<ProtectedRoute><VehiculosRoute><InspeccionCamaraPDF /></VehiculosRoute></ProtectedRoute>} />

          {/* Recepción PDF */}
          <Route
            path="/operaciones/recepcion/:id/pdf"
            element={
              <ProtectedRoute>
                <TechRoute>
                  <HojaRecepcionPDF />
                </TechRoute>
              </ProtectedRoute>
            }
          />

          {/* Mantenimiento PDF */}
          <Route path="/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><MantenimientoHidroPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><MantenimientoBarredoraPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><MantenimientoVCamPDF /></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><MantenimientoHidroPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><MantenimientoBarredoraPDF /></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><MantenimientoVCamPDF /></VehiculosRoute></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
