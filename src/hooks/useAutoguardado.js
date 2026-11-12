import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { pickNewestDraft, toDraftPayload } from "@/utils/draftSelection.mjs";
import { pendingDraftForFlush } from "@/utils/draftLifecycle.mjs";

let activeScope = "anon";
const remoteProtectedKeys = new Set();
const pendingRecoveryKeys = new Set();
const draftClearVersions = new Map();
const DEVICE_ID_KEY = "astap_autoguardado_device_id";

const getScope = (scope) => scope || activeScope || "anon";
const getScopedKey = (clave, scope) => `autoguardado_v2_${getScope(scope)}_${clave}`;
const getLegacyKey = (clave) => `autoguardado_${clave}`;
const getRemoteProtectionKey = (clave, scope) => `${getScope(scope)}_${clave}`;
const canSyncRemote = (scope) => Boolean(scope && scope !== "anon");

function createFallbackId() {
  return `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getDeviceInfo() {
  const fallback = {
    deviceId: "unknown-device",
    deviceLabel: "Dispositivo sin identificar",
    userAgent: "",
  };

  if (typeof window === "undefined") return fallback;

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = window.crypto?.randomUUID?.() || createFallbackId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    const userAgent = window.navigator?.userAgent || "";
    const platform = window.navigator?.platform || "";
    const deviceLabel = [platform, userAgent.includes("Mobile") ? "Mobile" : "Desktop"].filter(Boolean).join(" - ") || "Dispositivo";

    return { deviceId, deviceLabel, userAgent };
  } catch {
    return fallback;
  }
}

function getSnapshotKey(guardadoEn) {
  return String(guardadoEn || new Date().toISOString()).slice(0, 16);
}

function logRemoteDraftError(message, error) {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
}

async function guardarBorradorRemoto(clave, datos, scope, guardadoEn) {
  if (!clave || !canSyncRemote(scope)) return;

  const protectionKey = getRemoteProtectionKey(clave, scope);
  if (remoteProtectedKeys.has(protectionKey)) return;

  const hadLocalDraftBeforeSave = Boolean(leerBorrador(clave, scope));
  if (!hadLocalDraftBeforeSave) {
    remoteProtectedKeys.add(protectionKey);
    let remoteDraft;
    try {
      remoteDraft = await leerBorradorRemoto(clave, scope);
    } catch (error) {
      logRemoteDraftError("[autoguardado] No se pudo comprobar el borrador remoto:", error);
      return;
    }
    if (remoteDraft) {
      return;
    }
    remoteProtectedKeys.delete(protectionKey);
  }

  const device = getDeviceInfo();
  const { error } = await supabase
    .from("form_drafts")
    .upsert(
      {
        user_id: scope,
        draft_key: clave,
        device_id: device.deviceId,
        device_label: device.deviceLabel,
        user_agent: device.userAgent,
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

async function guardarHistorialBorradorRemoto(clave, datos, scope, guardadoEn) {
  if (!clave || !canSyncRemote(scope)) return;

  const device = getDeviceInfo();
  const { error } = await supabase
    .from("form_draft_snapshots")
    .upsert(
      {
        user_id: scope,
        draft_key: clave,
        device_id: device.deviceId,
        device_label: device.deviceLabel,
        user_agent: device.userAgent,
        snapshot_key: getSnapshotKey(guardadoEn),
        data: datos ?? {},
        saved_at: guardadoEn,
        updated_at: guardadoEn,
      },
      { onConflict: "user_id,draft_key,device_id,snapshot_key" }
    );

  if (error) {
    logRemoteDraftError("[autoguardado] Error al sincronizar historial remoto:", error);
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
export function useAutoguardado(clave, datos, activo = true, intervalo = 15000, { protectExisting = false } = {}) {
  const { user } = useAuth();
  const scope = user?.id || "anon";
  const datosRef = useRef(datos);
  const debounceRef = useRef(null);
  const lastNoticeRef = useRef(0);
  const pendingSaveRef = useRef(null);
  const lastChangeRef = useRef(null);
  const protectionInitRef = useRef(null);
  const protectionKey = getRemoteProtectionKey(clave, scope);
  if (protectExisting && clave && protectionInitRef.current !== protectionKey) {
    protectionInitRef.current = protectionKey;
    pendingRecoveryKeys.add(protectionKey);
  }

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
    }).catch((error) => {
      logRemoteDraftError("[autoguardado] No se pudo comprobar el borrador remoto:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [clave, scope, activo]);

  // Mantener ref actualizada sin re-disparar efectos
  useLayoutEffect(() => {
    datosRef.current = datos;
    const key = getRemoteProtectionKey(clave, scope);
    lastChangeRef.current = { key, version: draftClearVersions.get(key) || 0 };
  }, [datos, clave, scope]);

  const guardar = useCallback((snapshot = datosRef.current) => {
    if (!activo || !clave) return;
    if (protectExisting && pendingRecoveryKeys.has(getRemoteProtectionKey(clave, scope))) return;
    const key = getRemoteProtectionKey(clave, scope);
    if (lastChangeRef.current?.key === key && lastChangeRef.current.version !== (draftClearVersions.get(key) || 0)) return;

    const showNotice = Date.now() - lastNoticeRef.current >= 15000;
    const notify = (status) => window.dispatchEvent(new CustomEvent("astap:autosave", { detail: { status, clave } }));
    if (showNotice) notify("saving");

    try {
      const payload = toDraftPayload(snapshot);
      localStorage.setItem(getScopedKey(clave, scope), JSON.stringify(payload));
      void guardarHistorialBorradorRemoto(clave, payload.datos, scope, payload.guardadoEn);
      if (!remoteProtectedKeys.has(getRemoteProtectionKey(clave, scope))) {
        void guardarBorradorRemoto(clave, payload.datos, scope, payload.guardadoEn);
      }
      if (showNotice) {
        lastNoticeRef.current = Date.now();
        notify("saved");
      }

      // Dev-only log para verificar que el autoguardado se ejecuta
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(`[autoguardado] guardado ${clave} @ ${payload.guardadoEn}`);
      }
    } catch (e) {
      lastNoticeRef.current = 0;
      notify("error");
      console.warn("[autoguardado] Error al guardar:", e);
    }
  }, [clave, activo, scope, protectExisting]);

  // Guardar cada N segundos
  useEffect(() => {
    if (!activo || !clave) return;
    const timer = setInterval(guardar, intervalo);
    return () => clearInterval(timer);
  }, [guardar, activo, clave, intervalo]);

  // Guardar al cerrar/recargar la pestaña
  useEffect(() => {
    if (!activo || !clave) return;
    const flush = () => guardar();
    const onVisibilityChange = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [guardar, activo, clave]);

  // Al navegar dentro de la aplicación no se dispara beforeunload.
  useEffect(() => {
    if (!activo || !clave) return;
    const key = getRemoteProtectionKey(clave, scope);
    return () => {
      const pending = pendingSaveRef.current;
      const snapshot = pendingDraftForFlush(pending, key, draftClearVersions.get(key) || 0);
      if (snapshot !== undefined) {
        guardar(snapshot);
      }
      if (pending?.key === key) pendingSaveRef.current = null;
    };
  }, [guardar, activo, clave, scope]);

  // Guardado debounced al cambiar los datos (guardado inmediato tras 1s de inactividad)
  useEffect(() => {
    if (!activo || !clave) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const key = getRemoteProtectionKey(clave, scope);
    const pending = { key, version: draftClearVersions.get(key) || 0, datos };
    pendingSaveRef.current = pending;
    debounceRef.current = setTimeout(() => {
      try {
        if (pending.version === (draftClearVersions.get(key) || 0)) guardar(pending.datos);
        if (pendingSaveRef.current === pending) pendingSaveRef.current = null;
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
  }, [datos, guardar, activo, clave, scope]);

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
    throw error;
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
  pendingRecoveryKeys.delete(getRemoteProtectionKey(clave, scope));
}

export function permitirAutoguardadoLocal(clave, scope) {
  pendingRecoveryKeys.delete(getRemoteProtectionKey(clave, scope));
}

/**
 * limpiarBorrador
 * ---------------
 * Elimina el borrador guardado. Llamar tras guardar exitosamente en Supabase.
 */
export function limpiarBorrador(clave, scope) {
  const resolvedScope = getScope(scope);
  const key = getRemoteProtectionKey(clave, resolvedScope);
  draftClearVersions.set(key, (draftClearVersions.get(key) || 0) + 1);
  permitirSincronizarBorrador(clave, resolvedScope);
  try {
    localStorage.removeItem(getScopedKey(clave, resolvedScope));
    localStorage.removeItem(getLegacyKey(clave));
  } catch {
    // silencioso
  }

  void eliminarBorradorRemoto(clave, resolvedScope);
}
