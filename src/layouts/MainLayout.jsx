import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { User, Bell, Moon, Sparkles, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import { getUnreadCount } from "../services/notificationService";
import { getUnreadAppUpdatesCount } from "@/services/appUpdatesService";
import { supabase } from "@/lib/supabase";
import TechnicalWritingAssistant from "@/components/TechnicalWritingAssistant";
import AutoCapitalizeInputs from "@/components/AutoCapitalizeInputs";
import { clearAppBadge, setAppBadgeCount } from "@/utils/appBadge";
import { playNotificationSound, unlockNotificationSound } from "@/utils/notificationSound";
import { useNotificaciones } from "@/hooks/useNotificaciones";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const signatureGestureSelector = ".signature-pad-canvas, [data-signature-field='true']";

const startsOnSignatureCanvas = (event) =>
  typeof event.target?.closest === "function" &&
  Boolean(event.target.closest(signatureGestureSelector));

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

  if (notification.record_type === "informe" && notification.record_id) {
    return `/vehiculos/informe/${notification.record_id}`;
  }

  if (notification.record_type === "capacitacion" && notification.record_id) {
    return `/vehiculos/capacitacion/${notification.record_id}`;
  }

  if (notification.record_type === "chat") return "/chat";

  return "/notifications";
}

async function forceAppReload() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.update()));
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.warn("No se pudo limpiar caché antes de recargar:", error);
  } finally {
    const url = new URL(window.location.href);
    url.searchParams.set("reload", Date.now().toString());
    window.location.replace(url.toString());
  }
}

