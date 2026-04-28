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
  const [openRepositorios, setOpenRepositorios] = useState(false);

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

    if (location.pathname.includes("/area/agua")) setOpenAgua(true);
    if (location.pathname.includes("/area/petroleo")) setOpenPetroleo(true);
  }, [location.pathname]);

  /* ================= CLASES ================= */
  const itemBase = `
    group relative flex items-center w-full py-2 rounded-xl
    transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
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

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-gradient-to-b from-[#003366] to-[#001f3f]
        border-r border-white/10 backdrop-blur-xl
        transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        ${openSidebar ? "w-64" : "w-0"}
overflow-hidden
      `}
    >
      {/* ================= LOGO ================= */}
      <div
        onClick={() => setOpenSidebar(!openSidebar)}
        className="p-4 flex items-center gap-3 border-b border-white/10 cursor-pointer group hover:bg-white/10 transition"
      >
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {openSidebar && (
          <span className="font-bold text-lg tracking-wide text-white">
            ASTAP
          </span>
        )}
      </div>

      {/* ================= CONTENIDO ================= */}
      <div className="flex-1 p-3 space-y-2 text-sm overflow-y-auto">

        {/* DASHBOARD */}
        <div
          onClick={() => {
            navigate("/");
            if (isMobile) setOpenSidebar(false);
          }}
          className={itemClass(isActive("/"))}
        >
          <LayoutDashboard size={20} className={iconClass} />
          {openSidebar && "Menú Principal"}
          {tooltip("Menú Principal")}
        </div>

        {/* VEHÍCULOS */}
        <div>
          <div
            onClick={() => setOpenVehiculos(!openVehiculos)}
            className={itemClass(isActive("/vehiculos"))}
          >
            <Truck size={20} className={iconClass} />
            {openSidebar && "Vehículos"}
            {openSidebar &&
              (openVehiculos ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
            {tooltip("Vehículos")}
          </div>

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
  <div
    onClick={() => setOpenAgua(!openAgua)}
    className={itemClass(isActive("/area/agua"))}
  >
    <Droplet size={20} className={iconClass} />
    {openSidebar && "Agua"}

    {openSidebar &&
      (openAgua ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}

    {tooltip("Agua")}
  </div>

  {openSidebar && openAgua && (
    <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
      <button
        onClick={() => navigate("/area/agua")}
        className={subItemClass("/area/agua")}
      >
        Panel Agua
      </button>

      <button
        onClick={() => navigate("/agua/informe")}
        className={subItemClass("/agua/informe")}
      >
        Informes
      </button>

      <button
        onClick={() => navigate("/agua/inspeccion")}
        className={subItemClass("/agua/inspeccion")}
      >
        Inspección
      </button>
    </div>
  )}
</div>

        {/* PETRÓLEO */}
       <div>
  <div
    onClick={() => setOpenPetroleo(!openPetroleo)}
    className={itemClass(isActive("/area/petroleo"))}
  >
    <Fuel size={20} className={iconClass} />
    {openSidebar && "Petróleo"}

    {openSidebar &&
      (openPetroleo ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}

    {tooltip("Petróleo")}
  </div>

  {openSidebar && openPetroleo && (
    <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
      <button
        onClick={() => navigate("/area/petroleo")}
        className={subItemClass("/area/petroleo")}
      >
        Panel Petróleo
      </button>

      <button
        onClick={() => navigate("/petroleo/informe")}
        className={subItemClass("/petroleo/informe")}
      >
        Informes
      </button>

      <button
        onClick={() => navigate("/petroleo/inspeccion")}
        className={subItemClass("/petroleo/inspeccion")}
      >
        Inspección
      </button>
    </div>
  )}
</div>

        {/* OPERACIONES */}
        <div>
  <div
    onClick={() => setOpenOperaciones(!openOperaciones)}
    className={itemClass(isActive("/operaciones"))}
  >
    <Settings size={20} className={iconClass} />
    {openSidebar && "Operaciones"}

    {openSidebar &&
      (openOperaciones ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      ))}

    {tooltip("Operaciones")}
  </div>

  {openSidebar && openOperaciones && (
    <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
      <button
        onClick={() => navigate("/operaciones")}
        className={subItemClass("/operaciones")}
      >
        Panel Operaciones
      </button>

      <button
        onClick={() => navigate("/operaciones/registro")}
        className={subItemClass("/operaciones/registro")}
      >
        Registro
      </button>

      <button
        onClick={() => navigate("/operaciones/recepcion")}
        className={subItemClass("/operaciones/recepcion")}
      >
        Recepción
      </button>

      <button
        onClick={() => navigate("/operaciones/liberacion")}
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
    onClick={() => setOpenRepositorios(!openRepositorios)}
    className={itemClass(isActive("/repositorios"))}
  >
    <FolderOpen size={20} className={iconClass} />
    {openSidebar && "Repositorios"}

    {openSidebar &&
      (openRepositorios ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      ))}

    {tooltip("Repositorios")}
  </div>

  {openSidebar && openRepositorios && (
    <div className="ml-6 mt-2 space-y-1 border-l border-white/10 pl-3">
      
      <button
        onClick={() => navigate("/repositorios")}
        className={subItemClass("/repositorios")}
      >
        General
      </button>

      <button
        onClick={() => navigate("/repositorios/documentos")}
        className={subItemClass("/repositorios/documentos")}
      >
        Documentos
      </button>

      <button
        onClick={() => navigate("/repositorios/imagenes")}
        className={subItemClass("/repositorios/imagenes")}
      >
        Imágenes
      </button>

    </div>
  )}
</div>
      {/* FOOTER */}
     <div className="p-3 border-t border-white/10 text-xs text-white/50 text-center">
  {openSidebar ? (
    <div className="space-y-1">
      <p className="font-semibold text-white/80">ASTAP</p>
      <p>© 2026 • Santiago Avilés</p>
    </div>
  ) : (
    "©"
  )}
</div>
  );
}
