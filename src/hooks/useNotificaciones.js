/**
 * useNotificaciones.js
 * Hook para gestionar Push Notifications en App Servicios.
 *
 * Uso:
 *   const { permiso, suscrito, solicitarPermiso, cancelarSuscripcion } = useNotificaciones();
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase"; // ajusta la ruta si es diferente
import { useAuth } from "@/context/AuthContext";   // ajusta la ruta si es diferente

// ─── Clave pública VAPID ────────────────────────────────────────────────────
// Genera tus claves en: https://vapidkeys.com/  o con:
//   npx web-push generate-vapid-keys
// Guarda la PRIVADA en Supabase Edge Function secrets (VAPID_PRIVATE_KEY)
// y la PÚBLICA aquí y en sw.js (__VAPID_PUBLIC_KEY__)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

// ─── Utilidad: convertir clave VAPID a Uint8Array ───────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ─── Hook principal ─────────────────────────────────────────────────────────
export function useNotificaciones() {
  const { user } = useAuth();

  const [permiso, setPermiso] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [suscrito, setSuscrito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si ya hay suscripción activa al montar
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.ready.then(async (registro) => {
      const suscripcionExistente = await registro.pushManager.getSubscription();
      setSuscrito(!!suscripcionExistente);
    });
  }, []);

  // Escuchar renovación automática de suscripción desde el SW
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = async (event) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED") {
        await guardarSuscripcionEnSupabase(event.data.subscription);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [user]);

  // ── Guardar/actualizar suscripción en Supabase ───────────────────────────
  const guardarSuscripcionEnSupabase = useCallback(
    async (subscriptionJSON) => {
      if (!user?.id) return;

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint,
          p256dh: subscriptionJSON.keys?.p256dh,
          auth: subscriptionJSON.keys?.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) console.error("[Push] Error guardando suscripción:", error);
    },
    [user]
  );

  // ── Solicitar permiso y suscribirse ─────────────────────────────────────
  const solicitarPermiso = useCallback(async () => {
    setError(null);

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Tu navegador no soporta notificaciones push.");
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError("Clave VAPID no configurada. Revisa VITE_VAPID_PUBLIC_KEY en .env");
      return false;
    }

    setCargando(true);

    try {
      // 1. Pedir permiso al usuario
      const resultado = await Notification.requestPermission();
      setPermiso(resultado);

      if (resultado !== "granted") {
        setError("Permiso denegado. El usuario rechazó las notificaciones.");
        setCargando(false);
        return false;
      }

      // 2. Obtener el Service Worker registrado
      const registro = await navigator.serviceWorker.ready;

      // 3. Suscribirse al push manager
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Guardar en Supabase
      await guardarSuscripcionEnSupabase(suscripcion.toJSON());

      setSuscrito(true);
      setCargando(false);
      return true;
    } catch (err) {
      console.error("[Push] Error al suscribirse:", err);
      setError("No se pudo activar las notificaciones. Intenta de nuevo.");
      setCargando(false);
      return false;
    }
  }, [guardarSuscripcionEnSupabase]);

  // ── Cancelar suscripción ─────────────────────────────────────────────────
  const cancelarSuscripcion = useCallback(async () => {
    setCargando(true);
    try {
      const registro = await navigator.serviceWorker.ready;
      const suscripcion = await registro.pushManager.getSubscription();

      if (suscripcion) {
        await suscripcion.unsubscribe();

        // Eliminar de Supabase
        if (user?.id) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id);
        }
      }

      setSuscrito(false);
    } catch (err) {
      console.error("[Push] Error al cancelar suscripción:", err);
      setError("No se pudo desactivar las notificaciones.");
    } finally {
      setCargando(false);
    }
  }, [user]);

  return {
    permiso,       // 'default' | 'granted' | 'denied'
    suscrito,      // boolean
    cargando,      // boolean
    error,         // string | null
    solicitarPermiso,
    cancelarSuscripcion,
    soportado: typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window,
  };
}