export default function MainLayout() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const navigate = useNavigate();
  const { user, profile, logout, role, roleLabel, email } = useAuth();
  const { theme, isLight, isLiquid, nextTheme, toggleTheme } = useTheme();
  const [unread, setUnread] = useState(0);
  const [chatAlert, setChatAlert] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState({});
  const chatAlertTimer = useRef(null);
  const unreadRef = useRef(0);
  const unreadPollingReadyRef = useRef(false);
  const {
    permiso: pushPermiso,
    suscrito: pushSuscrito,
    cargando: pushCargando,
    error: pushError,
    soportado: pushSoportado,
    solicitarPermiso: activarPush,
    cancelarSuscripcion: desactivarPush,
  } = useNotificaciones();
  const nextThemeLabel = nextTheme === "light" ? "modo claro" : nextTheme === "liquid" ? "Liquid Glass" : "modo oscuro";

  useEffect(() => {
    unreadRef.current = unread;
  }, [unread]);

  useEffect(() => {
    let unlocked = false;
    const unlock = async () => {
      if (unlocked) return;
      unlocked = await unlockNotificationSound();

      if (unlocked) {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      }
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

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
        const notificationsCount = await getUnreadCount(email);
        const updatesCount = await getUnreadAppUpdatesCount(user?.id);
        const totalCount = (notificationsCount || 0) + (updatesCount || 0);
        if (mounted && unreadPollingReadyRef.current && totalCount > unreadRef.current) {
          playNotificationSound();
        }

        unreadPollingReadyRef.current = true;
        unreadRef.current = totalCount;

        if (mounted) setUnread(totalCount);
        setAppBadgeCount(totalCount);
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
  }, [email, user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const online = {};

        Object.keys(state).forEach((userId) => {
          online[userId] = true;
        });

        setUsuariosOnline(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      setUsuariosOnline({});
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const channel = supabase
      .channel(`layout-app-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "app_updates",
          filter: "active=eq.true",
        },
        () => {
          playNotificationSound();
          setUnread((prev) => {
            const next = (prev || 0) + 1;
            setAppBadgeCount(next);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    const handleMessage = (event) => {
      if (event.data?.type !== "PUSH_NOTIFICATION_RECEIVED") return;
      playNotificationSound();
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      className={`flex h-screen transition-colors duration-300 ${
        isLiquid
          ? "relative overflow-hidden bg-[#06142f] text-white"
          : isLight
          ? "bg-gradient-to-br from-slate-50 via-blue-50 to-white text-slate-900"
          : "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white"
      }`}
      /* ================= SWIPE ================= */
      onTouchStart={(e) => {
        if (startsOnSignatureCanvas(e)) {
          setTouchStartX(null);
          return;
        }

        setTouchStartX(e.touches[0].clientX);
      }}
      onTouchEnd={(e) => {
        if (!touchStartX) return;

        const diff = e.changedTouches[0].clientX - touchStartX;

        if (diff > 80) setOpenSidebar(true);
        if (diff < -80) setOpenSidebar(false);

        setTouchStartX(null);
      }}
      >
      {isLiquid && (
        <div className="liquid-glass-background" aria-hidden="true">
          <span className="liquid-orb liquid-orb-one" />
          <span className="liquid-orb liquid-orb-two" />
          <span className="liquid-orb liquid-orb-three" />
          <span className="liquid-grid" />
        </div>
      )}

      {chatAlert && (
        <button
          type="button"
          onClick={() => {
            setChatAlert(null);
            navigate(chatAlert.path || "/notifications");
          }}
          className={`fixed right-4 top-20 z-[9999] max-w-sm rounded-2xl border px-4 py-3 text-left shadow-2xl transition ${
            isLiquid
              ? "liquid-glass-panel border-white/25 text-white"
              : isLight
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
          app-sidebar
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
    app-content
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
          className={`app-header h-16 flex items-center justify-between px-6 backdrop-blur-xl border-b relative z-50 transition-colors ${
            isLiquid
              ? "liquid-glass-panel border-white/20 text-white shadow-2xl shadow-cyan-950/20"
              : isLight
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
            <button
              type="button"
              onClick={forceAppReload}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-red-700 active:scale-95"
              title="Recargar la aplicación"
            >
              Recargar
            </button>
          </div>

          {/* ================= AREA DERECHA: NOTIFICACIONES + USUARIO ================= */}
          <div className="flex items-center gap-4">
            {/* Icono notificaciones (link a /notifications) */}
            <Link
              to="/notifications"
              className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isLight ? "hover:bg-slate-100" : isLiquid ? "hover:bg-white/20" : "hover:bg-white/10"
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
                  isLiquid
                    ? "bg-white/10 border-white/25 shadow-lg shadow-cyan-950/20 hover:bg-white/25"
                    : isLight
                    ? "bg-slate-100 border-slate-200 hover:bg-slate-200"
                    : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || user?.email || "Usuario"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className={isLight ? "text-slate-700" : "text-white"} />
                )}
              </div>

              {openMenu && (
                <div
                  className={`absolute right-0 mt-2 w-64 backdrop-blur-xl border rounded-xl shadow-xl p-4 text-sm animate-fadeIn ${
                    isLiquid
                      ? "liquid-glass-panel border-white/25 text-white"
                      : isLight
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
                    {pushSoportado && pushPermiso !== "denied" && (
                      <button
                        onClick={pushSuscrito ? desactivarPush : activarPush}
                        disabled={pushCargando}
                        className={`text-left px-2 py-1 rounded ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"} disabled:opacity-60`}
                      >
                        {pushCargando
                          ? "Procesando push..."
                          : pushSuscrito
                          ? "🔔 Push activas en este dispositivo"
                          : "🔔 Activar push en este dispositivo"}
                      </button>
                    )}
                    {pushSoportado && pushPermiso === "denied" && (
                      <div className={`px-2 py-1 text-xs ${isLight ? "text-slate-500" : "text-slate-300"}`}>
                        Push bloqueadas por el navegador.
                      </div>
                    )}
                    {pushError && (
                      <div className="px-2 py-1 text-xs text-red-500">
                        {pushError}
                      </div>
                    )}
                    <button
                      onClick={toggleTheme}
                      className={`text-left px-2 py-1 rounded flex items-center gap-2 ${
                        isLight ? "hover:bg-slate-100" : "hover:bg-white/10"
                      }`}
                    >
                      {theme === "dark" ? <Sun size={15} /> : theme === "light" ? <Sparkles size={15} /> : <Moon size={15} />}
                      Usar {nextThemeLabel}
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
        <main className="app-main flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div
            className={`app-page-shell max-w-7xl mx-auto rounded-2xl backdrop-blur-xl border p-4 md:p-6 shadow-xl min-h-full transition-colors ${
              isLiquid
                ? "liquid-glass-shell border-white/20"
                : isLight
                ? "bg-white/80 border-slate-200"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Outlet context={{ usuariosOnline }} />
          </div>
        </main>
      </div>
    </div>
  );
}
