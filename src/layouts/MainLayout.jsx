import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const navigate = useNavigate();
const { user, logout, role } = useAuth();

  /* =========================
     DETECTAR DISPOSITIVO REAL
  ========================= */
  useEffect(() => {
    const handleResize = () => {
      const isTabletOrMobile =
        window.innerWidth <= 1024 || window.innerHeight > window.innerWidth;

      setIsMobile(isTabletOrMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =========================
     AUTO OCULTAR SIDEBAR
  ========================= */
  useEffect(() => {
    if (isMobile) {
      setOpenSidebar(false);
    } else {
      setOpenSidebar(true);
    }
  }, [isMobile]);

  return (
    <div
      className="flex h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]"

      /* ================= SWIPE ================= */
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (!touchStartX) return;

        const diff = e.changedTouches[0].clientX - touchStartX;

        if (diff > 80) setOpenSidebar(true);
        if (diff < -80) setOpenSidebar(false);

        setTouchStartX(null);
      }}
    >

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50
          transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          ${openSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          openSidebar={openSidebar}
          setOpenSidebar={setOpenSidebar}
        />
      </div>

      {/* ================= OVERLAY ================= */}
      {isMobile && openSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      {/* ================= CONTENIDO ================= */}
      <div
  className={`
    flex-1 flex flex-col transition-all duration-300
    ${
      isMobile
        ? "ml-0"
        : openSidebar
        ? "ml-64"
        : "ml-0"
    }
  `}
>

        {/* ================= HEADER ================= */}
        <header className="h-16 flex items-center justify-between px-6 backdrop-blur-xl bg-white/5 border-b border-white/10 relative z-50 text-white">

          {/* IZQUIERDA */}
          <div className="flex items-center gap-4">

            {/* LOGO COMO BOTÓN */}
            <div
              onClick={() => setOpenSidebar(!openSidebar)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                className="h-10 transition-transform duration-300 group-hover:scale-105"
              />

              <span className="text-lg font-semibold tracking-wide hidden md:block">
                ASTAP
              </span>
            </div>

          </div>

{/* ================= USUARIO ================= */}
<div className="relative z-[9999]">

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

  {openMenu && (
    <div className="absolute right-0 mt-2 w-60 
      bg-black/70 backdrop-blur-xl 
      border border-white/20 rounded-xl shadow-xl 
      p-4 text-sm text-white animate-fadeIn">

      {/* INFO USUARIO */}
      <div className="mb-3 border-b border-white/20 pb-2">
        <div className="font-semibold">
          {user?.email || "Usuario"}
        </div>
        <div className="text-xs text-gray-300">
          Rol: {role || "-"}
        </div>
      </div>

      {/* OPCIONES */}
      <div className="flex flex-col gap-2 text-sm">

        <button
          onClick={() => {
            navigate("/informe");
            setOpenMenu(false);
            setOpenSidebar(false);
          }}
          className="text-left hover:bg-white/10 px-2 py-1 rounded"
        >
          📄 Mis informes
        </button>

        <button
          onClick={() => {
            navigate("/inspeccion");
            setOpenMenu(false);
            setOpenSidebar(false);
          }}
          className="text-left hover:bg-white/10 px-2 py-1 rounded"
        >
          📊 Inspecciones
        </button>

        <button
          onClick={() => {
            navigate("/mantenimiento");
            setOpenMenu(false);
            setOpenSidebar(false);
          }}
          className="text-left hover:bg-white/10 px-2 py-1 rounded"
        >
          🛠 Mantenimiento
        </button>

      </div>

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

        {/* ================= MAIN ================= */}
       <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
  <div className="max-w-7xl mx-auto rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 shadow-xl min-h-full">
    <Outlet />
  </div>
</main>

      </div>
    </div>
  );
}
