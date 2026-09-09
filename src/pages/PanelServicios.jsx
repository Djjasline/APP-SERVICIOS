import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import ServiceMenuFrame from "@/components/ServiceMenuFrame";
import { SPECIAL_MODULE_KEYS } from "@/constants/accessControl";
import { useSpecialModuleAccess } from "@/hooks/useSpecialModuleAccess";
import { getGeneralDashboard } from "@/services/dashboardService";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  ClipboardCheck,
  ClipboardList,
  Truck,
  Droplet,
  Factory,
  FileText,
  Fuel,
  MessageSquare,
  Package,
  PlusCircle,
  RefreshCw,
  Settings,
  FolderArchive,
  Users,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("es-EC");

function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

function formatActivityDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function MetricCard({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatNumber(value)}</p>
        </div>
        <div className={`${color} flex h-11 w-11 items-center justify-center rounded-2xl text-white`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function QuickAction({ action, onClick }) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >
      <span className="flex items-center gap-3">
        <span className={`${action.color} flex h-10 w-10 items-center justify-center rounded-xl text-white`}>
          <Icon size={19} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-950">{action.label}</span>
          <span className="block text-xs text-slate-500">{action.detail}</span>
        </span>
      </span>
      <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
    </button>
  );
}

function ActivityList({ items, onOpen }) {
  if (!items?.length) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Todavía no hay actividad reciente visible para tu usuario.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(item.url)}
          className="flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/70"
        >
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900">{item.title}</span>
            <span className="block truncate text-xs text-slate-500">{item.detail}</span>
          </span>
          <span className="shrink-0 text-xs text-slate-400">{formatActivityDate(item.date)}</span>
        </button>
      ))}
    </div>
  );
}

