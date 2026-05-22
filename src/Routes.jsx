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
import RecepcionPDF from "./app/operaciones/recepcion/RecepcionPDF";

import RegistroHome from "./app/operaciones/registro/RegistroHome";
import HojaRegistroHerramientas from "./app/operaciones/registro/HojaRegistroHerramientas";

const TechRoute = ({ children }) => (
  <RoleRoute allowedRoles={["super_admin", "admin", "tecnico"]}>
    {children}
  </RoleRoute>
);

const AdminRoute = ({ children }) => (
  <RoleRoute allowedRoles={["super_admin", "admin"]}>
    {children}
  </RoleRoute>
);

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
            <Route path="/area/vehiculos" element={<TechRoute><AreaVehiculos /></TechRoute>} />
            <Route path="/area/agua" element={<TechRoute><AreaAgua /></TechRoute>} />
            <Route path="/area/petroleo" element={<TechRoute><AreaPetroleo /></TechRoute>} />
            <Route path="/operaciones" element={<TechRoute><AreaOperaciones /></TechRoute>} />
            <Route path="/repositorios" element={<AdminRoute><AreaRepositorios /></AdminRoute>} />

            {/* ================= VEHÍCULOS / INFORMES ================= */}
            <Route path="/informe" element={<TechRoute><InformeHome /></TechRoute>} />
            <Route path="/informe/nuevo" element={<TechRoute><NuevoInforme /></TechRoute>} />
            <Route path="/informe/:id" element={<TechRoute><NuevoInforme /></TechRoute>} />

            <Route path="/vehiculos/informe" element={<TechRoute><InformeHome /></TechRoute>} />
            <Route path="/vehiculos/informe/nuevo" element={<TechRoute><NuevoInforme /></TechRoute>} />
            <Route path="/vehiculos/informe/:id" element={<TechRoute><NuevoInforme /></TechRoute>} />

            {/* ================= AGUA / INFORMES ================= */}
            <Route path="/agua/informe" element={<TechRoute><AguaInformeHome /></TechRoute>} />
            <Route path="/agua/informe/nuevo" element={<TechRoute><AguaNuevoInforme /></TechRoute>} />
            <Route path="/agua/informe/:id" element={<TechRoute><AguaNuevoInforme /></TechRoute>} />

            {/* ================= PETRÓLEO / INFORMES ================= */}
            <Route path="/petroleo/informe" element={<TechRoute><PetroleoInformeHome /></TechRoute>} />
            <Route path="/petroleo/informe/nuevo" element={<TechRoute><PetroleoNuevoInforme /></TechRoute>} />
            <Route path="/petroleo/informe/:id" element={<TechRoute><PetroleoNuevoInforme /></TechRoute>} />

            {/* ================= INSPECCIÓN ================= */}
            <Route path="/inspeccion" element={<TechRoute><HistorialInspecciones /></TechRoute>} />
            <Route path="/vehiculos/inspeccion" element={<TechRoute><HistorialInspecciones /></TechRoute>} />
            <Route path="/agua/inspeccion" element={<TechRoute><HistorialInspecciones /></TechRoute>} />
            <Route path="/petroleo/inspeccion" element={<TechRoute><HistorialInspecciones /></TechRoute>} />

            <Route path="/inspeccion/hidro/new" element={<TechRoute><HojaInspeccionHidro /></TechRoute>} />
            <Route path="/inspeccion/hidro/:id" element={<TechRoute><HojaInspeccionHidro /></TechRoute>} />

            <Route path="/inspeccion/barredora/new" element={<TechRoute><HojaInspeccionBarredora /></TechRoute>} />
            <Route path="/inspeccion/barredora/:id" element={<TechRoute><HojaInspeccionBarredora /></TechRoute>} />

            <Route path="/inspeccion/camara/new" element={<TechRoute><HojaInspeccionCamara /></TechRoute>} />
            <Route path="/inspeccion/camara/:id" element={<TechRoute><HojaInspeccionCamara /></TechRoute>} />

            {/* ================= MANTENIMIENTO ================= */}
            <Route path="/mantenimiento" element={<TechRoute><IndexMantenimiento /></TechRoute>} />
            <Route path="/vehiculos/mantenimiento" element={<TechRoute><IndexMantenimiento /></TechRoute>} />
            <Route path="/petroleo/mantenimiento" element={<TechRoute><IndexMantenimiento /></TechRoute>} />

            <Route path="/mantenimiento/hidro/new" element={<TechRoute><HojaMantenimientoHidro /></TechRoute>} />
            <Route path="/mantenimiento/hidro/:id" element={<TechRoute><HojaMantenimientoHidro /></TechRoute>} />

            <Route path="/mantenimiento/barredora/new" element={<TechRoute><HojaMantenimientoBarredora /></TechRoute>} />
            <Route path="/mantenimiento/barredora/:id" element={<TechRoute><HojaMantenimientoBarredora /></TechRoute>} />

            <Route path="/mantenimiento/vcam/new" element={<TechRoute><HojaMantenimientoVCam /></TechRoute>} />
            <Route path="/mantenimiento/vcam/:id"  element={<TechRoute><HojaMantenimientoVCam /></TechRoute>} />

            {/* ================= OPERACIONES ================= */}
            <Route path="/liberacion" element={<TechRoute><LiberacionHome /></TechRoute>} />
            <Route path="/liberacion/nuevo" element={<TechRoute><LiberacionForm /></TechRoute>} />
            <Route path="/liberacion/:id" element={<TechRoute><LiberacionDetalle /></TechRoute>} />

            <Route path="/operaciones/liberacion" element={<TechRoute><LiberacionHome /></TechRoute>} />
            <Route path="/operaciones/liberacion/nuevo" element={<TechRoute><LiberacionForm /></TechRoute>} />
            <Route path="/operaciones/liberacion/:id" element={<TechRoute><LiberacionDetalle /></TechRoute>} />

            <Route path="/recepcion" element={<TechRoute><RecepcionHome /></TechRoute>} />
            <Route path="/recepcion/new" element={<TechRoute><HojaRecepcion /></TechRoute>} />
            <Route path="/recepcion/:id" element={<TechRoute><HojaRecepcion /></TechRoute>} />

            <Route path="/operaciones/recepcion" element={<TechRoute><RecepcionHome /></TechRoute>} />
            <Route path="/operaciones/recepcion/new" element={<TechRoute><HojaRecepcion /></TechRoute>} />
            <Route path="/operaciones/recepcion/:id" element={<TechRoute><HojaRecepcion /></TechRoute>} />
            <Route
  path="/operaciones/recepcion/:id/pdf"
  element={
    <ProtectedRoute>
      <TechRoute>
        <RecepcionPDF />
      </TechRoute>
    </ProtectedRoute>
  }
