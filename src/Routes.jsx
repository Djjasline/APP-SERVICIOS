import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

// 🔐 AUTH
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import RecordPermissionRoute from "./components/RecordPermissionRoute";
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
import AreaIndustria from "./pages/AreaIndustria";
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

// ================= PROTOCOLOS =================
import ProtocolosHome from "./app/vehiculos/protocolos/ProtocolosHome";
import ProtocoloVactorForm from "./app/vehiculos/protocolos/ProtocoloVactorForm";
import ProtocoloVactorPDF from "./app/vehiculos/protocolos/ProtocoloVactorPDF";
import ProtocoloVCamForm from "./app/vehiculos/protocolos/ProtocoloVCamForm";
import ProtocoloVCamPDF from "./app/vehiculos/protocolos/ProtocoloVCamPDF";
import ConfiguradorHome from "./app/vehiculos/configurador/ConfiguradorHome";

// ================= REPOSITORIOS =================
import ManualesTecnicos from "./app/repositorios/ManualesTecnicos";
import DocumotoElgin from "./app/repositorios/DocumotoElgin";
import MarcasProductos from "./app/repositorios/MarcasProductos";
import EntrenamientoVehiculos from "./app/repositorios/EntrenamientoVehiculos";
import BaseDatos from "./app/repositorios/BaseDatos";

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

// ================= NOTIFICACIONES =================
import NotificationsPage from "./pages/Notifications";
import ChatInterno from "./pages/chat/ChatInterno";
import RegistroAccessAdmin from "./pages/admin/RegistroAccessAdmin";
import AppUpdatesAdmin from "./pages/admin/AppUpdatesAdmin";

