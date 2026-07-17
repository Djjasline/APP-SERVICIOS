import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

let activeScope = "anon";
const remoteProtectedKeys = new Set();

const getScope = (scope) => scope || activeScope || "anon";
const getScopedKey = (clave, scope) => `autoguardado_v2_${getScope(scope)}_${clave}`;
const getLegacyKey = (clave) => `autoguardado_${clave}`;
const getRemoteProtectionKey = (clave, scope) => `${getScope(scope)}_${clave}`;
const canSyncRemote = (scope) => Boolean(scope && scope !== "anon");

function logRemoteDraftError(message, error) {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
}

function toDraftPayload(datos, guardadoEn = new Date().toISOString()) {
  return { datos, guardadoEn };
}

function getDraftTime(draft) {
  const time = draft?.guardadoEn ? new Date(draft.guardadoEn).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function pickNewestDraft(localDraft, remoteDraft) {
  if (!localDraft) return remoteDraft;
  if (!remoteDraft) return localDraft;
  return getDraftTime(remoteDraft) > getDraftTime(localDraft) ? remoteDraft : localDraft;
}

async function guardarBorradorRemoto(clave, datos, scope, guardadoEn) {
  if (!clave || !canSyncRemote(scope)) return;

  const protectionKey = getRemoteProtectionKey(clave, scope);
  if (remoteProtectedKeys.has(protectionKey)) return;

  const hadLocalDraftBeforeSave = Boolean(leerBorrador(clave, scope));
  if (!hadLocalDraftBeforeSave) {
    remoteProtectedKeys.add(protectionKey);
    const remoteDraft = await leerBorradorRemoto(clave, scope);
    if (remoteDraft) {
      return;
    }
    remoteProtectedKeys.delete(protectionKey);
  }

  const { error } = await supabase
    .from("form_drafts")
    .upsert(
      {
        user_id: scope,
        draft_key: clave,
        data: datos ?? {},
        saved_at: guardadoEn,
        updated_at: guardadoEn,
      },
      { onConflict: "user_id,draft_key" }
    );

  if (error) {
    logRemoteDraftError("[autoguardado] Error al sincronizar borrador remoto:", error);
  }
}

async function eliminarBorradorRemoto(clave, scope) {
  if (!clave || !canSyncRemote(scope)) return;

  const { error } = await supabase
    .from("form_drafts")
    .delete()
    .eq("user_id", scope)
    .eq("draft_key", clave);

  if (error) {
    logRemoteDraftError("[autoguardado] Error al eliminar borrador remoto:", error);
  }
}

/**
 * useAutoguardado
 * ---------------
 * Guarda automáticamente el estado del formulario en localStorage y Supabase.
 *
 * @param {string}   clave       - Clave única: ej. "informe_agua_new" | "informe_agua_abc123"
 * @param {any}      datos       - El objeto de estado del formulario
 * @param {boolean}  activo      - false cuando el registro ya está completado/bloqueado
 * @param {number}   intervalo   - Milisegundos entre guardados (default 15000)
 *
 * Retorna: { forzarGuardar, limpiar } - funciones para forzar guardado y limpiar borrador
 */
export function useAutoguardado(clave, datos, activo = true, intervalo = 15000) {
  const { user } = useAuth();
  const scope = user?.id || "anon";
  const datosRef = useRef(datos);
  const debounceRef = useRef(null);

  useEffect(() => {
    activeScope = scope;
  }, [scope]);

  useEffect(() => {
    if (!activo || !clave || !canSyncRemote(scope) || leerBorrador(clave, scope)) return;

    const protectionKey = getRemoteProtectionKey(clave, scope);
    let cancelled = false;
    remoteProtectedKeys.add(protectionKey);

    leerBorradorRemoto(clave, scope).then((remoteDraft) => {
      if (cancelled) return;
      if (!remoteDraft) {
        remoteProtectedKeys.delete(protectionKey);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clave, scope, activo]);

  // Mantener ref actualizada sin re-disparar efectos
  useEffect(() => {
    datosRef.current = datos;
  }, [datos]);

  const guardar = useCallback(() => {
    if (!activo || !clave) return;
    if (remoteProtectedKeys.has(getRemoteProtectionKey(clave, scope))) return;

    try {
      const payload = toDraftPayload(datosRef.current);
      localStorage.setItem(getScopedKey(clave, scope), JSON.stringify(payload));
      void guardarBorradorRemoto(clave, payload.datos, scope, payload.guardadoEn);

      // Dev-only log para verificar que el autoguardado se ejecuta
      if (import.meta.env.DEV) {
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

export async function leerBorradorRemoto(clave, scope) {
  if (!clave || !canSyncRemote(scope)) return null;

  const { data, error } = await supabase
    .from("form_drafts")
    .select("data,saved_at,updated_at")
    .eq("user_id", scope)
    .eq("draft_key", clave)
    .maybeSingle();

  if (error) {
    logRemoteDraftError("[autoguardado] Error al leer borrador remoto:", error);
    return null;
  }

  if (!data) return null;

  return {
    datos: data.data,
    guardadoEn: data.saved_at || data.updated_at,
    origen: "remoto",
  };
}

export async function leerMejorBorrador(clave, scope) {
  const localDraft = leerBorrador(clave, scope);
  const remoteDraft = await leerBorradorRemoto(clave, scope);
  if (remoteDraft && remoteProtectedKeys.has(getRemoteProtectionKey(clave, scope))) {
    return remoteDraft;
  }
  return pickNewestDraft(localDraft, remoteDraft);
}

export function permitirSincronizarBorrador(clave, scope) {
  remoteProtectedKeys.delete(getRemoteProtectionKey(clave, scope));
}

/**
 * limpiarBorrador
 * ---------------
 * Elimina el borrador guardado. Llamar tras guardar exitosamente en Supabase.
 */
export function limpiarBorrador(clave, scope) {
  const resolvedScope = getScope(scope);
  permitirSincronizarBorrador(clave, resolvedScope);
  try {
    localStorage.removeItem(getScopedKey(clave, resolvedScope));
    localStorage.removeItem(getLegacyKey(clave));
  } catch {
    // silencioso
  }

  void eliminarBorradorRemoto(clave, resolvedScope);
}
