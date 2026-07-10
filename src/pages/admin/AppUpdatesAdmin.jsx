import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  createAppUpdate,
  getAllAppUpdatesForAdmin,
  setAppUpdateActive,
} from "@/services/appUpdatesService";

const emptyForm = {
  title: "",
  message: "",
};

export default function AppUpdatesAdmin() {
  const { isLight } = useTheme();
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createAppUpdate({ ...form, userId: user?.id });
      setForm(emptyForm);
      setMessage("Boletín publicado. Los usuarios lo verán como no leído en la campana.");
      await loadUpdates();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo publicar el boletín.");
    } finally {
      setSaving(false);
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
          Publica cambios de la app para que aparezcan en la campana de todos los usuarios.
        </p>
      </div>

      <form onSubmit={submit} className={`rounded-xl border p-4 shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="grid grid-cols-1 gap-4">
          <label className="text-sm font-medium">
            Título
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ej: Nuevo protocolo Cámara V-CAM6"
              required
            />
          </label>

          <label className="text-sm font-medium">
            Mensaje
            <textarea
              className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Describe el cambio en lenguaje claro para los usuarios."
              required
            />
          </label>
        </div>

        {message && <div className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
        {error && <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="mt-4 flex justify-end">
          <button disabled={saving} className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Publicando..." : "Publicar boletín"}
          </button>
        </div>
      </form>

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
