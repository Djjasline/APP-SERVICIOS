import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import RecordPermissionRoute from "./components/RecordPermissionRoute";
import { useAuth } from "./context/AuthContext";
import { isConfiguratorOwner } from "./constants/accessControl";

const Login = lazy(() => import("./pages/Login"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const PanelServicios = lazy(() => import("./pages/PanelServicios"));
const Perfil = lazy(() => import("./pages/Perfil"));
const AreaVehiculos = lazy(() => import("./pages/AreaVehiculos"));
const AreaAgua = lazy(() => import("./pages/AreaAgua"));
const AreaIndustria = lazy(() => import("./pages/AreaIndustria"));
const AreaPetroleo = lazy(() => import("./pages/AreaPetroleo"));
const AreaOperaciones = lazy(() => import("./pages/AreaOperaciones"));
const AreaRepositorios = lazy(() => import("./pages/AreaRepositorios"));
const EncuestaSatisfaccionConstruccion = lazy(() => import("./pages/EncuestaSatisfaccionConstruccion"));
const InformeHome = lazy(() => import("./app/vehiculos/informe/InformeHome"));
const NuevoInforme = lazy(() => import("./app/vehiculos/informe/NuevoInforme"));
const InformePDF = lazy(() => import("./app/vehiculos/informe/InformePDF"));
const AguaInformeHome = lazy(() => import("./app/agua/informe/InformeHome"));
const AguaNuevoInforme = lazy(() => import("./app/agua/informe/NuevoInforme"));
const AguaInformePDF = lazy(() => import("./app/agua/informe/InformePDF"));
const InformeAguaRoutes = lazy(() => import("@/app/agua/recorrido/informe/InformeAguaRoutes"));
const PetroleoInformeHome = lazy(() => import("./app/petroleo/informe/InformeHome"));
const PetroleoNuevoInforme = lazy(() => import("./app/petroleo/informe/NuevoInforme"));
const PetroleoInformePDF = lazy(() => import("./app/petroleo/informe/InformePDF"));
const VisitaCampoHome = lazy(() => import("./app/petroleo/visitaCampo/VisitaCampoHome"));
const VisitaCampoForm = lazy(() => import("./app/petroleo/visitaCampo/VisitaCampoForm"));
const VisitaCampoPDF = lazy(() => import("./app/petroleo/visitaCampo/VisitaCampoPDF"));
const HistorialInspecciones = lazy(() => import("./app/vehiculos/inspeccion/HistorialInspecciones"));
const HojaInspeccionHidro = lazy(() => import("./app/vehiculos/inspeccion/HojaInspeccionHidro"));
const HojaInspeccionBarredora = lazy(() => import("./app/vehiculos/inspeccion/HojaInspeccionBarredora"));
const HojaInspeccionCamara = lazy(() => import("./app/vehiculos/inspeccion/HojaInspeccionCamara"));
const InspeccionHidroPDF = lazy(() => import("./app/vehiculos/inspeccion/InspeccionHidroPDF"));
const InspeccionBarredoraPDF = lazy(() => import("./app/vehiculos/inspeccion/InspeccionBarredoraPDF"));
const InspeccionCamaraPDF = lazy(() => import("./app/vehiculos/inspeccion/InspeccionCamaraPDF"));
const IndexMantenimiento = lazy(() => import("./app/vehiculos/mantenimiento/IndexMantenimiento"));
const HojaMantenimientoHidro = lazy(() => import("./app/vehiculos/mantenimiento/HojaMantenimientoHidro"));
const HojaMantenimientoBarredora = lazy(() => import("./app/vehiculos/mantenimiento/HojaMantenimientoBarredora"));
const HojaMantenimientoVCam = lazy(() => import("./app/vehiculos/mantenimiento/HojaMantenimientoVCam"));
const MantenimientoHidroPDF = lazy(() => import("./app/vehiculos/mantenimiento/MantenimientoHidroPdf"));
const MantenimientoBarredoraPDF = lazy(() => import("./app/vehiculos/mantenimiento/MantenimientoBarredoraPdf"));
const MantenimientoVCamPDF = lazy(() => import("./app/vehiculos/mantenimiento/MantenimientoVCamPdf"));
const ProtocolosHome = lazy(() => import("./app/vehiculos/protocolos/ProtocolosHome"));
const ProtocoloVactorForm = lazy(() => import("./app/vehiculos/protocolos/ProtocoloVactorForm"));
const ProtocoloVactorPDF = lazy(() => import("./app/vehiculos/protocolos/ProtocoloVactorPDF"));
const ProtocoloVCamForm = lazy(() => import("./app/vehiculos/protocolos/ProtocoloVCamForm"));
const ProtocoloVCamPDF = lazy(() => import("./app/vehiculos/protocolos/ProtocoloVCamPDF"));
const ConfiguradorHome = lazy(() => import("./app/vehiculos/configurador/ConfiguradorHome"));
const ManualesTecnicos = lazy(() => import("./app/repositorios/ManualesTecnicos"));
const DocumotoElgin = lazy(() => import("./app/repositorios/DocumotoElgin"));
const MarcasProductos = lazy(() => import("./app/repositorios/MarcasProductos"));
const EntrenamientoVehiculos = lazy(() => import("./app/repositorios/EntrenamientoVehiculos"));
const BaseDatos = lazy(() => import("./app/repositorios/BaseDatos"));
const LiberacionHome = lazy(() => import("./app/operaciones/liberacion/LiberacionHome"));
const LiberacionForm = lazy(() => import("./app/operaciones/liberacion/LiberacionForm"));
const LiberacionDetalle = lazy(() => import("./app/operaciones/liberacion/LiberacionDetalle"));
const RecepcionHome = lazy(() => import("./app/operaciones/recepcion/RecepcionHome"));
const HojaRecepcion = lazy(() => import("./app/operaciones/recepcion/HojaRecepcion"));
const HojaRecepcionPDF = lazy(() => import("./app/operaciones/recepcion/HojaRecepcionPDF"));
const RegistroHome = lazy(() => import("./app/operaciones/registro/RegistroHome"));
const HojaRegistroHerramientas = lazy(() => import("./app/operaciones/registro/HojaRegistroHerramientas"));
const RegistroPDF = lazy(() => import("./app/operaciones/registro/RegistroPDF"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const ChatInterno = lazy(() => import("./pages/chat/ChatInterno"));
const RegistroAccessAdmin = lazy(() => import("./pages/admin/RegistroAccessAdmin"));
const AppUpdatesAdmin = lazy(() => import("./pages/admin/AppUpdatesAdmin"));

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

const ConfiguradorOwnerRoute = ({ children }) => {
  const { user, email, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Verificando acceso...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isConfiguratorOwner(email || user?.email)) {
    return <Navigate to="/area/vehiculos" replace />;
  }

  return children;
};

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
      <Suspense fallback={<div className="p-6 text-sm text-slate-500">Cargando...</div>}>
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

            <Route path="/vehiculos/encuesta-satisfaccion" element={<VehiculosRoute><EncuestaSatisfaccionConstruccion areaLabel="Vehículos Especiales" backPath="/area/vehiculos" /></VehiculosRoute>} />
            <Route path="/agua/encuesta-satisfaccion" element={<TechRoute><EncuestaSatisfaccionConstruccion areaLabel="Agua y Saneamiento" backPath="/area/agua" /></TechRoute>} />
            <Route path="/industria/encuesta-satisfaccion" element={<TechRoute><EncuestaSatisfaccionConstruccion areaLabel="Industria" backPath="/area/industria" /></TechRoute>} />
            <Route path="/petroleo/encuesta-satisfaccion" element={<TechRoute><EncuestaSatisfaccionConstruccion areaLabel="Petróleo y Energía" backPath="/area/petroleo" /></TechRoute>} />

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

            <Route path="/petroleo/visita-campo" element={<TechRoute><VisitaCampoHome /></TechRoute>} />
            <Route path="/petroleo/visita-campo/nuevo" element={<TechRoute><VisitaCampoForm /></TechRoute>} />
            <Route path="/petroleo/visita-campo/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/petroleo/visita-campo"><VisitaCampoPDF allowDownload={false} /></RecordPermissionRoute></TechRoute>} />
            <Route path="/petroleo/visita-campo/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/petroleo/visita-campo"><VisitaCampoForm /></RecordPermissionRoute></TechRoute>} />

            <Route path="/inspeccion" element={<VehiculosRoute><HistorialInspecciones /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion" element={<VehiculosRoute><HistorialInspecciones /></VehiculosRoute>} />

            <Route path="/petroleo/inspeccion" element={<Navigate to="/petroleo/informe" replace />} />

            <Route path="/inspeccion/hidro/new" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />
            <Route path="/inspeccion/hidro/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionHidroPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/inspeccion/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/inspeccion/barredora/new" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />
            <Route path="/inspeccion/barredora/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/inspeccion/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/inspeccion/barredora-road-wizard/new" element={<VehiculosRoute><HojaInspeccionBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/inspeccion/barredora-road-wizard/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF variant="roadWizard" allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/inspeccion/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/inspeccion/camara/new" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />
            <Route path="/inspeccion/camara/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionCamaraPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/inspeccion/camara/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionCamara /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/hidro/new" element={<VehiculosRoute><HojaInspeccionHidro /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/hidro/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionHidroPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/barredora/new" element={<VehiculosRoute><HojaInspeccionBarredora /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora-road-wizard/new" element={<VehiculosRoute><HojaInspeccionBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora-road-wizard/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF variant="roadWizard" allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/inspeccion/camara/new" element={<VehiculosRoute><HojaInspeccionCamara /></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/camara/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/inspeccion"><InspeccionCamaraPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/inspeccion/camara/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/inspeccion"><HojaInspeccionCamara /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/mantenimiento" element={<VehiculosRoute><IndexMantenimiento /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento" element={<VehiculosRoute><IndexMantenimiento /></VehiculosRoute>} />

            <Route path="/petroleo/mantenimiento" element={<Navigate to="/petroleo/informe" replace />} />

            <Route path="/mantenimiento/hidro/new" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />
            <Route path="/mantenimiento/hidro/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoHidroPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/mantenimiento/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/mantenimiento/barredora/new" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora-road-wizard/new" element={<VehiculosRoute><HojaMantenimientoBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora-road-wizard/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF variant="roadWizard" allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/mantenimiento/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/mantenimiento/vcam/new" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />
            <Route path="/mantenimiento/vcam/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoVCamPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/mantenimiento/vcam/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoVCam /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/hidro/new" element={<VehiculosRoute><HojaMantenimientoHidro /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/hidro/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoHidroPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/hidro/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoHidro /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/barredora/new" element={<VehiculosRoute><HojaMantenimientoBarredora /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora-road-wizard/new" element={<VehiculosRoute><HojaMantenimientoBarredora variant="roadWizard" /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora-road-wizard/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF variant="roadWizard" allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/barredora-road-wizard/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoBarredora variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/mantenimiento/vcam/new" element={<VehiculosRoute><HojaMantenimientoVCam /></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/vcam/ver/:id" element={<VehiculosRoute><RecordPermissionRoute action="view" fallback="/vehiculos/mantenimiento"><MantenimientoVCamPDF allowDownload={false} /></RecordPermissionRoute></VehiculosRoute>} />
            <Route path="/vehiculos/mantenimiento/vcam/:id" element={<VehiculosRoute><RecordPermissionRoute action="edit" fallback="/vehiculos/mantenimiento"><HojaMantenimientoVCam /></RecordPermissionRoute></VehiculosRoute>} />

            <Route path="/vehiculos/protocolos" element={<Navigate to="/operaciones/protocolos" replace />} />
            <Route path="/vehiculos/protocolos/vactor/new" element={<Navigate to="/operaciones/protocolos/vactor/new" replace />} />
            <Route path="/vehiculos/protocolos/vactor/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/protocolos"><ProtocoloVactorPDF allowDownload={false} backPath="/operaciones/protocolos" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/vehiculos/protocolos/vactor/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/protocolos"><ProtocoloVactorForm /></RecordPermissionRoute></TechRoute>} />
            <Route path="/vehiculos/protocolos/vcam/new" element={<Navigate to="/operaciones/protocolos/vcam/new" replace />} />
            <Route path="/vehiculos/protocolos/vcam/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/protocolos"><ProtocoloVCamPDF allowDownload={false} backPath="/operaciones/protocolos" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/vehiculos/protocolos/vcam/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/protocolos"><ProtocoloVCamForm /></RecordPermissionRoute></TechRoute>} />
            <Route path="/vehiculos/configurador" element={<ConfiguradorOwnerRoute><ConfiguradorHome /></ConfiguradorOwnerRoute>} />

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
            <Route path="/operaciones/liberacion/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/liberacion"><LiberacionDetalle pdfMode allowDownload={false} /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/liberacion/pdf/:id" element={<TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/liberacion"><LiberacionDetalle pdfMode /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/liberacion/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/liberacion"><LiberacionDetalle /></RecordPermissionRoute></TechRoute>} />

            <Route path="/operaciones/recepcion" element={<TechRoute><RecepcionHome /></TechRoute>} />
            <Route path="/operaciones/recepcion/new" element={<TechRoute><HojaRecepcion /></TechRoute>} />
            <Route path="/operaciones/recepcion/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/recepcion"><HojaRecepcionPDF allowDownload={false} /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/recepcion/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/recepcion"><HojaRecepcion /></RecordPermissionRoute></TechRoute>} />

            <Route path="/operaciones/registro" element={<TechRoute><RegistroHome /></TechRoute>} />
            <Route path="/operaciones/registro/new" element={<TechRoute><HojaRegistroHerramientas /></TechRoute>} />
            <Route path="/operaciones/registro/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/registro"><RegistroPDF allowDownload={false} backPath="/operaciones/registro" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/registro/pdf/:id" element={<TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/registro"><RegistroPDF /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/registro/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/registro"><HojaRegistroHerramientas /></RecordPermissionRoute></TechRoute>} />

            <Route path="/operaciones/protocolos" element={<TechRoute><ProtocolosHome /></TechRoute>} />
            <Route path="/operaciones/protocolos/vactor/new" element={<TechRoute><ProtocoloVactorForm /></TechRoute>} />
            <Route path="/operaciones/protocolos/vactor/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/protocolos"><ProtocoloVactorPDF allowDownload={false} backPath="/operaciones/protocolos" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/protocolos/vactor/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/protocolos"><ProtocoloVactorForm /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/protocolos/vcam/new" element={<TechRoute><ProtocoloVCamForm /></TechRoute>} />
            <Route path="/operaciones/protocolos/vcam/ver/:id" element={<TechRoute><RecordPermissionRoute action="view" fallback="/operaciones/protocolos"><ProtocoloVCamPDF allowDownload={false} backPath="/operaciones/protocolos" /></RecordPermissionRoute></TechRoute>} />
            <Route path="/operaciones/protocolos/vcam/:id" element={<TechRoute><RecordPermissionRoute action="edit" fallback="/operaciones/protocolos"><ProtocoloVCamForm /></RecordPermissionRoute></TechRoute>} />

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
          <Route path="/petroleo/visita-campo/:id/pdf" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/petroleo/visita-campo"><VisitaCampoPDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />

          <Route path="/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/inspeccion/camara/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionCamaraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/inspeccion/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/inspeccion/camara/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/inspeccion"><InspeccionCamaraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/operaciones/recepcion/:id/pdf" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/recepcion"><HojaRecepcionPDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />

          <Route path="/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoVCamPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/mantenimiento/hidro/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoHidroPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/barredora/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/barredora-road-wizard/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoBarredoraPDF variant="roadWizard" /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />
          <Route path="/vehiculos/mantenimiento/vcam/:id/pdf" element={<ProtectedRoute><VehiculosRoute><RecordPermissionRoute action="download" fallback="/vehiculos/mantenimiento"><MantenimientoVCamPDF /></RecordPermissionRoute></VehiculosRoute></ProtectedRoute>} />

          <Route path="/vehiculos/protocolos/vactor/:id/pdf" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/protocolos"><ProtocoloVactorPDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />
          <Route path="/vehiculos/protocolos/vcam/:id/pdf" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/protocolos"><ProtocoloVCamPDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />
          <Route path="/operaciones/protocolos/vactor/:id/pdf" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/protocolos"><ProtocoloVactorPDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />
          <Route path="/operaciones/protocolos/vcam/:id/pdf" element={<ProtectedRoute><TechRoute><RecordPermissionRoute action="download" fallback="/operaciones/protocolos"><ProtocoloVCamPDF /></RecordPermissionRoute></TechRoute></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
