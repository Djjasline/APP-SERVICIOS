import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

let activeScope = "anon";

const getScope = (scope) => scope || activeScope || "anon";
const getScopedKey = (clave, scope) => `autoguardado_v2_${getScope(scope)}_${clave}`;
const getLegacyKey = (clave) => `autoguardado_${clave}`;

/**
 * useAutoguardado
 * ---------------
 * Guarda automáticamente el estado del formulario en localStorage.
 *
 * @param {string}   clave       - Clave única: ej. "informe_agua_new" | "informe_agua_abc123"
 * @param {any}      datos       - El objeto de estado del formulario
 * @param {boolean}  activo      - false cuando el registro ya está completado/bloqueado
 * @param {number}   intervalo   - Milisegundos entre guardados (default 15000)
 *
 * Retorna: { forzarGuardar, limpiar } - funciones para forzar guardado y limpiar borrador local
 */
export function useAutoguardado(clave, datos, activo = true, intervalo = 15000) {
  const { user } = useAuth();
  const scope = user?.id || "anon";
  const datosRef = useRef(datos);
  const debounceRef = useRef(null);

  useEffect(() => {
    activeScope = scope;
  }, [scope]);

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
      localStorage.setItem(getScopedKey(clave, scope), JSON.stringify(payload));

      // Dev-only log para verificar que el autoguardado se ejecuta
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug(`[autoguardado] guardado ${clave} @ ${payload.guardadoEn}`);
      }
    } catch (e) {
      console.warn("[autoguardado] Error al guardar:", e);
    }
  }, [clave, activo, scope]);

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

  // Guardado debounced al cambiar los datos (guardado inmediato tras 1s de inactividad)
  useEffect(() => {
    if (!activo || !clave) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        guardar();
      } catch (e) {
        /* silencioso */
      }
    }, 1000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [datos, guardar, activo, clave]);

  // Exponer utilidades sencillas para que el componente pueda forzar guardado / limpiar
  const forzarGuardar = useCallback(() => guardar(), [guardar]);
  const limpiar = useCallback(() => {
    try {
      limpiarBorrador(clave, scope);
    } catch (e) {
      /* silencioso */
    }
  }, [clave, scope]);

  return { forzarGuardar, limpiar };
}

/**
 * leerBorrador
 * ------------
 * Retorna { datos, guardadoEn } si existe un borrador, o null.
 */
export function leerBorrador(clave, scope) {
  try {
    const raw = localStorage.getItem(getScopedKey(clave, scope)) || localStorage.getItem(getLegacyKey(clave));
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
export function limpiarBorrador(clave, scope) {
  try {
    localStorage.removeItem(getScopedKey(clave, scope));
    localStorage.removeItem(getLegacyKey(clave));
  } catch {
    // silencioso
  }
}
