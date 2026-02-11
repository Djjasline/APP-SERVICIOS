import { useState, useEffect } from "react";
import { FORM_STATES } from "@utils/formStates";

/**
 * Hook genérico para manejo de formularios
 * - Guarda en localStorage
 * - Maneja estado (borrador / finalizado)
 * - Permite editar incluso después de finalizar
 * - Rehidrata correctamente datos complejos (checklists, firmas, puntos)
 */
export default function useFormStorage(key, initialData) {
  const STORAGE_KEY = `form_${key}`;

  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(FORM_STATES.BORRADOR);

  /* =========================
     Cargar desde localStorage
  ========================= */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      setData((prev) => ({
        ...initialData,
        ...parsed.data,

        // 🔥 merge seguro dinámico
        mantenimiento: {
          ...initialData.mantenimiento,
          ...parsed.data?.mantenimiento,
        },

        inspeccion: {
          ...initialData.inspeccion,
          ...parsed.data?.inspeccion,
        },

        firmas: parsed.data?.firmas || {},

        estadoEquipoPuntos:
          parsed.data?.estadoEquipoPuntos || [],
      }));

      setStatus(
        parsed.status || FORM_STATES.BORRADOR
      );
    } catch (e) {
      console.error(
        "Error al cargar formulario:",
        e
      );
    }
  }, [STORAGE_KEY]);

  /* =========================
     Guardar automáticamente
  ========================= */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, status })
    );
  }, [data, status, STORAGE_KEY]);

  /* =========================
     Acciones
  ========================= */
  const save = () => {
    setStatus(FORM_STATES.BORRADOR);
  };

  const finalize = () => {
    setStatus(FORM_STATES.FINALIZADO);
  };

  return {
    data,
    setData,
    status,
    save,
    finalize,
  };
}
