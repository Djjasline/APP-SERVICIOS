import { useEffect, useRef, useState } from "react";

export default function AutosaveStatus() {
  const [status, setStatus] = useState(null);
  const timer = useRef(null);
  const failureKey = useRef(null);

  useEffect(() => {
    const handleStatus = (event) => {
      const { status: next, clave } = event.detail || {};
      if (!["saving", "saved", "error"].includes(next)) return;
      if (failureKey.current && failureKey.current !== clave && next !== "error") return;
      clearTimeout(timer.current);
      if (next === "error") {
        failureKey.current = clave;
        setStatus("error");
      } else if (next === "saving") {
        setStatus("saving");
      } else {
        failureKey.current = null;
        setStatus("saving");
        timer.current = setTimeout(() => {
          setStatus("saved");
          timer.current = setTimeout(() => setStatus(null), 3500);
        }, 300);
      }
    };
    window.addEventListener("astap:autosave", handleStatus);
    return () => {
      window.removeEventListener("astap:autosave", handleStatus);
      clearTimeout(timer.current);
    };
  }, []);

  if (!status) return null;
  const message = status === "saving"
    ? "Autoguardando borrador…"
    : status === "saved"
      ? "Borrador autoguardado en este dispositivo"
      : "No se pudo autoguardar en este dispositivo. Guarda el formulario manualmente.";

  return (
    <div role={status === "error" ? "alert" : "status"} aria-live={status === "error" ? "assertive" : "polite"}
      className={`fixed bottom-4 right-4 z-[100] max-w-[calc(100vw-2rem)] rounded-lg border px-4 py-3 text-sm font-medium shadow-lg print:hidden ${status === "error" ? "border-red-400 bg-red-50 text-red-900" : "border-blue-200 bg-white text-slate-900"}`}>
      {message}
      {status === "error" && (
        <button type="button" className="ml-3 underline" onClick={() => { failureKey.current = null; setStatus(null); }}>
          Cerrar
        </button>
      )}
    </div>
  );
}
