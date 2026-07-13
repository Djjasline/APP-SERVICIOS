import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  deleteRecordAccessPermission,
  getAccessProfiles,
  getAllRecordAccessPermissions,
  saveRecordAccessPermission,
} from "@/services/accessControlService";
import {
  deleteNotificationRecipientRule,
  getAllNotificationRecipientRules,
  saveNotificationRecipientRule,
} from "@/services/notificationRecipientService";
import {
  getReportCodeSequences,
  updateReportCodeSequence,
} from "@/services/reportCodeService";

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
  { value: "informe:bomba", label: "Informe - Bomba" },
  { value: "informe:valvula", label: "Informe - Válvula" },
  { value: "informe:avance_epmaps", label: "Informe - Recorrido/EPMAPS" },
  { value: "inspeccion", label: "Inspección" },
  { value: "inspeccion:hidro", label: "Inspección - Hidrosuccionador" },
  { value: "inspeccion:barredora", label: "Inspección - Barredora Pelican" },
  { value: "inspeccion:barredora-road-wizard", label: "Inspección - Barredora Road Wizard" },
  { value: "inspeccion:camara", label: "Inspección - Cámara" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "mantenimiento:hidro", label: "Mantenimiento - Hidrosuccionador" },
  { value: "mantenimiento:barredora", label: "Mantenimiento - Barredora Pelican" },
  { value: "mantenimiento:barredora-road-wizard", label: "Mantenimiento - Barredora Road Wizard" },
  { value: "mantenimiento:vcam", label: "Mantenimiento - Cámara V-Cam6" },
  { value: "protocolo", label: "Protocolo" },
  { value: "protocolo:hidrosuccionador-vactor", label: "Protocolo - Hidrosuccionador Vactor" },
  { value: "protocolo:camara-vcam6", label: "Protocolo - Cámara V-Cam6" },
  { value: "registro", label: "Registro de herramientas" },
  { value: "recepcion", label: "Bitácora y control vehicular" },
  { value: "liberacion", label: "Liberación" },
  { value: "visita_campo", label: "Visita de campo" },
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

const emptyNotificationForm = {
  recipient_user_id: "",
  area: "todos",
  tipo: "todos",
  active: true,
};

const emptySequenceForm = {
  prefix: "",
  last_number: "",
};

