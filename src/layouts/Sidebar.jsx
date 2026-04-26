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

export default function Sidebar({ openSidebar, setOpenSidebar, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openVehiculos, setOpenVehiculos] = useState(true);
  const [openOperaciones, setOpenOperaciones] = useState(true);
  const [openAgua, setOpenAgua] = useState(false);
  const [openPetroleo, setOpenPetroleo] = useState(false);

  /* ================= ACTIVE ================= */
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  /* ================= AUTO OPEN ================= */
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

    if (location.pathname.includes("/area/agua")) {
      setOpenAgua(true);
    }

    if (location.pathname.includes("/area/petroleo")) {
      setOpenPetroleo(true);
    }
  }, [location.pathname]);

  /* ================= CLASES ================= */
  const itemClass = `flex items-center ${
    openSidebar ? "gap-3 px-3" : "justify-center"
  } w-full py-2 rounded-xl transition-all duration-300`;

  const subItemClass = (path) =>
    `block w-full text-left text-xs px-2 py-1 rounded transition ${
      isActive(path)
        ? "bg-white/20 text-white border-l-2 border-white pl-3"
        : "text-white/70 hover:text-white hover:bg-white/10"
    }`;

  const groupButtonClass = `flex items-center justify-between w-full ${
    openSidebar ? "px-3" : "px-2"
  } py-2 rounded-xl transition-all duration-300`;

  return (
    <aside
      className={`
        h-screen fixed top-0 left-0 z-50 flex flex-col
        transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        backdrop-blur-xl
        bg-gradient-to-b from-[#003366] to-[#001f3f]
        border-r border-white/10
        ${openSidebar ? "w-64" : isMobile ? "w-0" : "w-20"}
        ${!openSidebar && isMobile ? "overflow-hidden" : ""}
      `}
    >
      {/* ================= LOGO ================= */}
      <button
        onClick={() => setOpenSidebar(!openSidebar)}
        className="p-4 flex items-center gap-3 border-b border-white/10 hover:bg-white/10 transition w-full"
      >
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          className="w-10 h-10 object-contain transition-transform duration-300 hover:scale-105"
        />

        {openSidebar && (
          <span className="font-bold text-lg tracking-wide text-white">
            ASTAP
          </span>
        )}
      </button>

      {/* ================= CONTENIDO ================= */}
      <div className="flex-1 p-3 space-y-2 text-sm overflow-y-auto">

        {/* DASHBOARD */}
        <button
          onClick={() => {
            navigate("/");
            if (isMobile) setOpenSidebar(false);
          }}
          className={`${itemClass} ${
            isActive("/")
              ? "bg-white/20 text-white"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          <LayoutDashboard size={18} />
          {openSidebar && "Menú Principal"}
        </button>

        {/* VEHÍCULOS */}
        <div>
          <button
            onClick={() => setOpenVehiculos(!openVehiculos)}
            className={`${groupButtonClass} ${
              isActive("/vehiculos")
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3">
              <Truck size={18} />
              {openSidebar && "Vehículos"}
            </span>

            {openSidebar &&
              (openVehiculos ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>

          {openSidebar && openVehiculos && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button onClick={() => navigate("/area/vehiculos")} className={subItemClass("/area/vehiculos")}>
                Panel Vehículos
              </button>
              <button onClick={() => navigate("/informe")} className={subItemClass("/informe")}>
                Informes
              </button>
              <button onClick={() => navigate("/inspeccion")} className={subItemClass("/inspeccion")}>
                Inspección
              </button>
              <button onClick={() => navigate("/mantenimiento")} className={subItemClass("/mantenimiento")}>
                Mantenimiento
              </button>
            </div>
          )}
        </div>

        {/* AGUA */}
        <div>
          <button
            onClick={() => setOpenAgua(!openAgua)}
            className={`${groupButtonClass} ${
              isActive("/area/agua")
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3">
              <Droplet size={18} />
              {openSidebar && "Agua"}
            </span>

            {openSidebar &&
              (openAgua ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>

          {openSidebar && openAgua && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button onClick={() => navigate("/area/agua")} className={subItemClass("/area/agua")}>
                Panel Agua
              </button>
            </div>
          )}
        </div>

        {/* PETRÓLEO */}
        <div>
          <button
            onClick={() => setOpenPetroleo(!openPetroleo)}
            className={`${groupButtonClass} ${
              isActive("/area/petroleo")
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3">
              <Fuel size={18} />
              {openSidebar && "Petróleo"}
            </span>

            {openSidebar &&
              (openPetroleo ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>

          {openSidebar && openPetroleo && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button onClick={() => navigate("/area/petroleo")} className={subItemClass("/area/petroleo")}>
                Panel Petróleo
              </button>
            </div>
          )}
        </div>

        {/* OPERACIONES */}
        <div>
          <button
            onClick={() => setOpenOperaciones(!openOperaciones)}
            className={`${groupButtonClass} ${
              isActive("/operaciones")
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              {openSidebar && "Operaciones"}
            </span>

            {openSidebar &&
              (openOperaciones ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>

          {openSidebar && openOperaciones && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button onClick={() => navigate("/operaciones")} className={subItemClass("/operaciones")}>
                Panel Operaciones
              </button>
              <button onClick={() => navigate("/registro")} className={subItemClass("/registro")}>
                Herramientas
              </button>
              <button onClick={() => navigate("/recepcion")} className={subItemClass("/recepcion")}>
                Recepción
              </button>
              <button onClick={() => navigate("/liberacion")} className={subItemClass("/liberacion")}>
                Liberación
              </button>
            </div>
          )}
        </div>

        {/* REPOSITORIOS */}
        <button
          onClick={() => {
            navigate("/repositorios");
            if (isMobile) setOpenSidebar(false);
          }}
          className={`${itemClass} ${
            isActive("/repositorios")
              ? "bg-white/20 text-white"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          <FolderOpen size={18} />
          {openSidebar && "Repositorios"}
        </button>

      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-white/10 text-xs text-white/50 text-center">
        {openSidebar ? "ASTAP © 2026" : "©"}
      </div>
    </aside>
  );
}