/>
            
            <Route path="/registro" element={<TechRoute><RegistroHome /></TechRoute>} />
            <Route path="/registro/new" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />
            <Route path="/registro/:id" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />

            <Route path="/operaciones/registro" element={<TechRoute><RegistroHome /></TechRoute>} />
            <Route path="/operaciones/registro/new" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />
            <Route path="/operaciones/registro/:id" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />

            {/* ================= REPOSITORIOS ================= */}
            <Route path="/repositorios/documentos" element={<AdminRoute><AreaRepositorios /></AdminRoute>} />
            <Route path="/repositorios/pdf" element={<AdminRoute><AreaRepositorios /></AdminRoute>} />
            <Route path="/repositorios/archivos" element={<AdminRoute><AreaRepositorios /></AdminRoute>} />
            <Route path="/repositorios/manuales-tecnicos" element={<AdminRoute><ManualesTecnicos /></AdminRoute>} />

          </Route>

          {/* ================= PDF FUERA DEL LAYOUT ================= */}

          {/* Informes */}
          <Route path="/informe/pdf/:id" element={<ProtectedRoute><TechRoute><InformePDF /></TechRoute></ProtectedRoute>} />
          <Route path="/vehiculos/informe/pdf/:id" element={<ProtectedRoute><TechRoute><InformePDF /></TechRoute></ProtectedRoute>} />
          <Route path="/agua/informe/pdf/:id" element={<ProtectedRoute><TechRoute><AguaInformePDF /></TechRoute></ProtectedRoute>} />
          <Route path="/petroleo/informe/pdf/:id" element={<ProtectedRoute><TechRoute><PetroleoInformePDF /></TechRoute></ProtectedRoute>} />

          {/* Inspecciones PDF */}
          <Route path="/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><TechRoute><InspeccionHidroPDF /></TechRoute></ProtectedRoute>} />
          <Route path="/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><TechRoute><InspeccionBarredoraPDF /></TechRoute></ProtectedRoute>} />
          <Route path="/inspeccion/camara/:id/pdf" element={<ProtectedRoute><TechRoute><InspeccionCamaraPDF /></TechRoute></ProtectedRoute>} />

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
          <Route path="/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><TechRoute><MantenimientoHidroPDF /></TechRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><TechRoute><MantenimientoBarredoraPDF /></TechRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><TechRoute><MantenimientoVCamPDF /></TechRoute></ProtectedRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
