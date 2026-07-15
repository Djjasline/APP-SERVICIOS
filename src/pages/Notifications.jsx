import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getNotifications,
  markNotificationRead,
} from "@/services/notificationService";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { setAppBadgeCount } from "@/utils/appBadge";
import { supabase } from "@/lib/supabase";
import {
  getAppUpdates,
  markAppUpdateRead,
} from "@/services/appUpdatesService";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

function getNotificationPath(notification) {
  if (notification.record_type === "app_update") return "";

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

  return "";
}

/*
 Página de Notificaciones in-app.
 Muestra las notificaciones del usuario logueado (por email).
 Permite marcar como leído y navegar al registro relacionado.
*/

export default function NotificationsPage() {
  const { email, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [markingVisible, setMarkingVisible] = useState(false);
  const navigate = useNavigate();
  const { isLight } = useTheme();

  const setItemsAndBadge = (updater) => {
    setItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setAppBadgeCount((next || []).filter((item) => !item.read).length);
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const data = await getNotifications(email);

      const notifications = Array.isArray(data) ? data : [];
      const updates = await getAppUpdates(user?.id);
      const allItems = [...updates, ...notifications].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );

      setItemsAndBadge(allItems);
      setLoading(false);
    };

    load();
  }, [email, user?.id]);

  useEffect(() => {
    const currentEmail = normalizeEmail(email);
    if (!currentEmail) return undefined;

    const channel = supabase
      .channel(`notifications-page-${currentEmail}`)
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

          setItemsAndBadge((prev) => {
            if (prev.some((item) => item.id === notification.id)) return prev;

            const next = [notification, ...prev];
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [email]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !item.read) ||
        (filter === "read" && item.read) ||
        (filter === "chat" && item.record_type === "chat") ||
        (filter === "updates" && item.isAppUpdate) ||
        (filter === "records" && !item.isAppUpdate && item.record_type !== "chat");

      if (!matchesFilter) return false;
      if (!q) return true;

      return [item.title, item.message, item.record_type, item.created_at]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, filter, search]);

  const unreadVisibleCount = filteredItems.filter((item) => !item.read).length;

  const filterButtons = [
    { key: "all", label: "Todos", count: items.length },
    { key: "unread", label: "No leídas", count: items.filter((item) => !item.read).length },
    { key: "read", label: "Leídas", count: items.filter((item) => item.read).length },
    { key: "chat", label: "Chat", count: items.filter((item) => item.record_type === "chat").length },
    { key: "updates", label: "Boletines", count: items.filter((item) => item.isAppUpdate).length },
    { key: "records", label: "Registros", count: items.filter((item) => !item.isAppUpdate && item.record_type !== "chat").length },
  ];

  const handleMarkRead = async (id) => {
    const item = items.find((notification) => notification.id === id);

      if (item?.isAppUpdate) {
      const ok = await markAppUpdateRead(user?.id, item.update_id || item.id);
      if (ok) updateReadState(id);
      return;
    }

    const ok = await markNotificationRead(id);

    if (ok) {
      setItemsAndBadge((prev) => {
        const next = prev.map((p) =>
          p.id === id
            ? {
                ...p,
                read: true,
              }
            : p
        );

        return next;
      });
    }
  };

  const handleMarkVisibleRead = async () => {
    const unreadVisible = filteredItems.filter((item) => !item.read);
    if (!unreadVisible.length || markingVisible) return;

    setMarkingVisible(true);

    const results = await Promise.all(
      unreadVisible.map(async (item) => {
        if (item.isAppUpdate) {
          const ok = await markAppUpdateRead(user?.id, item.update_id || item.id);
          return ok ? item.id : null;
        }

        const ok = await markNotificationRead(item.id);
        return ok ? item.id : null;
      })
    );

    const readIds = new Set(results.filter(Boolean));

    if (readIds.size > 0) {
      setItemsAndBadge((prev) => prev.map((item) => (readIds.has(item.id) ? { ...item, read: true } : item)));
    }

    setMarkingVisible(false);
  };

  const updateReadState = (id) => {
    setItemsAndBadge((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, read: true } : p));
      return next;
    });
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      if (notification.isAppUpdate) {
        const ok = await markAppUpdateRead(user?.id, notification.update_id || notification.id);
        if (ok) updateReadState(notification.id);
        return;
      }

      const ok = await markNotificationRead(notification.id);
      if (ok) updateReadState(notification.id);
    }

    const path = getNotificationPath(notification);
    if (path) navigate(path);
  };

  return (
    <div className={`min-h-[60vh] ${isLight ? "text-slate-900" : "text-white"}`}>
      <h1 className={`text-2xl font-semibold mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
        Notificaciones
      </h1>

      <div className={`mb-4 rounded-xl border p-3 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por mensaje, título, chat o registro..."
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none lg:max-w-md ${
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                : "border-white/10 bg-slate-950/40 text-white placeholder:text-slate-400"
            }`}
          />

          <button
            type="button"
            onClick={handleMarkVisibleRead}
            disabled={unreadVisibleCount === 0 || markingVisible}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              unreadVisibleCount === 0 || markingVisible
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {markingVisible ? "Marcando..." : `Marcar visibles como leído (${unreadVisibleCount})`}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              type="button"
              onClick={() => setFilter(button.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === button.key
                  ? "bg-blue-600 text-white"
                  : isLight
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {button.label} ({button.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-white"}`}>
          Cargando...
        </p>
      ) : items.length === 0 ? (
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-white"}`}>
          No tienes notificaciones.
        </p>
      ) : filteredItems.length === 0 ? (
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-white"}`}>
          No hay notificaciones con esos filtros.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredItems.map((n) => (
            <li
              key={n.id}
              className={`p-3 border rounded-lg flex justify-between items-start ${
                isLight
                  ? n.read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                  : n.read
                  ? "border-white/10 bg-white/5"
                  : "border-white/10 bg-white/10"
              }`}
            >
              <div>
                <div className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {n.title}
                </div>

                {n.isAppUpdate && (
                  <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${isLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-200"}`}>
                    Boletín de actualización
                  </div>
                )}

                <div className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                  {n.message}
                </div>

                <div className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {n.created_at
                    ? new Date(n.created_at).toLocaleString()
                    : ""}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className={`text-xs hover:underline ${isLight ? "text-green-700" : "text-green-400"}`}
                  >
                    Marcar como leído
                  </button>
                )}

                {n.record_id && (
  <button
    onClick={() => handleOpenNotification(n)}
    className={`text-xs hover:underline ${isLight ? "text-blue-700" : "text-blue-300"}`}
  >
    {n.record_type === "chat" ? "Abrir chat" : "Ir al formulario"}
  </button>
)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
