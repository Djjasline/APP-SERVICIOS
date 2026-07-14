import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getUnreadAppUpdatesCount } from "@/services/appUpdatesService";
import { getUnreadMessageCounts } from "@/services/chatService";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Factory,
  Fuel,
  Settings,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Database,
  GraduationCap,
  Tags,
  MessageCircle,
  Megaphone,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

export default function Sidebar({ openSidebar, setOpenSidebar, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isProveedorVehiculos, isProveedorVehiculosOnly, isSuperAdmin } = useAuth();
  const { isLight } = useTheme();

  const [openVehiculos, setOpenVehiculos] = useState(false);
  const [openOperaciones, setOpenOperaciones] = useState(false);
  const [openAgua, setOpenAgua] = useState(false);
  const [openIndustria, setOpenIndustria] = useState(false);
  const [openPetroleo, setOpenPetroleo] = useState(false);
  const [openRepositorios, setOpenRepositorios] = useState(false);
  const [unreadBulletins, setUnreadBulletins] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);

  const proveedorSoloVehiculos = isProveedorVehiculosOnly ?? isProveedorVehiculos;
  const puedeVerTodo = !proveedorSoloVehiculos;
  const superAdminActivo =
    typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const informeGeneralTooltip =
    "Informe técnico de servicio: instalación y cambio de repuestos, montaje de elementos y reparación de sistemas. No aplica para inspección ni mantenimiento de equipos.";

  const isActive = (paths) => {
    const pathname = location.pathname;
    const arr = Array.isArray(paths) ? paths : [paths];

    return arr.some((p) => {
      if (p === "/") return pathname === "/";
      return (
        pathname === p ||
        pathname.startsWith(p) ||
        (p !== "/" && pathname.startsWith(`/area${p}`))
      );
    });
  };

  useEffect(() => {
    const path = location.pathname;

    const isVehiculosPath =
      path.startsWith("/area/vehiculos") ||
      path.startsWith("/vehiculos") ||
      path.startsWith("/informe") ||
      path.startsWith("/inspeccion") ||
      path.startsWith("/mantenimiento") ||
      path.startsWith("/protocolos") ||
      path.startsWith("/configurador");

    const isAguaPath =
      path.startsWith("/area/agua") || path.startsWith("/agua");

    const isIndustriaPath =
      path.startsWith("/area/industria") || path.startsWith("/industria");

    const isPetroleoPath =
      path.startsWith("/area/petroleo") || path.startsWith("/petroleo");

    const isOperacionesPath =
      path.startsWith("/operaciones") ||
      path.startsWith("/registro") ||
      path.startsWith("/recepcion") ||
      path.startsWith("/liberacion");

    const isRepositoriosPath = path.startsWith("/repositorios");

    setOpenVehiculos(isVehiculosPath || proveedorSoloVehiculos);
    setOpenAgua(puedeVerTodo && isAguaPath);
    setOpenIndustria(puedeVerTodo && isIndustriaPath);
    setOpenPetroleo(puedeVerTodo && isPetroleoPath);
    setOpenOperaciones(puedeVerTodo && isOperacionesPath);
    setOpenRepositorios(puedeVerTodo && isRepositoriosPath);
  }, [location.pathname, proveedorSoloVehiculos, puedeVerTodo]);

  useEffect(() => {
    let mounted = true;

    const loadUnreadBulletins = async () => {
      if (!user?.id) {
        if (mounted) setUnreadBulletins(0);
        return;
      }

      const count = await getUnreadAppUpdatesCount(user.id);
      if (mounted) setUnreadBulletins(count || 0);
    };

    loadUnreadBulletins();
    const interval = setInterval(loadUnreadBulletins, 10000);
    window.addEventListener("focus", loadUnreadBulletins);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", loadUnreadBulletins);
    };
  }, [user?.id, location.pathname]);

  useEffect(() => {
    let mounted = true;

    const loadUnreadChat = async () => {
      if (!user?.id || !puedeVerTodo) {
        if (mounted) setUnreadChat(0);
        return;
      }

      try {
        const counts = await getUnreadMessageCounts(user.id);
        const total = Object.values(counts || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
        if (mounted) setUnreadChat(total);
      } catch (error) {
        console.error("Error cargando mensajes no leídos:", error);
      }
    };

    loadUnreadChat();
    const interval = setInterval(loadUnreadChat, 10000);
    window.addEventListener("focus", loadUnreadChat);

    const channel = user?.id
      ? supabase
          .channel(`sidebar-chat-unread-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
            },
            (payload) => {
              if (payload.new?.sender_id !== user.id) loadUnreadChat();
            }
          )
          .subscribe()
      : null;

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", loadUnreadChat);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, puedeVerTodo, location.pathname]);

  const openOnly = (name) => {
    setOpenVehiculos(name === "vehiculos");
    setOpenAgua(puedeVerTodo && name === "agua");
    setOpenIndustria(puedeVerTodo && name === "industria");
    setOpenPetroleo(puedeVerTodo && name === "petroleo");
    setOpenOperaciones(puedeVerTodo && name === "operaciones");
    setOpenRepositorios(puedeVerTodo && name === "repositorios");
  };

  const itemBase = `
    group relative flex items-center w-full py-2 rounded-xl
    transition-all duration-300 ease-smooth
    cursor-pointer
  `;

  const itemClass = (active) => `
    ${itemBase}
    ${openSidebar ? "gap-3 px-3" : "justify-center px-2"}
    ${
      active
        ? isLight
          ? "bg-emerald-50 text-emerald-900"
          : "bg-emerald-400/20 text-emerald-50"
        : isLight
        ? "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
        : "text-white/80 hover:bg-emerald-400/10 hover:text-emerald-50"
    }
  `;

  const iconClass = `
    ${isLight ? "text-slate-500 group-hover:text-emerald-900" : "text-white/80 group-hover:text-emerald-50"} transition-all duration-300
  `;

  const tooltip = (label) =>
    !openSidebar && (
      <span
        role="tooltip"
        aria-hidden="true"
          className={`absolute left-16 text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none ${
            isLight ? "bg-white text-slate-900 border border-slate-200" : "bg-black text-white"
          }`}
      >
        {label}
      </span>
    );

  const subItemClass = (path) =>
    `block w-full text-left text-xs px-2 py-1 rounded transition ${
      isActive(path)
        ? isLight
          ? "bg-emerald-50 text-emerald-900 border-l-2 border-emerald-500 pl-3"
          : "bg-emerald-400/20 text-emerald-50 border-l-2 border-emerald-300 pl-3"
        : isLight
        ? "text-slate-500 hover:text-emerald-900 hover:bg-emerald-50"
        : "text-white/70 hover:text-emerald-50 hover:bg-emerald-400/10"
    }`;

  const go = (path) => {
    navigate(path);
    if (isMobile) setOpenSidebar(false);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50 flex flex-col
        ${isLight ? "bg-white/95 border-r border-slate-200" : "bg-gradient-to-b from-[#003366] to-[#001f3f] border-r border-white/10"}
        backdrop-blur-xl
        transition-all duration-300
        ${openSidebar ? "w-64" : "w-0"}
        overflow-hidden
      `}
    >
      {/* LOGO */}
      <div className={`p-4 flex items-center gap-3 border-b cursor-pointer ${isLight ? "border-slate-200 hover:bg-emerald-50" : "border-white/10 hover:bg-emerald-400/10"}`}>
        <button
          type="button"
          onClick={() => setOpenSidebar(!openSidebar)}
          className="flex items-center gap-3"
          aria-label={openSidebar ? "Cerrar barra lateral" : "Abrir barra lateral"}
        >
          <img
            src="/astap-logo.jpg"
            alt="ASTAP logo"
            className="w-10 h-10 object-contain"
          />
          {openSidebar && <span className={isLight ? "text-slate-900 font-bold" : "text-white font-bold"}>ASTAP</span>}
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 p-3 space-y-2 text-sm overflow-y-auto">
        {puedeVerTodo && (
          <button
            type="button"
            onClick={() => go("/")}
            className={itemClass(isActive("/"))}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <LayoutDashboard size={20} className={iconClass} />
            {openSidebar && "Menú principal"}
            {tooltip("Menú principal")}
          </button>
        )}

        {/* VEHÍCULOS */}
        <div>
          <button
            type="button"
            onClick={() => {
              openOnly("vehiculos");
              go("/area/vehiculos");
            }}
            className={itemClass(isActive(["/vehiculos", "/area/vehiculos", "/informe", "/inspeccion", "/mantenimiento", "/protocolos", "/configurador"]))}
            aria-expanded={openVehiculos}
            aria-controls="panel-vehiculos"
          >
            <Truck size={20} className={iconClass} />
            {openSidebar && "Vehículos Especiales"}
            {openSidebar && (openVehiculos ? <ChevronDown /> : <ChevronRight />)}
            {tooltip("Vehículos Especiales")}
          </button>

          {openSidebar && openVehiculos && (
            <div
              id="panel-vehiculos"
              className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3"
            >
              <button
                type="button"
                onClick={() => go("/vehiculos/informe")}
                className={subItemClass("/vehiculos/informe")}
                title={informeGeneralTooltip}
                aria-label={informeGeneralTooltip}
              >
                Informe Técnico de Servicio
              </button>

              <button
                type="button"
                onClick={() => go("/vehiculos/inspeccion")}
                className={subItemClass("/vehiculos/inspeccion")}
              >
                Informe de Inspección de Equipos
              </button>

              <button
                type="button"
                onClick={() => go("/vehiculos/mantenimiento")}
                className={subItemClass("/vehiculos/mantenimiento")}
              >
                Informe de Mantenimiento de Equipos
              </button>

              <button
                type="button"
                onClick={() => go("/vehiculos/protocolos")}
                className={subItemClass("/vehiculos/protocolos")}
              >
                Protocolos
              </button>

              <button
                type="button"
                onClick={() => go("/vehiculos/configurador")}
                className={subItemClass("/vehiculos/configurador")}
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal size={14} />
                  Configurador 🚧
                </span>
              </button>
            </div>
          )}
        </div>

        {/* AGUA */}
        {puedeVerTodo && (
          <div>
            <button
              type="button"
              onClick={() => {
                openOnly("agua");
                go("/area/agua");
              }}
              className={itemClass(isActive("/agua"))}
              aria-expanded={openAgua}
              aria-controls="panel-agua"
            >
              <Droplet size={20} className={iconClass} />
              {openSidebar && "Agua y Saneamiento"}
              {openSidebar && (openAgua ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Agua y Saneamiento")}
            </button>

            {openSidebar && openAgua && (
              <div
                id="panel-agua"
                className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3"
              >
                <button
                  type="button"
                  onClick={() => go("/agua/informe/bomba")}
                  className={subItemClass("/agua/informe/bomba")}
                >
                  Informe de bombas
                </button>

                <button
                  type="button"
                  onClick={() => go("/agua/informe/valvula")}
                  className={subItemClass("/agua/informe/valvula")}
                >
                  Informe de válvulas
                </button>

                <button
                  type="button"
                  onClick={() => go("/agua/recorrido/informe")}
                  className={subItemClass("/agua/recorrido/informe")}
                >
                  Informe de recorrido
                </button>
              </div>
            )}
          </div>
        )}

        {/* INDUSTRIA */}
        {puedeVerTodo && (
          <div>
            <button
              type="button"
              onClick={() => {
                openOnly("industria");
                go("/area/industria");
              }}
              className={itemClass(isActive("/industria"))}
              aria-expanded={openIndustria}
              aria-controls="panel-industria"
            >
              <Factory size={20} className={iconClass} />
              {openSidebar && "Industria"}
              {openSidebar && (openIndustria ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Industria")}
            </button>

            {openSidebar && openIndustria && (
              <div
                id="panel-industria"
                className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3"
              >
                <button
                  type="button"
                  onClick={() => go("/industria/informe/bomba")}
                  className={subItemClass("/industria/informe/bomba")}
                >
                  Informe de bombas
                </button>

                <button
                  type="button"
                  onClick={() => go("/industria/informe/valvula")}
                  className={subItemClass("/industria/informe/valvula")}
                >
                  Informe de válvulas
                </button>
              </div>
            )}
          </div>
        )}

        {/* PETRÓLEO */}
        {puedeVerTodo && (
          <div>
            <button
              type="button"
              onClick={() => {
                openOnly("petroleo");
                go("/area/petroleo");
              }}
              className={itemClass(isActive("/petroleo"))}
              aria-expanded={openPetroleo}
              aria-controls="panel-petroleo"
            >
              <Fuel size={20} className={iconClass} />
              {openSidebar && "Petróleo y Energía"}
              {openSidebar && (openPetroleo ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Petróleo y Energía")}
            </button>

            {openSidebar && openPetroleo && (
              <div
                id="panel-petroleo"
                className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3"
              >
                <button
                  type="button"
                  onClick={() => go("/petroleo/informe/bomba")}
                  className={subItemClass("/petroleo/informe/bomba")}
                >
                  Informe de bombas
                </button>

                <button
                  type="button"
                  onClick={() => go("/petroleo/informe/valvula")}
                  className={subItemClass("/petroleo/informe/valvula")}
                >
                  Informe de válvulas
                </button>

                <button
                  type="button"
                  onClick={() => go("/petroleo/visita-campo")}
                  className={subItemClass("/petroleo/visita-campo")}
                >
                  Visita en campo
                </button>
              </div>
            )}
          </div>
        )}

        {/* OPERACIONES */}
        {puedeVerTodo && (
          <div>
            <button
              type="button"
              onClick={() => {
                openOnly("operaciones");
                go("/operaciones");
              }}
              className={itemClass(isActive("/operaciones"))}
              aria-expanded={openOperaciones}
              aria-controls="panel-operaciones"
            >
              <Settings size={20} className={iconClass} />
              {openSidebar && "Operaciones"}
              {openSidebar &&
                (openOperaciones ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Operaciones")}
            </button>

            {openSidebar && openOperaciones && (
              <div
                id="panel-operaciones"
                className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3"
              >
                <button
                  type="button"
                  onClick={() => go("/operaciones/registro")}
                  className={subItemClass("/operaciones/registro")}
                >
                  Registro de salida e ingreso de herramientas
                </button>

                <button
                  type="button"
                  onClick={() => go("/operaciones/recepcion")}
                  className={subItemClass("/operaciones/recepcion")}
                >
                  Bitácora y control vehicular
                </button>

                <button
                  type="button"
                  onClick={() => go("/operaciones/liberacion")}
                  className={subItemClass("/operaciones/liberacion")}
                >
                  Autorización de uso de vehículo para refinería
                </button>
              </div>
            )}
          </div>
        )}

        {/* RECURSOS */}
        {puedeVerTodo && (
          <div>
            <button
              type="button"
              onClick={() => {
                openOnly("repositorios");
                go("/repositorios");
              }}
              className={itemClass(isActive("/repositorios"))}
              aria-expanded={openRepositorios}
              aria-controls="panel-repos"
            >
              <FolderOpen size={20} className={iconClass} />
              {openSidebar && "Recursos"}
              {openSidebar &&
                (openRepositorios ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Recursos")}
            </button>

            {openSidebar && (
              <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
                <button
                  type="button"
                  onClick={() => go("/chat")}
                  className={subItemClass("/chat")}
                >
                  <span className="inline-flex w-full items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle size={14} />
                      Chat interno
                    </span>
                    {unreadChat > 0 && (
                      <span className="min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                        {unreadChat > 99 ? "99+" : unreadChat}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => go("/notifications")}
                  className={subItemClass("/notifications")}
                >
                  <span className="inline-flex w-full items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <Megaphone size={14} />
                      Boletines
                    </span>
                    {unreadBulletins > 0 && (
                      <span className="min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                        {unreadBulletins > 99 ? "99+" : unreadBulletins}
                      </span>
                    )}
                  </span>
                </button>

                {superAdminActivo && (
                  <button
                    type="button"
                    onClick={() => go("/admin/permisos-registros")}
                    className={subItemClass("/admin/permisos-registros")}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Permisos de registros
                    </span>
                  </button>
                )}
              </div>
            )}

            {openSidebar && openRepositorios && (
              <>
                <div id="panel-repos" className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
                  <button
                    type="button"
                    onClick={() => go("/repositorios/manuales-tecnicos")}
                    className={subItemClass("/repositorios/manuales-tecnicos")}
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookOpen size={14} />
                      Manuales técnicos
                    </span>
                  </button>

                <button
                  type="button"
                  onClick={() => go("/repositorios/documoto-elgin")}
                  className={subItemClass("/repositorios/documoto-elgin")}
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={14} />
                    Documoto - Elgin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => go("/repositorios/marcas-productos")}
                  className={subItemClass("/repositorios/marcas-productos")}
                >
                  <span className="inline-flex items-center gap-2">
                    <Tags size={14} />
                    Marcas y productos
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => go("/repositorios/entrenamiento")}
                  className={subItemClass("/repositorios/entrenamiento")}
                >
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap size={14} />
                    Entrenamiento de vehículos especiales
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => go("/repositorios/base-datos")}
                  className={subItemClass("/repositorios/base-datos")}
                >
                  <span className="inline-flex items-center gap-2">
                    <Database size={14} />
                    Base de datos
                  </span>
                </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={`p-3 border-t text-xs text-center ${isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-white/50"}`}>
        {openSidebar ? (
          <>
            <p className={isLight ? "font-semibold text-slate-700" : "font-semibold text-white/80"}>ASTAP</p>
            <p>© 2026 • By Santiago Avilés</p>
          </>
        ) : (
          "©"
        )}
      </div>
    </aside>
  );
}
