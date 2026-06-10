import { useEffect, useRef, useCallback } from "react";

/**
 * useAutoguardado
 * ---------------
 * Guarda automáticamente el estado del formulario en localStorage.
 *
 * @param {string}   clave       - Clave única: ej. "informe_agua_new" | "informe_agua_abc123"
 * @param {any}      datos       - El objeto de estado del formulario
 * @param {boolean}  activo      - false cuando el registro ya está completado/bloqueado
 * @param {number}   intervalo   - Milisegundos entre guardados (default 15000)
 */
export function useAutoguardado(clave, datos, activo = true, intervalo = 15000) {
  const datosRef = useRef(datos);

  // Mantener ref actualizada sin re-disparar efectos
  useEffect(() => {
    datosRef.current = datos;
  }, [datos]);

  const guardar = useCallback(() => {
    if (!activo || !clave) return;
    try {
      const payload = {
        datos: datosRef.current,
        guardadoEn: new Date().toISOString(),
      };
      localStorage.setItem(`autoguardado_${clave}`, JSON.stringify(payload));
    } catch (e) {
      console.warn("[autoguardado] Error al guardar:", e);
    }
  }, [clave, activo]);

  // Guardar cada N segundos
  useEffect(() => {
    if (!activo || !clave) return;
    const timer = setInterval(guardar, intervalo);
    return () => clearInterval(timer);
  }, [guardar, activo, clave, intervalo]);

  // Guardar al cerrar/recargar la pestaña
  useEffect(() => {
    if (!activo || !clave) return;
    window.addEventListener("beforeunload", guardar);
    return () => window.removeEventListener("beforeunload", guardar);
  }, [guardar, activo, clave]);
}

/**
 * leerBorrador
 * ------------
 * Retorna { datos, guardadoEn } si existe un borrador, o null.
 */
export function leerBorrador(clave) {
  try {
    const raw = localStorage.getItem(`autoguardado_${clave}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * limpiarBorrador
 * ---------------
 * Elimina el borrador guardado. Llamar tras guardar exitosamente en Supabase.
 */
export function limpiarBorrador(clave) {
  try {
    localStorage.removeItem(`autoguardado_${clave}`);
  } catch {
    // silencioso
  }
}
