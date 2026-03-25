import { Outlet, useNavigate, useLocation } from "react-router-dom";
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

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col">

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

          {/* ================= VEHÍCULOS ================= */}
          <button
            onClick={() => toggleMenu("vehiculos")}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <Truck size={18} />
              Vehículos Especiales
            </div>

            {openMenu === "vehiculos" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* SUBMENÚ VEHÍCULOS */}
          {openMenu === "vehiculos" && (
            <div className="ml-8 space-y-1 text-sm">

              <button
                onClick={() => navigate("/informes")}
                className="block w-full text-left px-2 py-1 rounded hover:bg-white/10"
              >
                📄 Informes
              </button>

              <button
                onClick={() => navigate("/inspeccion")}
                className="block w-full text-left px-2 py-1 rounded hover:bg-white/10"
              >
                🔍 Inspección
              </button>

              <button
                onClick={() => navigate("/mantenimiento")}
                className="block w-full text-left px-2 py-1 rounded hover:bg-white/10"
              >
                🛠 Mantenimiento
              </button>

            </div>
          )}

          {/* ================= OTRAS ÁREAS (sin submenu aún) ================= */}

          <button
            onClick={() => navigate("/area/agua")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <Droplet size={18} />
            Agua y Saneamiento
          </button>

          <button
            onClick={() => navigate("/area/petroleo")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <Fuel size={18} />
            Petróleo y Energía
          </button>

          {/* ================= MÓDULOS ================= */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">

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
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 text-xs text-gray-400 text-center">
          ASTAP © 2026
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

    </div>
  );
}
