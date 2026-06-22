import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getNotifications,
  markNotificationRead,
} from "@/services/notificationService";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";

/*
 Página de Notificaciones in-app.
 Muestra las notificaciones del usuario logueado (por email).
 Permite marcar como leído y navegar al registro relacionado.
*/

export default function NotificationsPage() {
  const { email } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isLight } = useTheme();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const data = await getNotifications(email);

      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    load();
  }, [email]);

  const handleMarkRead = async (id) => {
    const ok = await markNotificationRead(id);

    if (ok) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                read: true,
              }
            : p
        )
      );
    }
  };

  return (
    <div className={`min-h-[60vh] ${isLight ? "text-slate-900" : "text-white"}`}>
      <h1 className={`text-2xl font-semibold mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
        Notificaciones
      </h1>

      {loading ? (
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-white"}`}>
          Cargando...
        </p>
      ) : items.length === 0 ? (
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-white"}`}>
          No tienes notificaciones.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
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
    onClick={() => {
      if (n.record_type === "registro") {
        navigate(`/operaciones/registro/${n.record_id}`);
      }

      if (n.record_type === "recepcion") {
        navigate(`/operaciones/recepcion/${n.record_id}`);
      }

      if (n.record_type === "liberacion") {
        navigate(`/operaciones/liberacion/${n.record_id}`);
      }
    }}
    className={`text-xs hover:underline ${isLight ? "text-blue-700" : "text-blue-300"}`}
  >
    Ir al formulario
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
