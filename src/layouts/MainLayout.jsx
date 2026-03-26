import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white">
      
      {/* SIDEBAR */}
      <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col backdrop-blur-xl">
        
        {/* HEADER (LIQUID GLASS) */}
        <header className="h-16 flex items-center justify-between px-6 
        backdrop-blur-xl bg-white/5 border-b border-white/10">

          <div className="flex items-center gap-4">
            {/* BOTÓN MOBILE */}
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

          {/* ACCIONES DERECHA */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              👤
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* CONTENEDOR GLASS */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}
