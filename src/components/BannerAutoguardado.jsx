import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { leerMejorBorrador, limpiarBorrador, permitirSincronizarBorrador } from "@/hooks/useAutoguardado";
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
export default function BannerAutoguardado({ clave, onRestaurar, isEditing }) {
  const { user } = useAuth();
  const [borrador, setBorrador] = useState(null);
  const [visible, setVisible] = useState(false);
  const scope = user?.id || "anon";

  useEffect(() => {
    if (!clave) return;
    // Solo mostrar banner en formularios nuevos (no en edición de registros existentes)
    if (isEditing) return;

    let cancelled = false;

    leerMejorBorrador(clave, scope).then((encontrado) => {
      if (cancelled) return;

      if (encontrado) {
        setBorrador(encontrado);
        setVisible(true);
      } else {
        setBorrador(null);
        setVisible(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clave, isEditing, scope]);

  const handleRestaurar = () => {
    if (borrador?.datos) {
      permitirSincronizarBorrador(clave, scope);
      onRestaurar(borrador.datos);
    }
    setVisible(false);
  };

  const handleDescartar = () => {
    limpiarBorrador(clave, scope);
    setBorrador(null);
    setVisible(false);
  };

  if (!visible || !borrador) return null;

  // Formatear fecha legible
  const fecha = borrador.guardadoEn
    ? new Date(borrador.guardadoEn).toLocaleString("es-EC", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
      <RotateCcw size={18} className="mt-0.5 shrink-0 text-amber-600" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          Tienes un borrador sin guardar
        </p>
        {fecha && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
            <Clock size={11} />
            Guardado el {fecha}
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleRestaurar}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
          >
            Restaurar borrador
          </button>
          <button
            onClick={handleDescartar}
            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
          >
            Descartar
          </button>
        </div>
      </div>

      <button
        onClick={handleDescartar}
        className="shrink-0 text-amber-400 hover:text-amber-600 transition"
        title="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
