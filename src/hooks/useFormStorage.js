import { useEffect, useState } from "react";

export default function useFormStorage(key, initialData = {}) {
  const STORAGE_KEY = `form_${key}`;

  const [data, setData] = useState(initialData);
import { FORM_STATES } from "@utils/formStates";

const [status, setStatus] = useState(FORM_STATES.BORRADOR);

  // Cargar datos
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed.data || initialData);
      setStatus(parsed.status || "borrador");
    }
  }, []);

  // Guardar datos
  const save = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        status,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  // Finalizar (NO bloquea)
  const finalize = () => {
    setStatus("completado");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        status: "completado",
        updatedAt: new Date().toISOString(),
      })
    );
  };

  return {
    data,
    setData,
    status,
    save,
    finalize,
  };
}
