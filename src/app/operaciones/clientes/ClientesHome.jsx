import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Edit3, Plus, RefreshCw, Search, Trash2, XCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  createClientReference,
  deleteClientReference,
  getClientReferenceAdminList,
  updateClientReference,
} from "@/services/clientReferenceService";

const EMPTY_FORM = {
  id: "",
  name: "",
  tax_id: "",
  address: "",
  source_file: "Manual",
  active: true,
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ClientesHome() {
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const editing = Boolean(form.id);
  const activeCount = useMemo(() => clients.filter((client) => client.active !== false).length, [clients]);

  const loadClients = async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await getClientReferenceAdminList({ search: deferredSearch, includeInactive, limit: 800 });
      setClients(rows);
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setError(err?.code === "42P01" ? "Ejecuta primero supabase/sql/client_reference_catalog.sql." : "No se pudo cargar la base de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [deferredSearch, includeInactive]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setMessage("");
  };

  const editClient = (client) => {
    setForm({
      id: client.id,
      name: client.name || "",
      tax_id: client.tax_id || "",
      address: client.address || "",
      source_file: client.source_file || "Manual",
      active: client.active !== false,
    });
    setMessage("");
  };

  const saveClient = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editing) {
        await updateClientReference(form.id, form);
        setMessage("Cliente actualizado correctamente.");
      } else {
        await createClientReference(form);
        setMessage("Cliente creado correctamente.");
      }
      setForm(EMPTY_FORM);
      await loadClients();
    } catch (err) {
      console.error("Error guardando cliente:", err);
      setError(err?.message || "No se pudo guardar el cliente.");
    } finally {
      setSaving(false);
    }
  };

  const removeClient = async (client) => {
    const ok = window.confirm(`Eliminar cliente ${client.name}? Esta acción no afecta formularios ya guardados.`);
    if (!ok) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await deleteClientReference(client.id);
      setMessage("Cliente eliminado correctamente.");
      if (form.id === client.id) setForm(EMPTY_FORM);
      await loadClients();
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      setError(err?.message || "No se pudo eliminar el cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isLight ? "text-emerald-700" : "text-emerald-200"}`}>Operaciones</p>
          <h1 className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Clientes</h1>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-white/70"}`}>
            Gestión del catálogo usado para autocompletar cliente, RUC/cédula y dirección en formularios.
          </p>
        </div>
        <button type="button" onClick={() => navigate("/operaciones")} className="btn-volver-orange self-start">Volver</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Building2 size={18} />} label="Clientes cargados" value={clients.length} />
        <MetricCard icon={<CheckCircle2 size={18} />} label="Activos" value={activeCount} />
        <MetricCard icon={<XCircle size={18} />} label="Inactivos" value={clients.length - activeCount} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className={`rounded-2xl border p-4 shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/10"}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por cliente, RUC o dirección..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <label className={`inline-flex items-center gap-2 text-sm ${isLight ? "text-slate-600" : "text-white/70"}`}>
              <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />
              Ver inactivos
            </label>
            <button type="button" onClick={loadClients} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>

          {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">RUC/Cédula</th>
                  <th className="px-3 py-2">Dirección</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Actualizado</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Cargando clientes...</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Sin clientes para mostrar.</td></tr>
                ) : clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="max-w-xs px-3 py-2 font-semibold text-slate-900">{client.name}</td>
                    <td className="px-3 py-2">{client.tax_id || "-"}</td>
                    <td className="max-w-md px-3 py-2">{client.address || "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${client.active === false ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {client.active === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">{formatDate(client.updated_at)}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => editClient(client)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700" title="Editar">
                          <Edit3 size={14} />
                        </button>
                        <button type="button" onClick={() => removeClient(client)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`rounded-2xl border p-4 shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/10"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{editing ? "Editar cliente" : "Nuevo cliente"}</h2>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>Los cambios se reflejan en los desplegables de formularios.</p>
            </div>
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50">
              <Plus size={13} /> Nuevo
            </button>
          </div>

          <form onSubmit={saveClient} className="space-y-3">
            <Field label="Nombre del cliente" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="RUC / Cédula" value={form.tax_id} onChange={(value) => updateField("tax_id", value)} />
            <Field label="Dirección" value={form.address} onChange={(value) => updateField("address", value)} multiline />
            <Field label="Origen" value={form.source_file} onChange={(value) => updateField("source_file", value)} />
            <label className={`inline-flex items-center gap-2 text-sm ${isLight ? "text-slate-700" : "text-white/80"}`}>
              <input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} />
              Cliente activo para formularios
            </label>
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear cliente"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">{icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required = false, multiline = false }) {
  const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {multiline ? (
        <textarea className={`${inputClass} min-h-24 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
      ) : (
        <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
      )}
    </label>
  );
}
