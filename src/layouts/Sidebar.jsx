import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Fuel,
  Settings,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Database,
} from "lucide-react";

export default function Sidebar({ openSidebar, setOpenSidebar, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isProveedorVehiculos, isProveedorVehiculosOnly } = useAuth();

  const [openVehiculos, setOpenVehiculos] = useState(false);
  const [openOperaciones, setOpenOperaciones] = useState(false);
  const [openAgua, setOpenAgua] = useState(false);
  const [openPetroleo, setOpenPetroleo] = useState(false);
  const [openRepositorios, setOpenRepositorios] = useState(false);

  const proveedorSoloVehiculos = isProveedorVehiculosOnly ?? isProveedorVehiculos;
  const puedeVerTodo = !proveedorSoloVehiculos;

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
      path.startsWith("/mantenimiento");

    const isAguaPath =
      path.startsWith("/area/agua") || path.startsWith("/agua");

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
    setOpenPetroleo(puedeVerTodo && isPetroleoPath);
    setOpenOperaciones(puedeVerTodo && isOperacionesPath);
    setOpenRepositorios(puedeVerTodo && isRepositoriosPath);
  }, [location.pathname, proveedorSoloVehiculos, puedeVerTodo]);

  const openOnly = (name) => {
    setOpenVehiculos(name === "vehiculos");
    setOpenAgua(puedeVerTodo && name === "agua");
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
        ? "bg-white/20 text-white"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }
  `;

  const iconClass = `
    text-white/80 group-hover:text-white transition-all duration-300
  `;

  const tooltip = (label) =>
    !openSidebar && (
      <span
        role="tooltip"
        aria-hidden="true"
        className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none"
      >
        {label}
      </span>
    );

  const subItemClass = (path) =>
    `block w-full text-left text-xs px-2 py-1 rounded transition ${
      isActive(path)
        ? "bg-white/20 text-white border-l-2 border-white pl-3"
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
        bg-gradient-to-b from-[#003366] to-[#001f3f]
        border-r border-white/10 backdrop-blur-xl
        transition-all duration-300
        ${openSidebar ? "w-64" : "w-0"}
        overflow-hidden
      `}
    >
      {/* LOGO */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10 cursor-pointer hover:bg-white/10">
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
          {openSidebar && <span className="text-white font-bold">ASTAP</span>}
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
            {openSidebar && "Menú Principal"}
            {tooltip("Menú Principal")}
          </button>
        )}

        {/* VEHÍCULOS */}
        <div>
          <button
            type="button"
            onClick={() => {
              openOnly(openVehiculos ? null : "vehiculos");
            }}
            className={itemClass(isActive(["/vehiculos", "/area/vehiculos", "/informe", "/inspeccion", "/mantenimiento"]))}
            aria-expanded={openVehiculos}
            aria-controls="panel-vehiculos"
          >
            <Truck size={20} className={iconClass} />
            {openSidebar && "Vehículos"}
            {openSidebar && (openVehiculos ? <ChevronDown /> : <ChevronRight />)}
            {tooltip("Vehículos")}
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
              >
                Informes
              </button>

              <button
                type="button"
                onClick={() => go("/vehiculos/inspeccion")}
                className={subItemClass("/vehiculos/inspeccion")}
              >
                Inspección
              </button>

              <button
                type="button"
                onClick={() => go("/vehiculos/mantenimiento")}
                className={subItemClass("/vehiculos/mantenimiento")}
              >
                Mantenimiento
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
              {openSidebar && "Agua"}
              {openSidebar && (openAgua ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Agua")}
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
                  onClick={() => go("/agua/informe")}
                  className={subItemClass("/agua/informe")}
                >
                  Informes
                </button>

                <button
                  type="button"
                  onClick={() => go("/agua/recorrido/informe")}
                  className={subItemClass("/agua/recorrido/informe")}
                >
                  Recorrido
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
              {openSidebar && "Petróleo"}
              {openSidebar && (openPetroleo ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Petróleo")}
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
                  onClick={() => go("/petroleo/informe")}
                  className={subItemClass("/petroleo/informe")}
                >
                  Informes de inspección
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
                  Registro
                </button>

                <button
                  type="button"
                  onClick={() => go("/operaciones/recepcion")}
                  className={subItemClass("/operaciones/recepcion")}
                >
                  Bitácora Vehicular
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

        {/* REPOSITORIOS */}
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
              {openSidebar && "Repositorios"}
              {openSidebar &&
                (openRepositorios ? <ChevronDown /> : <ChevronRight />)}
              {tooltip("Repositorios")}
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
                  General
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
                  onClick={() =>
                    window.open(
                      "https://www.teamdesk.net/secure/db/53431/overview.aspx?t=381285",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
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
      <div className="p-3 border-t border-white/10 text-xs text-white/50 text-center">
        {openSidebar ? (
          <>
            <p className="font-semibold text-white/80">ASTAP</p>
            <p>© 2026 • By Santiago Avilés</p>
          </>
        ) : (
          "©"
        )}
      </div>
    </aside>
  );
}
