import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Fuel,
  Settings,
  FolderOpen,
} from "lucide-react";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 z-50
      bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col
      transform transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* LOGO */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img src="/astap-logo.jpg" className="w-10 h-10" />
        <span className="font-bold">ASTAP</span>
      </div>

      {/* MENÚ */}
      <div className="flex-1 p-4 space-y-2 text-sm">
        <button onClick={() => navigate("/")} className="menu">
          <LayoutDashboard size={18} /> Menú Principal
        </button>

        <button onClick={() => navigate("/area/vehiculos")} className="menu">
          <Truck size={18} /> Vehículos
        </button>

        <button onClick={() => navigate("/area/agua")} className="menu">
          <Droplet size={18} /> Agua
        </button>

        <button onClick={() => navigate("/area/petroleo")} className="menu">
          <Fuel size={18} /> Petróleo
        </button>

        <button onClick={() => navigate("/operaciones")} className="menu">
          <Settings size={18} /> Operaciones
        </button>

        <button onClick={() => navigate("/repositorios")} className="menu">
          <FolderOpen size={18} /> Repositorios
        </button>
      </div>

      {/* FOOTER */}
      <div className="p-4 text-xs text-center text-gray-400">
        ASTAP © 2026
      </div>
    </aside>
  );
}
