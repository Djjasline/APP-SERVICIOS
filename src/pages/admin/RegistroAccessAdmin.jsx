import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  deleteRecordAccessPermission,
  getAccessProfiles,
  getAllRecordAccessPermissions,
  saveRecordAccessPermission,
} from "@/services/accessControlService";

const AREAS = [
  { value: "vehiculos", label: "Vehículos Especiales" },
  { value: "agua", label: "Agua y Saneamiento" },
  { value: "industria", label: "Industria" },
  { value: "petroleo", label: "Petróleo y Energía" },
  { value: "operaciones", label: "Operaciones" },
  { value: "todos", label: "Todas las áreas" },
];

const TIPOS = [
  { value: "todos", label: "Todos los formatos" },
  { value: "informe", label: "Informe General" },
  { value: "inspeccion", label: "Inspección" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "registro", label: "Registro de herramientas" },
];

const emptyForm = {
  grantee_user_id: "",
  owner_user_id: "",
  area: "vehiculos",
  tipo: "todos",
  can_view: true,
  can_edit: false,
  can_download: false,
};

export default function RegistroAccessAdmin() {
  const { isLight } = useTheme();
  const [profiles, setProfiles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const profileById = useMemo(() => {
    return profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});
  }, [profiles]);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => getProfileLabel(a).localeCompare(getProfileLabel(b)));
  }, [profiles]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [profilesData, permissionsData] = await Promise.all([
        getAccessProfiles(),
        getAllRecordAccessPermissions(),
      ]);
      setProfiles(profilesData);
      setPermissions(permissionsData);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios o permisos.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setMessage("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.grantee_user_id || !form.owner_user_id) {
      setError("Selecciona el usuario gestor y el dueño de los registros.");
      return;
    }

    if (form.grantee_user_id === form.owner_user_id) {
      setError("El usuario gestor y el dueño de registros deben ser diferentes.");
      return;
    }

    if (!form.can_view && !form.can_edit && !form.can_download) {
      setError("Activa al menos un permiso.");
      return;
    }

    try {
      setSaving(true);
      await saveRecordAccessPermission(form);
      setMessage("Permiso guardado correctamente.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el permiso.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (permission) => {
    if (!confirm("¿Eliminar este permiso?")) return;

    try {
      await deleteRecordAccessPermission(permission.id);
      setPermissions((prev) => prev.filter((item) => item.id !== permission.id));
      setMessage("Permiso eliminado.");
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el permiso.");
    }
  };

  const cardClass = isLight
    ? "bg-white border border-slate-200 text-slate-900"
    : "bg-white/10 border border-white/10 text-white";

  const inputClass = isLight
    ? "bg-white border-slate-300 text-slate-900"
    : "bg-slate-900/80 border-white/20 text-white";

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
          Permisos de registros
        </h1>
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-white/70"}`}>
          Autoriza a un usuario para ver, editar o descargar formatos creados por otro usuario.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${cardClass} rounded-2xl p-5 shadow space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Usuario gestor</span>
            <select
              value={form.grantee_user_id}
              onChange={(event) => handleChange("grantee_user_id", event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            >
              <option value="">Seleccionar usuario</option>
              {sortedProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {getProfileLabel(profile)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Dueño de registros</span>
            <select
              value={form.owner_user_id}
              onChange={(event) => handleChange("owner_user_id", event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            >
              <option value="">Seleccionar dueño</option>
              {sortedProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {getProfileLabel(profile)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Área</span>
            <select
              value={form.area}
              onChange={(event) => handleChange("area", event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            >
              {AREAS.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Formato</span>
            <select
              value={form.tipo}
              onChange={(event) => handleChange("tipo", event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            >
              {TIPOS.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ["can_view", "Ver"],
            ["can_edit", "Editar"],
            ["can_download", "Descargar PDF"],
          ].map(([field, label]) => (
            <label key={field} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form[field]}
                onChange={(event) => handleChange(field, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {label}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar permiso"}
        </button>
      </form>

      <div className={`${cardClass} rounded-2xl p-5 shadow space-y-4`}>
        <h2 className="font-semibold">Permisos activos</h2>

        {loading ? (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>Cargando...</p>
        ) : permissions.length === 0 ? (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>No hay permisos configurados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className={isLight ? "text-slate-500" : "text-white/60"}>
                <tr>
                  <th className="py-2 pr-4">Gestor</th>
                  <th className="py-2 pr-4">Dueño</th>
                  <th className="py-2 pr-4">Alcance</th>
                  <th className="py-2 pr-4">Permisos</th>
                  <th className="py-2 pr-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id} className={isLight ? "border-t border-slate-100" : "border-t border-white/10"}>
                    <td className="py-3 pr-4">{getProfileLabel(profileById[permission.grantee_user_id])}</td>
                    <td className="py-3 pr-4">{getProfileLabel(profileById[permission.owner_user_id])}</td>
                    <td className="py-3 pr-4">
                      {getAreaLabel(permission.area)} / {getTipoLabel(permission.tipo)}
                    </td>
                    <td className="py-3 pr-4">
                      {[
                        permission.can_view ? "Ver" : null,
                        permission.can_edit ? "Editar" : null,
                        permission.can_download ? "Descargar" : null,
                      ].filter(Boolean).join(" / ")}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(permission)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getProfileLabel(profile) {
  if (!profile) return "Usuario no encontrado";
  return profile.full_name || profile.email || profile.id;
}

function getAreaLabel(value) {
  return AREAS.find((area) => area.value === value)?.label || value || "Todos";
}

function getTipoLabel(value) {
  return TIPOS.find((tipo) => tipo.value === value)?.label || value || "Todos";
}
