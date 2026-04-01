import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Fuel,
  Settings,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({ openSidebar, setOpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openVehiculos, setOpenVehiculos] = useState(true);
  const [openOperaciones, setOpenOperaciones] = useState(true);

  // 🔥 DETECTOR ACTIVO
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // 🔥 AUTO ABRIR MENÚ
  useEffect(() => {
    if (
      location.pathname.includes("/vehiculos") ||
      location.pathname.includes("/informe") ||
      location.pathname.includes("/inspeccion") ||
      location.pathname.includes("/mantenimiento")
    ) {
      setOpenVehiculos(true);
    }

    if (
      location.pathname.includes("/operaciones") ||
      location.pathname.includes("/registro") ||
      location.pathname.includes("/recepcion") ||
      location.pathname.includes("/liberacion")
    ) {
      setOpenOperaciones(true);
    }
  }, [location.pathname]);

  const itemClass = `flex items-center ${
    openSidebar ? "gap-3 px-3" : "justify-center"
  } w-full py-2 rounded-xl transition-all duration-300`;

  const subItemClass = (path) =>
    `block w-full text-left text-xs px-2 py-1 rounded transition ${
      isActive(path)
        ? "bg-white/20 text-white shadow border-l-2 border-accent"
        : "text-white/70 hover:text-white hover:bg-white/10"
    }`;

  const groupButtonClass = `flex items-center justify-between w-full ${
    openSidebar ? "px-3" : "px-2"
  } py-2 rounded-xl transition-all duration-300`;

  return (
    <aside
      className={`h-screen ${
        openSidebar ? "w-64" : "w-20"
      } fixed md:relative z-40 flex flex-col transition-all duration-300 backdrop-blur-xl bg-primary border-r border-white/10`}
    >
      {/* LOGO */}
      <button
        onClick={() => setOpenSidebar(!openSidebar)}
        className="p-4 flex items-center gap-3 border-b border-white/10 hover:bg-white/10 transition w-full"
      >
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          className="w-10 h-10 object-contain"
        />

        {openSidebar && (
          <span className="font-bold text-lg tracking-wide text-white">
            ASTAP
          </span>
        )}
      </button>

      {/* CONTENIDO */}
      <div className="flex-1 p-3 space-y-2 text-sm overflow-y-auto">

        {/* MENÚ PRINCIPAL */}
        <button
          onClick={() => navigate("/")}
          className={`${itemClass} relative ${
            isActive("/")
              ? "bg-white/20 text-white shadow-lg before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent before:rounded-r"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          <LayoutDashboard size={18} />
          {openSidebar && "Menú Principal"}
        </button>

        {/* VEHÍCULOS */}
        <div>
          <button
            onClick={() => setOpenVehiculos((prev) => !prev)}
            className={`${groupButtonClass} ${
              isActive("/area/vehiculos") ||
              isActive("/informe") ||
              isActive("/inspeccion") ||
              isActive("/mantenimiento")
                ? "bg-white/10 text-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3">
              <Truck size={18} />
              {openSidebar && "Vehículos"}
            </span>

            {openSidebar &&
              (openVehiculos ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </button>

          {openSidebar && openVehiculos && (
            <div className="ml-8 mt-2 space-y-2">
              <button
                onClick={() => navigate("/area/vehiculos")}
                className={subItemClass("/area/vehiculos")}
              >
                Panel Vehículos
              </button>
              <button
                onClick={() => navigate("/informe")}
                className={subItemClass("/informe")}
              >
                Informes
              </button>
              <button
                onClick={() => navigate("/inspeccion")}
                className={subItemClass("/inspeccion")}
              >
                Inspección
              </button>
              <button
                onClick={() => navigate("/mantenimiento")}
                className={subItemClass("/mantenimiento")}
              >
                Mantenimiento
              </button>
            </div>
          )}
        </div>

        {/* AGUA */}
        <button
          onClick={() => navigate("/area/agua")}
          className={`${itemClass} relative ${
            isActive("/area/agua")
              ? "bg-white/20 text-white shadow-lg before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent before:rounded-r"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          <Droplet size={18} />
          {openSidebar && "Agua y Saneamiento"}
        </button>

        {/* PETRÓLEO */}
        <button
          onClick={() => navigate("/area/petroleo")}
          className={`${itemClass} relative ${
            isActive("/area/petroleo")
              ? "bg-white/20 text-white shadow-lg before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent before:rounded-r"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          <Fuel size={18} />
          {openSidebar && "Petróleo y Energía"}
        </button>

        {/* OPERACIONES */}
        <div>
          <button
            onClick={() => setOpenOperaciones((prev) => !prev)}
            className={`${groupButtonClass} ${
              isActive("/operaciones") ||
              isActive("/registro") ||
              isActive("/recepcion") ||
              isActive("/liberacion")
                ? "bg-white/10 text-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              {openSidebar && "Operaciones"}
            </span>

            {openSidebar &&
              (openOperaciones ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </button>

          {openSidebar && openOperaciones && (
            <div className="ml-8 mt-2 space-y-2">
              <button
                onClick={() => navigate("/operaciones")}
                className={subItemClass("/operaciones")}
              >
                Panel Operaciones
              </button>
              <button
                onClick={() => navigate("/registro")}
                className={subItemClass("/registro")}
              >
                Herramientas
              </button>
              <button
                onClick={() => navigate("/recepcion")}
                className={subItemClass("/recepcion")}
              >
                Recepción
              </button>
              <button
                onClick={() => navigate("/liberacion")}
                className={subItemClass("/liberacion")}
              >
                Liberación
              </button>
            </div>
          )}
        </div>

        {/* REPOSITORIOS */}
        <button
          onClick={() => navigate("/repositorios")}
          className={`${itemClass} relative ${
            isActive("/repositorios")
              ? "bg-white/20 text-white shadow-lg before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent before:rounded-r"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          <FolderOpen size={18} />
          {openSidebar && "Repositorios"}
        </button>

      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-white/10 text-xs text-white/50 text-center leading-tight">
        {openSidebar ? (
          <>
            <div>ASTAP © 2026</div>
            <div className="text-white/40 text-[10px]">
              By Santiago Avilés
            </div>
          </>
        ) : (
          "©"
        )}
      </div>
    </aside>
  );
}
