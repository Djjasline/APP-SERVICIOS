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
  BookOpen,
  Database,
} from "lucide-react";

export default function Sidebar({ openSidebar, setOpenSidebar, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

 const [openVehiculos, setOpenVehiculos] = useState(false);
const [openOperaciones, setOpenOperaciones] = useState(false);
const [openAgua, setOpenAgua] = useState(false);
const [openPetroleo, setOpenPetroleo] = useState(false);
const [openRepositorios, setOpenRepositorios] = useState(false);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
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
    path.startsWith("/area/agua") ||
    path.startsWith("/agua");

  const isPetroleoPath =
    path.startsWith("/area/petroleo") ||
    path.startsWith("/petroleo");

  const isOperacionesPath =
    path.startsWith("/operaciones") ||
    path.startsWith("/registro") ||
    path.startsWith("/recepcion") ||
    path.startsWith("/liberacion");

  const isRepositoriosPath =
    path.startsWith("/repositorios");

  setOpenVehiculos(isVehiculosPath);
  setOpenAgua(isAguaPath);
  setOpenPetroleo(isPetroleoPath);
  setOpenOperaciones(isOperacionesPath);
  setOpenRepositorios(isRepositoriosPath);
}, [location.pathname]);
  
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
      <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition">
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
      <div
        onClick={() => setOpenSidebar(!openSidebar)}
        className="p-4 flex items-center gap-3 border-b border-white/10 cursor-pointer hover:bg-white/10"
      >
        <img src="/astap-logo.jpg" className="w-10 h-10 object-contain" />
        {openSidebar && <span className="text-white font-bold">ASTAP</span>}
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 p-3 space-y-2 text-sm overflow-y-auto">
        {/* DASHBOARD */}
        <div onClick={() => go("/")} className={itemClass(isActive("/"))}>
          <LayoutDashboard size={20} className={iconClass} />
          {openSidebar && "Menú Principal"}
          {tooltip("Menú Principal")}
        </div>

        {/* VEHÍCULOS */}
        <div>
          <div
            onClick={() => {
  setOpenVehiculos(!openVehiculos);
  setOpenAgua(false);
  setOpenPetroleo(false);
  setOpenOperaciones(false);
  setOpenRepositorios(false);
}}
            className={itemClass(isActive("/vehiculos"))}
          >
            <Truck size={20} className={iconClass} />
            {openSidebar && "Vehículos"}
            {openSidebar && (openVehiculos ? <ChevronDown /> : <ChevronRight />)}
          </div>

          {openSidebar && openVehiculos && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button onClick={() => go("/area/vehiculos")} className={subItemClass("/area/vehiculos")}>
                Panel
              </button>
              <button
  onClick={() => go("/vehiculos/informe")}
  className={subItemClass("/vehiculos/informe")}
>
  Informes
</button>

<button
  onClick={() => go("/vehiculos/inspeccion")}
  className={subItemClass("/vehiculos/inspeccion")}
>
  Inspección
</button>

<button
  onClick={() => go("/vehiculos/mantenimiento")}
  className={subItemClass("/vehiculos/mantenimiento")}
>
  Mantenimiento
</button>
            </div>
          )}
        </div>

        {/* AGUA */}
        <div>
          <div
            onClick={() => {
  setOpenAgua(!openAgua);
  setOpenVehiculos(false);
  setOpenPetroleo(false);
  setOpenOperaciones(false);
  setOpenRepositorios(false);
}}
            className={itemClass(location.pathname.includes("/agua"))}
          >
            <Droplet size={20} className={iconClass} />
            {openSidebar && "Agua"}
            {openSidebar && (openAgua ? <ChevronDown /> : <ChevronRight />)}
          </div>

          {openSidebar && openAgua && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button onClick={() => go("/area/agua")} className={subItemClass("/area/agua")}>
                Panel
              </button>
              <button onClick={() => go("/agua/informe")} className={subItemClass("/agua/informe")}>
                Informes
              </button>
              <button onClick={() => go("/agua/recorrido/informe")} className={subItemClass("/agua/recorrido/informe")}>
  Recorrido
</button>
            </div>
          )}
        </div>

        {/* PETRÓLEO */}
        <div>
          <div
            onClick={() => {
  setOpenPetroleo(!openPetroleo);
  setOpenVehiculos(false);
  setOpenAgua(false);
  setOpenOperaciones(false);
  setOpenRepositorios(false);
}}
            className={itemClass(location.pathname.includes("/petroleo"))}
          >
            <Fuel size={20} className={iconClass} />
            {openSidebar && "Petróleo"}
            {openSidebar && (openPetroleo ? <ChevronDown /> : <ChevronRight />)}
          </div>

          {openSidebar && openPetroleo && (
  <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
    <button onClick={() => go("/area/petroleo")} className={subItemClass("/area/petroleo")}>
      Panel
    </button>

    <button
      onClick={() => go("/petroleo/informe")}
      className={subItemClass("/petroleo/informe")}
    >
      INFORMES DE INSPECCIÓN
    </button>
  </div>
)}
        </div>

     {/* OPERACIONES */}
<div>
  <div
    onClick={() => {
  setOpenOperaciones(!openOperaciones);
  setOpenVehiculos(false);
  setOpenAgua(false);
  setOpenPetroleo(false);
  setOpenRepositorios(false);
}}
    className={itemClass(isActive("/operaciones"))}
  >
    <Settings size={20} className={iconClass} />
    {openSidebar && "Operaciones"}
    {openSidebar && (openOperaciones ? <ChevronDown /> : <ChevronRight />)}
  </div>

  {openSidebar && openOperaciones && (
    <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
      <button
        onClick={() => go("/operaciones")}
        className={subItemClass("/operaciones")}
      >
        Panel
      </button>

      <button
        onClick={() => go("/operaciones/registro")}
        className={subItemClass("/operaciones/registro")}
      >
        Registro
      </button>

      <button
        onClick={() => go("/operaciones/recepcion")}
        className={subItemClass("/operaciones/recepcion")}
      >
        Bitácora Vehicular
      </button>

      <button
        onClick={() => go("/operaciones/liberacion")}
        className={subItemClass("/operaciones/liberacion")}
      >
        Liberación
      </button>
    </div>
  )}
</div>

        {/* REPOSITORIOS */}
        <div>
          <div
            onClick={() => {
  setOpenRepositorios(!openRepositorios);
  setOpenVehiculos(false);
  setOpenAgua(false);
  setOpenPetroleo(false);
  setOpenOperaciones(false);
}}
            className={itemClass(isActive("/repositorios"))}
          >
            <FolderOpen size={20} className={iconClass} />
            {openSidebar && "Repositorios"}
            {openSidebar && (openRepositorios ? <ChevronDown /> : <ChevronRight />)}
          </div>

          {openSidebar && openRepositorios && (
            <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
              <button
                onClick={() => go("/repositorios")}
                className={subItemClass("/repositorios")}
              >
                General
              </button>

              <button
                onClick={() => go("/repositorios/manuales-tecnicos")}
                className={subItemClass("/repositorios/manuales-tecnicos")}
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={14} />
                  Manuales técnicos
                </span>
              </button>

              <button
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
