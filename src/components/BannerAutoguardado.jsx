import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { leerBorrador, leerMejorBorrador, limpiarBorrador, permitirAutoguardadoLocal, permitirSincronizarBorrador } from "@/hooks/useAutoguardado";
import { RotateCcw, X, Clock } from "lucide-react";

/**
 * BannerAutoguardado
 * ------------------
 * Muestra un banner cuando existe un borrador guardado local o remoto.
 * El usuario puede restaurarlo o descartarlo.
 *
 * @param {string}    clave        - Misma clave usada en useAutoguardado
 * @param {function}  onRestaurar  - Callback que recibe los datos guardados
 * @param {boolean}   isEditing    - true si es edición (id real), false si es "new"
 */
export default function BannerAutoguardado({ clave, onRestaurar, isEditing, protectExisting = false, ready = true }) {
  const { user } = useAuth();
  const scope = user?.id || "anon";
  const [borrador, setBorrador] = useState(() => protectExisting ? leerBorrador(clave, scope) : null);
  const [visible, setVisible] = useState(() => protectExisting && Boolean(leerBorrador(clave, scope)));
  const [checking, setChecking] = useState(protectExisting);
  const decisionRef = useRef(false);

  useEffect(() => {
    if (!clave) return;
    if (isEditing && !protectExisting) return;

    let cancelled = false;
    let finished = false;
    decisionRef.current = false;
    const local = leerBorrador(clave, scope);
    if (protectExisting) {
      setChecking(true);
      setBorrador(local);
      setVisible(Boolean(local));
    }

    const finish = (encontrado) => {
      if (cancelled || finished || decisionRef.current) return;
      finished = true;
      setChecking(false);

      if (encontrado) {
        setBorrador(encontrado);
        setVisible(true);
      } else {
        setBorrador(null);
        setVisible(false);
        if (protectExisting) permitirAutoguardadoLocal(clave, scope);
      }
    };
    // No dejar el formulario bloqueado indefinidamente si falla la conexión.
    const timeout = protectExisting ? window.setTimeout(() => finish(local), 5000) : null;
    leerMejorBorrador(clave, scope).then(finish).catch(() => finish(local));

    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [clave, isEditing, scope, protectExisting]);

  const handleRestaurar = () => {
    decisionRef.current = true;
    if (borrador?.datos) {
      permitirSincronizarBorrador(clave, scope);
      onRestaurar(borrador.datos);
    }
    setVisible(false);
  };

  const handleDescartar = () => {
    if (protectExisting && !window.confirm("¿Descartar este borrador? Se perderán los cambios que contiene y no se modificará la versión guardada del registro.")) return;
    decisionRef.current = true;
    limpiarBorrador(clave, scope);
    setBorrador(null);
    setVisible(false);
  };

  if (protectExisting && (checking || !ready) && !borrador) {
    return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" role="status"><div className="rounded-xl bg-white p-5 text-sm text-slate-800 shadow-lg">{checking ? "Revisando si hay un borrador para recuperar…" : "Cargando la inspección…"}</div></div>;
  }
  if (!visible || !borrador) return null;

  // Formatear fecha legible
  const fecha = borrador.guardadoEn
    ? new Date(borrador.guardadoEn).toLocaleString("es-EC", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className={protectExisting ? "fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" : "mb-4"}>
    <div role={protectExisting ? "dialog" : undefined} aria-modal={protectExisting ? "true" : undefined} aria-label={protectExisting ? "Recuperar borrador" : undefined} className="flex w-full max-w-xl items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
      <RotateCcw size={18} className="mt-0.5 shrink-0 text-amber-600" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          Tienes un borrador sin guardar
        </p>
        {protectExisting && <p className="mt-1 text-xs text-amber-800">Restaura el borrador para continuar donde lo dejaste, o descártalo para abrir la versión guardada.</p>}
        {protectExisting && !ready && <p className="mt-1 text-xs text-amber-800">Cargando el registro antes de permitir la restauración…</p>}
        {fecha && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
            <Clock size={11} />
            Guardado el {fecha}
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleRestaurar}
            disabled={!ready}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition disabled:opacity-50"
          >
            Restaurar borrador
          </button>
          <button
            type="button"
            onClick={handleDescartar}
            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
          >
            Descartar
          </button>
        </div>
      </div>

      {!protectExisting && <button
        type="button"
        onClick={handleDescartar}
        className="shrink-0 text-amber-400 hover:text-amber-600 transition"
        title="Cerrar"
      >
        <X size={16} />
      </button>}
    </div>
    </div>
  );
}
