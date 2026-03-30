import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]">

      {/* SIDEBAR */}
      <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 backdrop-blur-xl bg-white/5 border-b border-white/10 relative z-50 text-white">

          {/* IZQUIERDA */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpenSidebar(!openSidebar)}
              className="md:hidden p-2 rounded-lg hover:bg-black/50 transition"
            >
              ☰
            </button>

            <h1 className="text-lg font-semibold tracking-wide">
              Panel ASTAP
            </h1>
          </div>

          {/* DERECHA - USUARIO */}
          <div className="relative z-[9999]">

            {/* BOTÓN USUARIO */}
            <div
              onClick={() => setOpenMenu(!openMenu)}
              className="w-10 h-10 rounded-full 
              bg-white/10 backdrop-blur-md 
              border border-white/20 
              flex items-center justify-center 
              cursor-pointer 
              hover:bg-white/20 transition-all duration-200"
            >
              <User size={18} className="text-white" />
            </div>

            {/* MENU GLASS */}
            {openMenu && (
              <div className="absolute right-0 mt-2 w-60 
                bg-black/70 backdrop-blur-xl 
                border border-white/20 rounded-xl shadow-xl 
                p-4 text-sm text-white">

                {/* USER INFO */}
                <div className="mb-3 border-b border-white/20 pb-2">
                  <div className="font-semibold">
                    {user?.email || "Usuario"}
                  </div>
                  <div className="text-xs text-gray-300">
                    Rol: {user?.role || "-"}
                  </div>
                </div>

                {/* OPCIONES */}
                <div className="flex flex-col gap-2 text-sm">

                  <button
                    onClick={() => {
                      navigate("/perfil");
                      setOpenMenu(false);
                    }}
                    className="text-left hover:bg-white/10 px-2 py-1 rounded"
                  >
                    👤 Mi perfil
                  </button>

                  <button
                    onClick={() => {
                      navigate("/informe");
                      setOpenMenu(false);
                    }}
                    className="text-left hover:bg-white/10 px-2 py-1 rounded"
                  >
                    📄 Mis informes
                  </button>

                  <button
                    onClick={() => {
                      navigate("/inspeccion");
                      setOpenMenu(false);
                    }}
                    className="text-left hover:bg-white/10 px-2 py-1 rounded"
                  >
                    📊 Inspecciones
                  </button>

                  <button
                    onClick={() => {
                      navigate("/mantenimiento");
                      setOpenMenu(false);
                    }}
                    className="text-left hover:bg-white/10 px-2 py-1 rounded"
                  >
                    🛠 Mantenimiento
                  </button>

                </div>

                {/* SEPARADOR */}
                <div className="border-t border-white/20 my-3" />

                {/* LOGOUT */}
                <button
                  onClick={() => {
                    logout();
                    setOpenMenu(false);
                  }}
                  className="w-full text-left text-red-400 hover:text-red-300"
                >
                  🚪 Cerrar sesión
                </button>

              </div>
            )}

          </div>

        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl min-h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
