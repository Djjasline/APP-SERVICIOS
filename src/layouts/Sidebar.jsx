import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getUnreadAppUpdatesCount } from "@/services/appUpdatesService";
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
          ? "bg-blue-50 text-blue-900"
          : "bg-white/20 text-white"
        : isLight
        ? "text-slate-600 hover:bg-blue-50 hover:text-blue-900"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }
  `;

  const iconClass = `
    ${isLight ? "text-slate-500 group-hover:text-blue-900" : "text-white/80 group-hover:text-white"} transition-all duration-300
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
          ? "bg-blue-50 text-blue-900 border-l-2 border-blue-700 pl-3"
          : "bg-white/20 text-white border-l-2 border-white pl-3"
        : isLight
        ? "text-slate-500 hover:text-blue-900 hover:bg-blue-50"
        : "text-white/70 hover:text-white hover:bg-white/10"
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
      <div className={`p-4 flex items-center gap-3 border-b cursor-pointer ${isLight ? "border-slate-200 hover:bg-blue-50" : "border-white/10 hover:bg-white/10"}`}>
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
        {/* DASHBOARD */}
        {puedeVerTodo && (
          <button
            type="button"
            onClick={() => go("/")}
            className={itemClass(isActive("/"))}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <LayoutDashboard size={20} className={iconClass} />
            {openSidebar && "Panel de servicios ASTAP"}
            {tooltip("Panel de servicios ASTAP")}
          </button>
        )}



        {/* CHAT INTERNO */}
        {puedeVerTodo && (
          <button
            type="button"
            onClick={() => go("/chat")}
            className={itemClass(isActive("/chat"))}
            aria-current={isActive("/chat") ? "page" : undefined}
          >
            <MessageCircle size={20} className={iconClass} />
            {openSidebar && "Chat interno"}
            {tooltip("Chat interno")}
          </button>
        )}

        {puedeVerTodo && (
          <button
            type="button"
            onClick={() => go("/notifications")}
            className={itemClass(isActive("/notifications"))}
            aria-current={isActive("/notifications") ? "page" : undefined}
          >
            <Megaphone size={20} className={iconClass} />
            {openSidebar && (
              <span className="flex flex-1 items-center justify-between gap-2">
                <span>Boletines</span>
                {unreadBulletins > 0 && (
                  <span className="min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                    {unreadBulletins > 99 ? "99+" : unreadBulletins}
                  </span>
                )}
              </span>
            )}
            {!openSidebar && unreadBulletins > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
            )}
            {tooltip("Boletines")}
          </button>
        )}

        {/* ADMINISTRACIÓN */}
        {superAdminActivo && (
          <>
            <button
              type="button"
              onClick={() => go("/admin/permisos-registros")}
              className={itemClass(isActive("/admin/permisos-registros"))}
              aria-current={isActive("/admin/permisos-registros") ? "page" : undefined}
            >
              <ShieldCheck size={20} className={iconClass} />
              {openSidebar && "Permisos de registros"}
              {tooltip("Permisos de registros")}
            </button>
          </>
        )}

        {/* VEHÍCULOS */}
        <div>
          <button
            type="button"
            onClick={() => {
              openOnly(openVehiculos ? null : "vehiculos");
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
                onClick={() => go("/area/vehiculos")}
                className={subItemClass("/area/vehiculos")}
              >
                Panel
              </button>

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
                openOnly(openAgua ? null : "agua");
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
                  onClick={() => go("/area/agua")}
                  className={subItemClass("/area/agua")}
                >
                  Panel
                </button>

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
                openOnly(openIndustria ? null : "industria");
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
                  onClick={() => go("/area/industria")}
                  className={subItemClass("/area/industria")}
                >
                  Panel
                </button>

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
                openOnly(openPetroleo ? null : "petroleo");
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
                  onClick={() => go("/area/petroleo")}
                  className={subItemClass("/area/petroleo")}
                >
                  Panel
                </button>

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
                openOnly(openOperaciones ? null : "operaciones");
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
                  onClick={() => go("/operaciones")}
                  className={subItemClass("/operaciones")}
                >
                  Panel
                </button>

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
                  Liberación
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
                openOnly(openRepositorios ? null : "repositorios");
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

            {openSidebar && openRepositorios && (
              <div
                id="panel-repos"
                className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3"
              >
                <button
                  type="button"
                  onClick={() => go("/repositorios")}
                  className={subItemClass("/repositorios")}
                >
                  Panel
                </button>

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
