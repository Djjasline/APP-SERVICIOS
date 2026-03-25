import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const [openVehiculos, setOpenVehiculos] = useState(false);
  const [openOperaciones, setOpenOperaciones] = useState(true); // 🔥 abierto por defecto

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col">

      {/* LOGO */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img src="/astap-logo.jpg" className="w-10 h-10" />
        <span className="font-bold">ASTAP</span>
      </div>

      {/* MENÚ */}
      <div className="flex-1 p-4 space-y-2">

        {/* MENÚ PRINCIPAL */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-indigo-600"
        >
          <LayoutDashboard size={18} />
          Menú Principal
        </button>

        {/* ================= VEHÍCULOS ================= */}
        <div>
          <button
            onClick={() => setOpenVehiculos(!openVehiculos)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <Truck size={18} />
              Vehículos Especiales
            </div>
            {openVehiculos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openVehiculos && (
            <div className="ml-8 mt-1 space-y-1 text-sm">
              <button onClick={() => navigate("/informe")} className="block w-full text-left hover:text-blue-400">
                Informes
              </button>
              <button onClick={() => navigate("/inspeccion")} className="block w-full text-left hover:text-yellow-400">
                Inspección
              </button>
              <button onClick={() => navigate("/mantenimiento")} className="block w-full text-left hover:text-green-400">
                Mantenimiento
              </button>
            </div>
          )}
        </div>

        {/* ================= AGUA ================= */}
        <button
          onClick={() => navigate("/area/agua")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Droplet size={18} />
          Agua y Saneamiento
        </button>

        {/* ================= PETRÓLEO ================= */}
        <button
          onClick={() => navigate("/area/petroleo")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Fuel size={18} />
          Petróleo y Energía
        </button>

        {/* ================= OPERACIONES ================= */}
        <div>
          <button
            onClick={() => setOpenOperaciones(!openOperaciones)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <Settings size={18} />
              Operaciones
            </div>
            {openOperaciones ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openOperaciones && (
            <div className="ml-8 mt-1 space-y-1 text-sm">

              {/* 🔥 AQUÍ ESTÁ LO QUE TE FALTA */}
              <button
                onClick={() => navigate("/registro")}
                className="block w-full text-left hover:text-purple-400"
              >
                Herramientas
              </button>

              <button
                onClick={() => navigate("/recepcion")}
                className="block w-full text-left hover:text-red-400"
              >
                Recepción
              </button>

              <button
                onClick={() => navigate("/liberacion")}
                className="block w-full text-left hover:text-indigo-400"
              >
                Liberación
              </button>

            </div>
          )}
        </div>

        {/* ================= REPOSITORIOS ================= */}
        <button
          onClick={() => navigate("/repositorios")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <FolderOpen size={18} />
          Repositorios
        </button>

      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 text-xs text-gray-400 text-center">
        ASTAP © 2026
      </div>
    </aside>
  );
}