const TechRoute = ({ children }) => (
  <RoleRoute
    allowedRoles={[
      "super_admin",
      "admin",
      "tecnico",
      "supervisor_operaciones",
      "supervisor_proyecto",
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

const SuperAdminRoute = ({ children }) => (
  <RoleRoute allowedRoles={["super_admin"]}>
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
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<PanelServicios />} />
            <Route path="/perfil" element={<Perfil />} />

            <Route path="/area/vehiculos" element={<VehiculosRoute><AreaVehiculos /></VehiculosRoute>} />
            <Route path="/area/agua" element={<TechRoute><AreaAgua /></TechRoute>} />
            <Route path="/area/industria" element={<TechRoute><AreaIndustria /></TechRoute>} />
            <Route path="/area/petroleo" element={<TechRoute><AreaPetroleo /></TechRoute>} />
            <Route path="/operaciones" element={<TechRoute><AreaOperaciones /></TechRoute>} />
            <Route path="/repositorios" element={<TechRoute><AreaRepositorios /></TechRoute>} />

            <Route path="/notifications" element={<TechRoute><NotificationsPage /></TechRoute>} />
            <Route path="/chat" element={<TechRoute><ChatInterno /></TechRoute>} />
            <Route path="/admin/permisos-registros" element={<SuperAdminRoute><RegistroAccessAdmin /></SuperAdminRoute>} />
            <Route path="/admin/boletines" element={<SuperAdminRoute><AppUpdatesAdmin /></SuperAdminRoute>} />

            <Route path="/informe" element={<VehiculosRoute><InformeHome /></VehiculosRoute>} />
            <Route path="/informe/nuevo" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />
            <Route path="/informe/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/informe"><InformePDF allowDownload={false} backPath="/vehiculos/informe" /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/informe/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/informe"><NuevoInforme /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/informe" element={<VehiculosRoute><InformeHome /></VehiculosRoute>} />
            <Route path="/vehiculos/informe/nuevo" element={<VehiculosRoute><NuevoInforme /></VehiculosRoute>} />
            <Route path="/vehiculos/informe/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/informe"><InformePDF allowDownload={false} backPath="/vehiculos/informe" /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/informe/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/informe"><NuevoInforme /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/agua/informe" element={<TechRoute><AguaInformeHome /></TechRoute>} />
            <Route path="/agua/informe/nuevo" element={<TechRoute><AguaNuevoInforme /></TechRoute>} />
            <Route path="/agua/informe/bomba" element={<TechRoute><AguaInformeHome tipo="bomba" /></TechRoute>} />
            <Route path="/agua/informe/bomba/nuevo" element={<TechRoute><AguaNuevoInforme tipo="bomba" /></TechRoute>} />
            <Route path="/agua/informe/bomba/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/agua/informe"><AguaNuevoInforme tipo="bomba" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/agua/informe/valvula" element={<TechRoute><AguaInformeHome tipo="valvula" /></TechRoute>} />
            <Route path="/agua/informe/valvula/nuevo" element={<TechRoute><AguaNuevoInforme tipo="valvula" /></TechRoute>} />
            <Route path="/agua/informe/valvula/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/agua/informe"><AguaNuevoInforme tipo="valvula" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/agua/informe/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/agua/informe"><AguaInformePDF allowDownload={false} /></RecordPermissionRoute></TechRoute>} />
            <Route path="/agua/informe/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/agua/informe"><AguaNuevoInforme /></RecordPermissionRoute></TechRoute>} />
            <Route path="/agua/recorrido/informe/*" element={<TechRoute><InformeAguaRoutes /></TechRoute>} />

            <Route path="/industria/informe" element={<TechRoute><AguaInformeHome area="industria" areaLabel="Industria" basePath="/industria/informe" areaPath="/area/industria" /></TechRoute>} />
            <Route path="/industria/informe/nuevo" element={<TechRoute><AguaNuevoInforme area="industria" basePath="/industria/informe" /></TechRoute>} />
            <Route path="/industria/informe/bomba" element={<TechRoute><AguaInformeHome tipo="bomba" area="industria" areaLabel="Industria" basePath="/industria/informe" areaPath="/area/industria" /></TechRoute>} />
            <Route path="/industria/informe/bomba/nuevo" element={<TechRoute><AguaNuevoInforme tipo="bomba" area="industria" basePath="/industria/informe" /></TechRoute>} />
            <Route path="/industria/informe/bomba/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/industria/informe"><AguaNuevoInforme tipo="bomba" area="industria" basePath="/industria/informe" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/industria/informe/valvula" element={<TechRoute><AguaInformeHome tipo="valvula" area="industria" areaLabel="Industria" basePath="/industria/informe" areaPath="/area/industria" /></TechRoute>} />
            <Route path="/industria/informe/valvula/nuevo" element={<TechRoute><AguaNuevoInforme tipo="valvula" area="industria" basePath="/industria/informe" /></TechRoute>} />
            <Route path="/industria/informe/valvula/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/industria/informe"><AguaNuevoInforme tipo="valvula" area="industria" basePath="/industria/informe" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/industria/informe/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/industria/informe"><AguaInformePDF area="industria" basePath="/industria/informe" allowDownload={false} /></RecordPermissionRoute></TechRoute>} />
            <Route path="/industria/informe/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/industria/informe"><AguaNuevoInforme area="industria" basePath="/industria/informe" /></RecordPermissionRoute></TechRoute>} />

            <Route path="/petroleo/informe" element={<TechRoute><PetroleoInformeHome /></TechRoute>} />
            <Route path="/petroleo/informe/nuevo" element={<TechRoute><PetroleoNuevoInforme /></TechRoute>} />
            <Route path="/petroleo/informe/bomba" element={<TechRoute><PetroleoInformeHome tipo="bomba" /></TechRoute>} />
            <Route path="/petroleo/informe/bomba/nuevo" element={<TechRoute><PetroleoNuevoInforme tipo="bomba" /></TechRoute>} />
            <Route path="/petroleo/informe/bomba/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/petroleo/informe"><PetroleoNuevoInforme tipo="bomba" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/petroleo/informe/valvula" element={<TechRoute><PetroleoInformeHome tipo="valvula" /></TechRoute>} />
            <Route path="/petroleo/informe/valvula/nuevo" element={<TechRoute><PetroleoNuevoInforme tipo="valvula" /></TechRoute>} />
            <Route path="/petroleo/informe/valvula/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/petroleo/informe"><PetroleoNuevoInforme tipo="valvula" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/petroleo/informe/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/petroleo/informe"><PetroleoInformePDF allowDownload={false} /></RecordPermissionRoute></TechRoute>} />
            <Route path="/petroleo/informe/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/petroleo/informe"><PetroleoNuevoInforme /></RecordPermissionRoute></TechRoute>} />

            <Route path="/inspeccion" element={<VehiculosRoute><HistorialInspecciones /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion" element={<VehiculosRoute><HistorialInspecciones /></VehiculosRoute>} />

            <Route path="/petroleo/inspeccion" element={<Navigate to="/petroleo/informe" replace />} />

            <Route path="/inspeccion/hidro/new" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />
            <Route path="/inspeccion/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/inspeccion/barredora/new" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />
            <Route path="/inspeccion/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/inspeccion/barredora-road-wizard/new" element={<VehiculosRoute><HojaInspeccionBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/inspeccion/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/inspeccion/camara/new" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />
            <Route path="/inspeccion/camara/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionCamara /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/hidro/new" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/barredora/new" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora-road-wizard/new" element={<VehiculosRoute><HojaInspeccionBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/camara/new" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/camara/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionCamara /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/mantenimiento" element={<VehiculosRoute><IndexMantenimiento /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento" element={<VehiculosRoute><IndexMantenimiento /></VehiculosRoute>} />

            <Route path="/petroleo/mantenimiento" element={<Navigate to="/petroleo/informe" replace />} />

            <Route path="/mantenimiento/hidro/new" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />
            <Route path="/mantenimiento/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/mantenimiento/barredora/new" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora-road-wizard/new" element={<VehiculosRoute><HojaMantenimientoBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/mantenimiento/vcam/new" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />
            <Route path="/mantenimiento/vcam/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoVCam /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/hidro/new" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/barredora/new" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora-road-wizard/new" element={<VehiculosRoute><HojaMantenimientoBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/vcam/new" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/vcam/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoVCam /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/protocolos" element={<VehiculosRoute><ProtocolosHome /></VehiculosRoute>} />
            <Route path="/vehiculos/protocolos/vactor/new" element={<VehiculosRoute><ProtocoloVactorForm /></VehiculosRoute>} />
            <Route path="/vehiculos/protocolos/vactor/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/protocolos"><ProtocoloVactorPDF allowDownload={false} backPath="/vehiculos/protocolos" /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/protocolos/vactor/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/protocolos"><ProtocoloVactorForm /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/protocolos/vcam/new" element={<VehiculosRoute><ProtocoloVCamForm /></VehiculosRoute>} />
            <Route path="/vehiculos/protocolos/vcam/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/protocolos"><ProtocoloVCamPDF allowDownload={false} backPath="/vehiculos/protocolos" /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/protocolos/vcam/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/protocolos"><ProtocoloVCamForm /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/configurador" element={<VehiculosRoute><ConfiguradorHome /></VehiculosRoute>} />

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
            <Route path="/operaciones/registro/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/registro"><RegistroPDF allowDownload={false} backPath="/operaciones/registro" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/registro/pdf/:id" element={<TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/registro"><RegistroPDF /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/registro/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/registro"><HojaRegistroHerramientas /></RecordPermissionRoute></TechRoute>} />

            <Route path="/repositorios/documentos" element={<TechRoute><AreaRepositorios /></TechRoute>} />
            <Route path="/repositorios/pdf" element={<TechRoute><AreaRepositorios /></TechRoute>} />
            <Route path="/repositorios/archivos" element={<TechRoute><AreaRepositorios /></TechRoute>} />
            <Route path="/repositorios/manuales-tecnicos" element={<TechRoute><ManualesTecnicos /></TechRoute>} />
            <Route path="/repositorios/documoto-elgin" element={<TechRoute><DocumotoElgin /></TechRoute>} />
            <Route path="/repositorios/marcas-productos" element={<TechRoute><MarcasProductos /></TechRoute>} />
            <Route path="/repositorios/entrenamiento" element={<TechRoute><EntrenamientoVehiculos /></TechRoute>} />
            <Route path="/repositorios/base-datos" element={<TechRoute><BaseDatos /></TechRoute>} />
          </Route>

          <Route path="/informe/pdf/:id" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/informe"><InformePDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/informe/pdf/:id" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/informe"><InformePDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/agua/informe/pdf/:id" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/agua/informe"><AguaInformePDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />
          <Route path="/industria/informe/pdf/:id" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/industria/informe"><AguaInformePDF area="industria" basePath="/industria/informe" /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />
          <Route path="/petroleo/informe/pdf/:id" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/petroleo/informe"><PetroleoInformePDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />

          <Route path="/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/camara/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionCamaraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/camara/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionCamaraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/operaciones/recepcion/:id/pdf" element={<ProtectedRoute><TechRoute><HojaRecepcionPDF /></TechRoute></ProtectedRoute>} />

          <Route path="/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoVCamPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoVCamPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/protocolos/vactor/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/protocolos"><ProtocoloVactorPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/protocolos/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/protocolos"><ProtocoloVCamPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
        </Routes>
            </BrowserRouter>
  );
}
