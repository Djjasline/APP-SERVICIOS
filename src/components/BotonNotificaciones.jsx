/**
 * BotonNotificaciones.jsx
 * Componente para activar/desactivar notificaciones push.
 * Colócalo en la pantalla de perfil o ajustes del usuario.
 */

import { useNotificaciones } from "@/hooks/useNotificaciones"; // ajusta la ruta
import { Bell, BellOff, Loader2 } from "lucide-react";

export function BotonNotificaciones() {
  const {
    permiso,
    suscrito,
    cargando,
    error,
    soportado,
    solicitarPermiso,
    cancelarSuscripcion,
  } = useNotificaciones();

  if (!soportado) return null;

  if (permiso === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <BellOff size={16} className="text-gray-400" />
        <span>Notificaciones bloqueadas en el navegador</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={suscrito ? cancelarSuscripcion : solicitarPermiso}
        disabled={cargando}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${suscrito
            ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            : "bg-blue-700 text-white hover:bg-blue-800"
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        {cargando ? (
          <Loader2 size={16} className="animate-spin" />
        ) : suscrito ? (
          <Bell size={16} className="fill-blue-700" />
        ) : (
          <Bell size={16} />
        )}
        {cargando
          ? "Procesando..."
          : suscrito
          ? "Notificaciones activas"
          : "Activar notificaciones"}
      </button>

      {error && (
        <p className="text-xs text-red-600 px-1">{error}</p>
      )}
    </div>
  );
}