function AlertList({ alerts, onOpen }) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-red-200 bg-red-50 text-red-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
  };

  if (!alerts?.length) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Sin alertas críticas visibles en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => onOpen(alert.url)}
          className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${toneClass[alert.tone] || toneClass.blue}`}
        >
          <span className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>
              <span className="block text-sm font-bold">{alert.title}</span>
              <span className="block text-xs opacity-80">{alert.detail}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export default function PanelServicios() {
  const navigate = useNavigate();
  const { user, isProveedorVehiculos, isProveedorVehiculosOnly } = useAuth();
  const { isLight } = useTheme();
  const { checkingSpecialModules, hasSpecialModuleAccess } = useSpecialModuleAccess();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const proveedorSoloVehiculos = isProveedorVehiculosOnly ?? isProveedorVehiculos;

  useEffect(() => {
    if (proveedorSoloVehiculos) {
      navigate("/area/vehiculos", { replace: true });
    }
  }, [proveedorSoloVehiculos, navigate]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!user?.id || proveedorSoloVehiculos) return;

      setDashboardLoading(true);
      setDashboardError("");

      try {
        const data = await getGeneralDashboard({ email: user.email });
        if (mounted) setDashboard(data);
      } catch (error) {
        console.error("Error cargando dashboard general:", error);
        if (mounted) setDashboardError("No se pudo cargar el resumen general.");
      } finally {
        if (mounted) setDashboardLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [dashboardRefreshKey, proveedorSoloVehiculos, user?.email, user?.id]);

  if (proveedorSoloVehiculos) {
    return null;
  }

  /* ================= MENÚ CENTRAL ================= */
  const menuPrincipal = [
    {
      id: "vehiculos",
      titulo: "Vehículos Especiales",
      descripcion:
        "Gestión de equipos como hidrosuccionadores, barredoras y cámaras.",
      icon: <Truck size={28} />,
      color: "bg-blue-600",
      ruta: "/area/vehiculos",
    },
    {
      id: "agua",
      titulo: "Agua y Saneamiento",
      descripcion:
        "Operación técnica de sistemas hidráulicos y saneamiento.",
      icon: <Droplet size={28} />,
      color: "bg-cyan-600",
      ruta: "/area/agua",
    },
    {
      id: "industria",
      titulo: "Industria",
      descripcion:
        "Gestión técnica de equipos industriales, bombas y válvulas.",
      icon: <Factory size={28} />,
      color: "bg-slate-700",
      ruta: "/area/industria",
    },
    {
      id: "petroleo",
      titulo: "Petróleo y Energía",
      descripcion:
        "Gestión de equipos y mantenimiento del sector energético.",
      icon: <Fuel size={28} />,
      color: "bg-yellow-600",
      ruta: "/area/petroleo",
    },
    {
      id: "operaciones",
      titulo: "Operaciones",
      descripcion:
        "Control operativo de recepción, herramientas y autorización vehicular.",
      icon: <Settings size={28} />,
      color: "bg-gray-800",
      ruta: "/operaciones",
    },
    {
      id: "recursos",
      titulo: "Recursos",
      descripcion:
        "Gestión de documentos, informes PDF y archivos técnicos.",
      icon: <FolderArchive size={28} />,
      color: "bg-purple-700",
      ruta: "/repositorios",
    },
  ];

  const canUseModule = (moduleKey) => !moduleKey || (!checkingSpecialModules && hasSpecialModuleAccess(moduleKey));
  const quickActions = [
    {
      label: "Nuevo informe",
      detail: "Servicio técnico",
      icon: PlusCircle,
      color: "bg-blue-600",
      ruta: "/vehiculos/informe/nuevo",
    },
    {
      label: "Cotizador",
      detail: "Repuestos y servicios",
      icon: ClipboardCheck,
      color: "bg-violet-600",
      ruta: "/vehiculos/cotizador",
      moduleKey: SPECIAL_MODULE_KEYS.cotizador,
    },
    {
      label: "Bodega",
      detail: "Stock y referencias",
      icon: Package,
      color: "bg-emerald-700",
      ruta: "/operaciones/bodega",
      moduleKey: SPECIAL_MODULE_KEYS.bodega,
    },
    {
      label: "Clientes",
      detail: "Base central",
      icon: Users,
      color: "bg-slate-700",
      ruta: "/operaciones/clientes",
      moduleKey: SPECIAL_MODULE_KEYS.clientes,
    },
    {
      label: "Chat interno",
      detail: "Mensajes del equipo",
      icon: MessageSquare,
      color: "bg-cyan-700",
      ruta: "/chat",
    },
    {
      label: "Notificaciones",
      detail: "Avisos pendientes",
      icon: Bell,
      color: "bg-amber-600",
      ruta: "/notifications",
    },
  ].filter((action) => canUseModule(action.moduleKey));

  const metrics = dashboard?.metrics || {};

  return (
    <ServiceMenuFrame className="space-y-8">
        {/* HEADER */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col justify-center rounded-3xl border border-white/20 bg-white/90 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Centro de control</p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                    Panel de servicios ASTAP
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Resumen diario, pendientes y accesos rápidos para operar desde una sola pantalla.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDashboardRefreshKey((value) => value + 1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <Activity size={22} className="text-emerald-300" />
              <div>
                <p className="text-sm font-semibold">Estado operativo</p>
                <p className="text-xs text-slate-300">Datos visibles según permisos del usuario.</p>
              </div>
            </div>
            <p className="mt-5 text-3xl font-bold">{dashboardLoading ? "..." : formatNumber(metrics.reportsThisWeek)}</p>
            <p className="mt-1 text-sm text-slate-300">informes visibles esta semana</p>
            {dashboardError && <p className="mt-3 text-xs text-amber-200">{dashboardError}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={FileText} label="Informes hoy" value={metrics.reportsToday} detail="Creados durante la jornada" color="bg-blue-600" />
          <MetricCard icon={ClipboardList} label="Borradores" value={metrics.draftReports} detail="Pendientes de completar" color="bg-amber-500" />
          <MetricCard icon={Bell} label="Notificaciones" value={metrics.unreadNotifications} detail="Avisos sin leer" color="bg-purple-600" />
          <MetricCard icon={Package} label="Stock bajo" value={metrics.lowStockItems} detail={`${formatNumber(metrics.warehouseItems)} artículos visibles`} color="bg-red-600" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Accesos rápidos</h2>
                <p className="text-sm text-slate-500">Entradas directas a las acciones más usadas.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <QuickAction key={action.ruta} action={action} onClick={() => navigate(action.ruta)} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Alertas importantes</h2>
                <p className="text-sm text-slate-500">Prioridades visibles para atender primero.</p>
              </div>
            </div>
            {dashboardLoading ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Cargando alertas...</p>
            ) : (
              <AlertList alerts={dashboard?.alerts || []} onOpen={navigate} />
            )}
          </section>
        </div>

        <section className="rounded-3xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Actividad reciente</h2>
              <p className="text-sm text-slate-500">Últimos registros, cotizaciones, movimientos y avisos.</p>
            </div>
          </div>
          {dashboardLoading ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Cargando actividad...</p>
          ) : (
            <ActivityList items={dashboard?.activity || []} onOpen={navigate} />
          )}
        </section>

        {/* ================= MENÚ ================= */}
        <div>
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Áreas de servicio</h2>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
              Navegación completa por secciones operativas.
            </p>
          </div>
        <div className="grid md:grid-cols-3 gap-6">
          {menuPrincipal.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-4"
            >
              {/* ICONO */}
              <div
                className={`${item.color} text-white w-12 h-12 flex items-center justify-center rounded-lg`}
              >
                {item.icon}
              </div>

              {/* TITULO */}
              <h2 className="font-semibold text-lg text-gray-900">
                {item.titulo}
              </h2>

              {/* DESCRIPCIÓN */}
              <p className="text-sm text-gray-600">{item.descripcion}</p>

              {/* BOTÓN */}
              <button
                type="button"
                onClick={() => navigate(item.ruta)}
                className={`${item.color} text-white w-full py-2 rounded-lg hover:opacity-90 transition`}
              >
                Ingresar
              </button>
            </div>
          ))}
        </div>
        </div>
    </ServiceMenuFrame>
  );
}
