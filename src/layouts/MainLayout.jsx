import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);

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
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            >
              ☰
            </button>

            <h1 className="text-lg font-semibold tracking-wide">
              Panel ASTAP
            </h1>
          </div>

          {/* DERECHA - USUARIO */}
          <div className="relative">
            <div
              onClick={() => setOpenMenu(!openMenu)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
            >
              👤
            </div>

            {/* MENU DESPLEGABLE */}
            {openMenu && (
              <div className="absolute right-0 mt-2 z-[9999] w-52 bg-[#0f172a] border border-white/10 rounded-xl shadow-lg p-3 text-sm backdrop-blur-xl">
                
                <div className="mb-2 text-gray-300 border-b border-white/10 pb-2">
                  👤 {user?.email || "Usuario"}
                </div>

                <div className="mb-2 text-xs text-gray-400">
                  Rol: {user?.role || "-"}
                </div>

                <button
                  onClick={() => {
                    logout();
                    setOpenMenu(false);
                  }}
                  className="w-full text-left text-red-400 hover:text-red-300 transition"
                >
                  🚪 Cerrar sesión
                </button>

              </div>
            )}
          </div>

        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6 text-gray-200">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl min-h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>  
  );
}