export default function RegistroAccessAdmin() {
  const { isLight } = useTheme();
  const [profiles, setProfiles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [notificationRules, setNotificationRules] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [notificationForm, setNotificationForm] = useState(emptyNotificationForm);
  const [sequenceForm, setSequenceForm] = useState(emptySequenceForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sequenceSaving, setSequenceSaving] = useState(false);
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
      let notificationRulesData = [];
      let sequencesData = [];

      try {
        notificationRulesData = await getAllNotificationRecipientRules();
      } catch (notificationErr) {
        console.error(notificationErr);
        setError("No se pudieron cargar los destinatarios de notificaciones. Ejecuta el SQL de configuración si aún no existe la tabla.");
      }

      try {
        sequencesData = await getReportCodeSequences();
      } catch (sequenceErr) {
        console.error(sequenceErr);
        setError((prev) => prev || "No se pudieron cargar las secuencias. Ejecuta el SQL actualizado de report_code_sequences si aún no existe el control.");
      }

      setProfiles(profilesData);
      setPermissions(permissionsData);
      setNotificationRules(notificationRulesData);
      setSequences(sequencesData);
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

  const handleNotificationChange = (field, value) => {
    setMessage("");
    setNotificationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSequenceChange = (field, value) => {
    setMessage("");
    setSequenceForm((prev) => ({ ...prev, [field]: value }));
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

  const handleNotificationSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!notificationForm.recipient_user_id) {
      setError("Selecciona el destinatario de notificaciones.");
      return;
    }

    try {
      setSaving(true);
      await saveNotificationRecipientRule(notificationForm);
      setMessage("Destinatario de notificaciones guardado correctamente.");
      setNotificationForm(emptyNotificationForm);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el destinatario. Verifica que el SQL de destinatarios esté ejecutado en Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const handleSequenceSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSequenceSaving(true);
      await updateReportCodeSequence(sequenceForm.prefix, sequenceForm.last_number);
      setMessage("Secuencia actualizada correctamente.");
      setSequenceForm(emptySequenceForm);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err?.message || "No se pudo actualizar la secuencia.");
    } finally {
      setSequenceSaving(false);
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

  const handleNotificationDelete = async (rule) => {
    if (!confirm("¿Eliminar este destinatario de notificaciones?")) return;

    try {
      await deleteNotificationRecipientRule(rule.id);
      setNotificationRules((prev) => prev.filter((item) => item.id !== rule.id));
      setMessage("Destinatario eliminado.");
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el destinatario.");
    }
  };

  const editSequence = (sequence) => {
    setMessage("");
    setSequenceForm({
      prefix: sequence.prefix || "",
      last_number: String(sequence.last_number ?? ""),
    });
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

      <form onSubmit={handleSequenceSubmit} className={`${cardClass} rounded-2xl p-5 shadow space-y-4`}>
        <div>
          <h2 className="font-semibold">Control de secuencias de informes</h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-white/70"}`}>
            Ajusta el último número reservado por prefijo. Ejemplo: para que el próximo código sea P-26-006-57-005, deja el prefijo P-26-006-57 con último número 4.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-4 items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Prefijo</span>
            <input
              value={sequenceForm.prefix}
              onChange={(event) => handleSequenceChange("prefix", event.target.value)}
              placeholder="Ej: P-26-006-57"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Último número</span>
            <input
              type="number"
              min="0"
              step="1"
              value={sequenceForm.last_number}
              onChange={(event) => handleSequenceChange("last_number", event.target.value)}
              placeholder="Ej: 4"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            />
          </label>

          <button
            type="submit"
            disabled={sequenceSaving || loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {sequenceSaving ? "Guardando..." : "Guardar secuencia"}
          </button>
        </div>

        <div className={`rounded-lg border px-4 py-3 text-sm ${isLight ? "border-blue-200 bg-blue-50 text-blue-900" : "border-blue-300/30 bg-blue-500/10 text-blue-100"}`}>
          Si corriges un informe histórico de 005 a 004, ajusta esta secuencia a 4 después de editar el código del registro. Si todavía existe un informe con 005, el sistema tomará 005 como último existente y el próximo será 006.
        </div>

        {loading ? (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>Cargando secuencias...</p>
        ) : sequences.length === 0 ? (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>No hay secuencias registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className={isLight ? "text-slate-500" : "text-white/60"}>
                <tr>
                  <th className="py-2 pr-4">Prefijo</th>
                  <th className="py-2 pr-4">Último número</th>
                  <th className="py-2 pr-4">Siguiente sugerido</th>
                  <th className="py-2 pr-4">Actualizado</th>
                  <th className="py-2 pr-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {sequences.map((sequence) => (
                  <tr key={sequence.prefix} className={isLight ? "border-t border-slate-100" : "border-t border-white/10"}>
                    <td className="py-3 pr-4 font-semibold">{sequence.prefix}</td>
                    <td className="py-3 pr-4">{sequence.last_number}</td>
                    <td className="py-3 pr-4">
                      {sequence.prefix}-{String((Number(sequence.last_number) || 0) + 1).padStart(3, "0")}
                    </td>
                    <td className="py-3 pr-4">
                      {sequence.updated_at ? new Date(sequence.updated_at).toLocaleString() : "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => editSequence(sequence)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>

      <form onSubmit={handleNotificationSubmit} className={`${cardClass} rounded-2xl p-5 shadow space-y-4`}>
        <div>
          <h2 className="font-semibold">Destinatarios de notificaciones</h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-white/70"}`}>
            Define quién recibe avisos cuando se guardan formularios por área y formato. Si cambia un correo, actualiza el perfil del usuario y no el código.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Destinatario</span>
            <select
              value={notificationForm.recipient_user_id}
              onChange={(event) => handleNotificationChange("recipient_user_id", event.target.value)}
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
            <span className="font-medium">Área</span>
            <select
              value={notificationForm.area}
              onChange={(event) => handleNotificationChange("area", event.target.value)}
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
              value={notificationForm.tipo}
              onChange={(event) => handleNotificationChange("tipo", event.target.value)}
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

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notificationForm.active}
            onChange={(event) => handleNotificationChange("active", event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Activo
        </label>

        <button
          type="submit"
          disabled={saving || loading}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar destinatario"}
        </button>
      </form>

      <div className={`${cardClass} rounded-2xl p-5 shadow space-y-4`}>
        <h2 className="font-semibold">Destinatarios activos</h2>

        {loading ? (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>Cargando...</p>
        ) : notificationRules.length === 0 ? (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>No hay destinatarios configurados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className={isLight ? "text-slate-500" : "text-white/60"}>
                <tr>
                  <th className="py-2 pr-4">Destinatario</th>
                  <th className="py-2 pr-4">Alcance</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {notificationRules.map((rule) => (
                  <tr key={rule.id} className={isLight ? "border-t border-slate-100" : "border-t border-white/10"}>
                    <td className="py-3 pr-4">{getProfileLabel(profileById[rule.recipient_user_id]) || rule.recipient_email}</td>
                    <td className="py-3 pr-4">
                      {getAreaLabel(rule.area)} / {getTipoLabel(rule.tipo)}
                    </td>
                    <td className="py-3 pr-4">{rule.active === false ? "Inactivo" : "Activo"}</td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => handleNotificationDelete(rule)}
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
