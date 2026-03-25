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

      {/* ================= LOGO ================= */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          className="w-10 h-10 object-contain"
        />
        <span className="font-bold text-lg tracking-wide">
          ASTAP
        </span>
      </div>

      {/* ================= MENÚ ================= */}
      <div className="flex-1 p-4 space-y-2">

        <p className="text-xs uppercase text-gray-400 mb-3 px-2">
          Menú principal
        </p>

        {/* DASHBOARD */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
        >
          <LayoutDashboard size={18} />
          Menú Principal
        </button>

        {/* ÁREAS */}
        <button
          onClick={() => navigate("/area/vehiculos")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <Truck size={18} />
          Vehículos Especiales
        </button>

        <button
          onClick={() => navigate("/area/agua")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <Droplet size={18} />
          Agua y Saneamiento
        </button>

        <button
          onClick={() => navigate("/area/petroleo")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition"
        >
          <Fuel size={18} />
          Petróleo y Energía
        </button>

        {/* MÓDULOS */}
        <div className="pt-4 mt-4 border-t border-white/10 space-y-2">

          <button
            onClick={() => navigate("/operaciones")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <Settings size={18} />
            Operaciones
          </button>

          <button
            onClick={() => navigate("/repositorios")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <FolderOpen size={18} />
            Repositorios
          </button>

        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="p-4 border-t border-white/10 text-xs text-gray-400 text-center">
        ASTAP © 2026
      </div>
    </aside>
  );
}
