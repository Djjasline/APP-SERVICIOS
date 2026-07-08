import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { User, Bell, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import { getUnreadCount } from "../services/notificationService";
import { supabase } from "@/lib/supabase";
import TechnicalWritingAssistant from "@/components/TechnicalWritingAssistant";
import AutoCapitalizeInputs from "@/components/AutoCapitalizeInputs";
import { clearAppBadge, setAppBadgeCount } from "@/utils/appBadge";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

function getNotificationPath(notification) {
  if (notification.record_type === "registro" && notification.record_id) {
    return `/operaciones/registro/${notification.record_id}`;
  }

  if (notification.record_type === "recepcion" && notification.record_id) {
    return `/operaciones/recepcion/${notification.record_id}`;
  }

  if (notification.record_type === "liberacion" && notification.record_id) {
    return `/operaciones/liberacion/${notification.record_id}`;
  }

  if (notification.record_type === "chat") return "/chat";

  return "/notifications";
}

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.32);
  } catch (error) {
    console.warn("No se pudo reproducir sonido de notificación:", error);
  }
}

export default function MainLayout() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const navigate = useNavigate();
  const { user, logout, role, roleLabel, email } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const [unread, setUnread] = useState(0);
  const [chatAlert, setChatAlert] = useState(null);
  const chatAlertTimer = useRef(null);
  const unreadRef = useRef(0);

  useEffect(() => {
    unreadRef.current = unread;
  }, [unread]);

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

  /* =========================
     POLL NOTIFICACIONES NO LEIDAS
  ========================= */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!email) {
        if (mounted) setUnread(0);
        clearAppBadge();
        return;
      }
      try {
        const count = await getUnreadCount(email);
        if (mounted) setUnread(count || 0);
        setAppBadgeCount(count || 0);
      } catch (e) {
        console.error("Error cargando notificaciones:", e);
      }
    };

    load();
    const t = setInterval(load, 5000); // respaldo si Realtime no está activo

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      clearInterval(t);
      window.removeEventListener("focus", handleFocus);
    };
  }, [email]);

  useEffect(() => {
    const currentEmail = normalizeEmail(email);
    if (!currentEmail) return undefined;

    const channel = supabase
      .channel(`layout-notifications-${currentEmail}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notification = payload.new;
          if (!notification) return;

          const recipientEmail = normalizeEmail(notification.recipient_email);
          if (recipientEmail && recipientEmail !== currentEmail) return;

          const title = notification.title || "Nueva notificación";
          const message = String(notification.message || "").trim();
          const alert = {
            title,
            message: message.length > 90 ? `${message.slice(0, 90)}...` : message || "Tienes una notificación nueva.",
            path: getNotificationPath(notification),
          };

          playNotificationSound();
          setChatAlert(alert);

          if (chatAlertTimer.current) clearTimeout(chatAlertTimer.current);
          chatAlertTimer.current = setTimeout(() => setChatAlert(null), 6000);

          if (!notification.read) {
            setUnread((prev) => {
              const next = (prev || 0) + 1;
              setAppBadgeCount(next);
              return next;
            });
          }

          // La notificación de sistema la maneja el service worker push.
          // Aquí solo actualizamos campana, badge e indicador interno.
        }
      )
      .subscribe();

    return () => {
      if (chatAlertTimer.current) clearTimeout(chatAlertTimer.current);
      supabase.removeChannel(channel);
    };
  }, [email, navigate]);

  return (
    <div
      className={`flex h-screen transition-colors duration-300 ${
        isLight
          ? "bg-gradient-to-br from-slate-50 via-blue-50 to-white text-slate-900"
          : "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white"
      }`}
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
      {chatAlert && (
        <button
          type="button"
          onClick={() => {
            setChatAlert(null);
            navigate(chatAlert.path || "/notifications");
          }}
          className={`fixed right-4 top-20 z-[9999] max-w-sm rounded-2xl border px-4 py-3 text-left shadow-2xl transition ${
            isLight
              ? "border-blue-200 bg-white text-slate-900"
              : "border-white/10 bg-slate-950 text-white"
          }`}
        >
          <div className="text-sm font-semibold">{chatAlert.title}</div>
          <div className={`mt-1 text-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            {chatAlert.message}
          </div>
        </button>
      )}

      <TechnicalWritingAssistant />
      <AutoCapitalizeInputs />

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50
          transition-all duration-300 ease-smooth
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
        <header
          className={`h-16 flex items-center justify-between px-6 backdrop-blur-xl border-b relative z-50 transition-colors ${
            isLight
              ? "bg-white/85 border-slate-200 text-slate-900 shadow-sm"
              : "bg-white/5 border-white/10 text-white"
          }`}
        >
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

          {/* ================= AREA DERECHA: NOTIFICACIONES + USUARIO ================= */}
          <div className="flex items-center gap-4">
            {/* Icono notificaciones (link a /notifications) */}
            <Link
              to="/notifications"
              className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isLight ? "hover:bg-slate-100" : "hover:bg-white/10"
              }`}
              title="Notificaciones"
            >
              <Bell size={18} className={isLight ? "text-slate-700" : "text-white"} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold text-white bg-red-600 rounded-full">
                  {unread}
                </span>
              )}
            </Link>

            {/* USUARIO */}
            <div className="relative z-[9999]">
              <div
                onClick={() => setOpenMenu(!openMenu)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  isLight
                    ? "bg-slate-100 border-slate-200 hover:bg-slate-200"
                    : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
              >
                <User size={18} className={isLight ? "text-slate-700" : "text-white"} />
              </div>

              {openMenu && (
                <div
                  className={`absolute right-0 mt-2 w-64 backdrop-blur-xl border rounded-xl shadow-xl p-4 text-sm animate-fadeIn ${
                    isLight
                      ? "bg-white/95 border-slate-200 text-slate-900"
                      : "bg-black/70 border-white/20 text-white"
                  }`}
                >
                  {/* INFO USUARIO */}
                  <div className={`mb-3 border-b pb-2 ${isLight ? "border-slate-200" : "border-white/20"}`}>
                    <div className="font-semibold">
                      {user?.email || "Usuario"}
                    </div>
                    <div className={`text-xs ${isLight ? "text-slate-500" : "text-gray-300"}`}>
                      Rol: {roleLabel || role || "-"}
                    </div>
                  </div>

                  {/* OPCIONES */}
                  <div className="flex flex-col gap-2 text-sm">
                    <button
                      onClick={() => {
                        navigate("/perfil");
                        setOpenMenu(false);
                      }}
                      className={`text-left px-2 py-1 rounded ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
                    >
                      👤 Mi perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate("/notifications");
                        setOpenMenu(false);
                      }}
                      className={`text-left px-2 py-1 rounded ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
                    >
                      🔔 Ver notificaciones
                    </button>
                    <button
                      onClick={toggleTheme}
                      className={`text-left px-2 py-1 rounded flex items-center gap-2 ${
                        isLight ? "hover:bg-slate-100" : "hover:bg-white/10"
                      }`}
                    >
                      {isLight ? <Moon size={15} /> : <Sun size={15} />}
                      {isLight ? "Usar modo oscuro" : "Usar modo claro"}
                    </button>
                  </div>

                  <div className={`border-t my-3 ${isLight ? "border-slate-200" : "border-white/20"}`} />

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
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div
            className={`max-w-7xl mx-auto rounded-2xl backdrop-blur-xl border p-4 md:p-6 shadow-xl min-h-full transition-colors ${
              isLight
                ? "bg-white/80 border-slate-200"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
