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

export default function Sidebar() {
  const navigate = useNavigate();

  const [openVehiculos, setOpenVehiculos] = useState(true);
  const [openOperaciones, setOpenOperaciones] = useState(true);

  const subItemClass =
    "block w-full text-left text-xs text-gray-300 hover:text-white transition";
  const itemClass =
    "flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition";
  const groupButtonClass =
    "flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10 transition";

  return (
    <aside className="h-screen w-64 shrink-0 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col border-r border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          className="w-10 h-10 object-contain"
        />
        <span className="font-bold text-lg">ASTAP</span>
      </div>

      <div className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          type="button"
        >
          <LayoutDashboard size={18} />
          Menú Principal
        </button>

        <div>
          <button
            onClick={() => setOpenVehiculos((prev) => !prev)}
            className={groupButtonClass}
            type="button"
          >
            <span className="flex items-center gap-3">
              <Truck size={18} />
              Vehículos Especiales
            </span>
            {openVehiculos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openVehiculos && (
            <div className="ml-8 mt-2 space-y-2">
              <button
                onClick={() => navigate("/area/vehiculos")}
                className={subItemClass}
                type="button"
              >
                Panel Vehículos
              </button>

              <button
                onClick={() => navigate("/informe")}
                className={subItemClass}
                type="button"
              >
                Informes
              </button>

              <button
                onClick={() => navigate("/inspeccion")}
                className={subItemClass}
                type="button"
              >
                Inspección
              </button>

              <button
                onClick={() => navigate("/mantenimiento")}
                className={subItemClass}
                type="button"
              >
                Mantenimiento
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/area/agua")}
          className={itemClass}
          type="button"
        >
          <Droplet size={18} />
          Agua y Saneamiento
        </button>

        <button
          onClick={() => navigate("/area/petroleo")}
          className={itemClass}
          type="button"
        >
          <Fuel size={18} />
          Petróleo y Energía
        </button>

        <div>
          <button
            onClick={() => setOpenOperaciones((prev) => !prev)}
            className={groupButtonClass}
            type="button"
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Operaciones
            </span>
            {openOperaciones ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openOperaciones && (
            <div className="ml-8 mt-2 space-y-2">
              <button
                onClick={() => navigate("/operaciones")}
                className={subItemClass}
                type="button"
              >
                Panel Operaciones
              </button>

              <button
                onClick={() => navigate("/registro")}
                className={subItemClass}
                type="button"
              >
                Herramientas
              </button>

              <button
                onClick={() => navigate("/recepcion")}
                className={subItemClass}
                type="button"
              >
                Recepción
              </button>

              <button
                onClick={() => navigate("/liberacion")}
                className={subItemClass}
                type="button"
              >
                Liberación
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/repositorios")}
          className={itemClass}
          type="button"
        >
          <FolderOpen size={18} />
          Repositorios
        </button>
      </div>

      <div className="p-4 border-t border-white/10 text-xs text-gray-400 text-center">
        ASTAP © 2026 by Santiago Avilés
      </div>
    </aside>
  );
}
