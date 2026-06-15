import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, markNotificationRead } from "@/services/notificationService";
import { useNavigate } from "react-router-dom";

/*
 Página de Notificaciones in‑app.
 Muestra las notificaciones del usuario logueado (por email).
 Permite marcar como leído y navegar al registro relacionado.
*/

export default function NotificationsPage() {
  const { email } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, read: true } : p)));
    }
  };

  return (
    <div className="min-h-[60vh]">
      <h1 className="text-2xl font-semibold mb-4">Notificaciones</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No tienes notificaciones.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`p-3 border rounded flex justify-between items-start ${
                n.read ? "bg-white/5" : "bg-white/10"
              }`}
            >
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-300">{n.message}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-xs text-green-400 hover:underline"
                  >
                    Marcar como leído
                  </button>
                )}

                {n.record_type === "registro" && n.record_id && (
                  <button
                    onClick={() => navigate(`/operaciones/registro/${n.record_id}`)}
                    className="text-xs text-blue-300 hover:underline"
                  >
                    Ir al registro
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
