import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Fuel,
  Settings,
  FolderOpen,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col">

      {/* LOGO */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          className="w-10 h-10 object-contain"
        />
        <span className="font-bold text-lg">ASTAP</span>
      </div>

      {/* MENÚ */}
      <div className="flex-1 p-4 space-y-2 text-sm">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
        >
          <LayoutDashboard size={18} />
          Menú Principal
        </button>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Truck size={18} />
          Vehículos
        </button>

        <button
          onClick={() => navigate("/area/agua")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Droplet size={18} />
          Agua
        </button>

        <button
          onClick={() => navigate("/area/petroleo")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Fuel size={18} />
          Petróleo
        </button>

        <button
          onClick={() => navigate("/operaciones")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Settings size={18} />
          Operaciones
        </button>

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
        by Santiago Avilés
      </div>
    </aside>
  );
}
