import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

  const [openVehiculos, setOpenVehiculos] = useState(true);
  const [openOperaciones, setOpenOperaciones] = useState(true);

  const itemClass = `flex items-center ${
    openSidebar ? "gap-3 px-3" : "justify-center"
  } w-full py-2 rounded-xl hover:bg-white/10 transition-all duration-300`;

  const subItemClass =
    "block w-full text-left text-xs text-gray-300 hover:text-white transition";

  const groupButtonClass = `flex items-center justify-between w-full ${
    openSidebar ? "px-3" : "px-2"
  } py-2 rounded-xl hover:bg-white/10 transition-all duration-300`;

  return (
    <aside
      className={`h-screen ${
        openSidebar ? "w-64" : "w-20"
      } fixed md:relative z-40 flex flex-col transition-all duration-300 backdrop-blur-xl bg-white/5 border-r border-white/10`}
    >
      {/* LOGO = BOTÓN */}
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
          <span className="font-bold text-lg tracking-wide">
            ASTAP
          </span>
        )}
      </button>

      {/* CONTENIDO */}
      <div className="flex-1 p-3 space-y-2 text-sm overflow-y-auto">
        
        {/* MENÚ PRINCIPAL */}
        <button
          onClick={() => navigate("/")}
          className={`${itemClass} bg-indigo-600/80 hover:bg-indigo-500`}
        >
          <LayoutDashboard size={18} />
          {openSidebar && "Menú Principal"}
        </button>

        {/* VEHÍCULOS */}
        <div>
          <button
            onClick={() => setOpenVehiculos((prev) => !prev)}
            className={groupButtonClass}
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
              <button onClick={() => navigate("/area/vehiculos")} className={subItemClass}>
                Panel Vehículos
              </button>
              <button onClick={() => navigate("/informe")} className={subItemClass}>
                Informes
              </button>
              <button onClick={() => navigate("/inspeccion")} className={subItemClass}>
                Inspección
              </button>
              <button onClick={() => navigate("/mantenimiento")} className={subItemClass}>
                Mantenimiento
              </button>
            </div>
          )}
        </div>

        {/* AGUA */}
        <button onClick={() => navigate("/area/agua")} className={itemClass}>
          <Droplet size={18} />
          {openSidebar && "Agua y Saneamiento"}
        </button>

        {/* PETRÓLEO */}
        <button onClick={() => navigate("/area/petroleo")} className={itemClass}>
          <Fuel size={18} />
          {openSidebar && "Petróleo y Energía"}
        </button>

        {/* OPERACIONES */}
        <div>
          <button
            onClick={() => setOpenOperaciones((prev) => !prev)}
            className={groupButtonClass}
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
              <button onClick={() => navigate("/operaciones")} className={subItemClass}>
                Panel Operaciones
              </button>
              <button onClick={() => navigate("/registro")} className={subItemClass}>
                Herramientas
              </button>
              <button onClick={() => navigate("/recepcion")} className={subItemClass}>
                Recepción
              </button>
              <button onClick={() => navigate("/liberacion")} className={subItemClass}>
                Liberación
              </button>
            </div>
          )}
        </div>

        {/* REPOSITORIOS */}
        <button onClick={() => navigate("/repositorios")} className={itemClass}>
          <FolderOpen size={18} />
          {openSidebar && "Repositorios"}
        </button>
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-white/10 text-xs text-gray-400 text-center">
        {openSidebar ? "ASTAP © 2026" : "©"}
      </div>
    </aside>
  );
}
