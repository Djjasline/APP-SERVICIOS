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
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  // 🔥 CONTROL SUBMENÚS
  const [openVehiculos, setOpenVehiculos] = useState(false);
  const [openOperaciones, setOpenOperaciones] = useState(false);

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

        {/* PANEL */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
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
            <span className="flex items-center gap-3">
              <Truck size={18} />
              Vehículos
            </span>
            <ChevronDown size={16} />
          </button>

          {openVehiculos && (
            <div className="ml-6 mt-1 space-y-1 text-xs text-gray-300">

              <button onClick={() => navigate("/area/vehiculos")}>
                Panel Vehículos
              </button>

              <button onClick={() => navigate("/informe")}>
                Informes
              </button>

              <button onClick={() => navigate("/inspeccion")}>
                Inspección
              </button>

              <button onClick={() => navigate("/mantenimiento")}>
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
          Agua
        </button>

        {/* ================= PETRÓLEO ================= */}
        <button
          onClick={() => navigate("/area/petroleo")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <Fuel size={18} />
          Petróleo
        </button>

        {/* ================= OPERACIONES ================= */}
        <div>
          <button
            onClick={() => setOpenOperaciones(!openOperaciones)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Operaciones
            </span>
            <ChevronDown size={16} />
          </button>

          {openOperaciones && (
            <div className="ml-6 mt-1 space-y-1 text-xs text-gray-300">

              <button onClick={() => navigate("/operaciones")}>
                Panel Operaciones
              </button>

              <button onClick={() => navigate("/registro")}>
                Herramientas
              </button>

              <button onClick={() => navigate("/recepcion")}>
                Recepción
              </button>

              <button onClick={() => navigate("/liberacion")}>
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
        by Santiago Avilés
      </div>
    </aside>
  );
}
