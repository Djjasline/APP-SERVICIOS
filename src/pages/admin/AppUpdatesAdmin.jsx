import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  getAllAppUpdatesForAdmin,
  setAppUpdateActive,
} from "@/services/appUpdatesService";

export default function AppUpdatesAdmin() {
  const { isLight } = useTheme();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllAppUpdatesForAdmin();
      setUpdates(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los boletines. Verifica que el SQL esté aplicado en Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (update) => {
    try {
      setError("");
      await setAppUpdateActive(update.id, !update.active);
      await loadUpdates();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado del boletín.");
    }
  };

  return (
    <div className={`space-y-6 ${isLight ? "text-slate-900" : "text-white"}`}>
      <div>
        <h1 className="text-2xl font-semibold">Boletines de actualización</h1>
        <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          Historial de boletines generados automáticamente cuando se publican cambios en GitHub.
        </p>
      </div>

      <div className={`rounded-xl border p-4 text-sm ${isLight ? "border-blue-200 bg-blue-50 text-blue-800" : "border-blue-400/30 bg-blue-500/10 text-blue-100"}`}>
        Los boletines se crean automáticamente con cada push a <strong>main</strong>. Esta pantalla solo permite revisar el historial y ocultar/reactivar publicaciones.
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <section className={`rounded-xl border p-4 shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <h2 className="font-semibold">Historial de boletines</h2>

        {loading ? (
          <p className={`mt-3 text-sm ${isLight ? "text-slate-500" : "text-slate-300"}`}>Cargando...</p>
        ) : updates.length === 0 ? (
          <p className={`mt-3 text-sm ${isLight ? "text-slate-500" : "text-slate-300"}`}>Aún no hay boletines.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {updates.map((update) => (
              <article key={update.id} className={`rounded-lg border p-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{update.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${update.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                        {update.active ? "Activo" : "Oculto"}
                      </span>
                    </div>
                    <p className={`mt-1 whitespace-pre-wrap text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>{update.message}</p>
                    <p className={`mt-2 text-xs ${isLight ? "text-slate-400" : "text-slate-400"}`}>{new Date(update.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => toggleActive(update)} className="shrink-0 rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50">
                    {update.active ? "Ocultar" : "Reactivar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
