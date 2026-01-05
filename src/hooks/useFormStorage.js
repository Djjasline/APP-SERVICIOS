import { useState, useEffect } from "react";
import { FORM_STATES } from "@utils/formStates";

/**
 * Hook genérico para manejo de formularios
 * - Guarda en localStorage
 * - Maneja estado (borrador / finalizado)
 * - Permite editar incluso después de finalizar
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
    if (raw) {
      const parsed = JSON.parse(raw);
      setData(parsed.data || initialData);
      setStatus(parsed.status || FORM_STATES.BORRADOR);
    }
  }, []);

  /* =========================
     Guardar automáticamente
  ========================= */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, status })
    );
  }, [data, status]);

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
