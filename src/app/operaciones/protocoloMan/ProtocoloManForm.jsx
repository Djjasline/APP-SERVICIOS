import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, CheckCircle2, ClipboardCheck, Save } from "lucide-react";
import { saveOrUpdateReport } from "@/services/reportService";
import { GENERAL_FIELDS, PROTOCOLO_MAN_BASE_PATH, PROTOCOLO_MAN_BY_ID, PROTOCOLO_MAN_TIPO } from "./protocolosManConfig";

const inputClass = "w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200";
const sectionClass = "overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm";
const sectionHeaderClass = "bg-gradient-to-r from-blue-900 to-sky-700 px-3 py-2 text-xs font-black uppercase tracking-wide text-white";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeRows(count) {
  return Array.from({ length: count }, (_, index) => ({ id: String(index + 1).padStart(2, "0"), label: String(index + 1).padStart(2, "0") }));
}

function getValue(values, key) {
  return values[key] ?? "";
}

function getCheckbox(values, key) {
  return Boolean(values[key]);
}

function buildKey(sectionId, rowId, columnKey) {
  return `${sectionId}.${rowId}.${columnKey}`;
}

function FieldInput({ column, value, checked, onChange }) {
  if (column.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
      />
    );
  }

  if (column.type === "select") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        <option value="">Seleccionar</option>
        {(column.options || []).map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (column.type === "date") {
    return <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />;
  }

  return <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />;
}

function ProtocolHeader({ protocol, values, onChange }) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-lg">
      <div className="grid gap-0 md:grid-cols-[230px_1fr_230px]">
        <div className="flex items-center gap-3 border-b border-blue-200 p-4 md:border-b-0 md:border-r">
          <img src="/astap-logo.jpg" alt="ASTAP" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-lg font-black text-blue-950">ASTAP</p>
            <p className="text-xs font-semibold text-slate-500">Protocolos MAN</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-950 to-blue-800 p-4 text-center text-white">
          <h1 className="text-xl font-black uppercase tracking-wide md:text-2xl">{protocol.title}</h1>
          <p className="mt-1 text-sm font-semibold text-blue-100">{protocol.subtitle}</p>
        </div>

        <div className="grid grid-cols-[90px_1fr] text-xs">
          <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 font-bold">Código:</div>
          <div className="border-b border-blue-200 px-3 py-2 font-black">{protocol.code}</div>
          <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 font-bold">Versión:</div>
          <div className="border-b border-blue-200 px-3 py-2">01</div>
          <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 font-bold">Fecha:</div>
          <div className="border-b border-blue-200 px-2 py-1">
            <input type="date" value={getValue(values, "fechaDocumento")} onChange={(event) => onChange("fechaDocumento", event.target.value)} className={inputClass} />
          </div>
          <div className="bg-blue-50 px-3 py-2 font-bold">Página:</div>
          <div className="px-3 py-2">1 de 1</div>
        </div>
      </div>
      <div className="border-t border-blue-200 bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700">
        {protocol.description}
      </div>
    </div>
  );
}

function GeneralInfo({ values, onChange }) {
  return (
    <Section title="1. Información general">
      <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">
        {GENERAL_FIELDS.map((field) => (
          <label key={field.key} className="space-y-1 text-xs font-bold text-slate-700">
            <span>{field.label}</span>
            <input value={getValue(values, field.key)} onChange={(event) => onChange(field.key, event.target.value)} className={inputClass} />
          </label>
        ))}
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Fecha principal</span>
          <input type="date" value={getValue(values, "fechaPrincipal")} onChange={(event) => onChange("fechaPrincipal", event.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Periodo / semana</span>
          <input value={getValue(values, "periodoSemana")} onChange={(event) => onChange("periodoSemana", event.target.value)} className={inputClass} placeholder="Ej. 01/09/2026 al 07/09/2026" />
        </label>
      </div>
    </Section>
  );
}

function Section({ title, children }) {
  return (
    <section className={sectionClass}>
      <h2 className={sectionHeaderClass}>{title}</h2>
      {children}
    </section>
  );
}

function TableSection({ section, values, onChange }) {
  const rows = section.rows || makeRows(section.count || 1);
  return (
    <Section title={section.title}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-blue-950">
            <tr>
              <th className="border border-blue-100 px-2 py-2">N°</th>
              <th className="border border-blue-100 px-2 py-2">Elemento / Actividad</th>
              {(section.columns || []).map((column) => (
                <th key={column.key} className="border border-blue-100 px-2 py-2 text-center">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="w-12 border border-blue-100 px-2 py-1 text-center font-semibold text-slate-600">{row.id}</td>
                <td className="min-w-48 border border-blue-100 px-2 py-1 font-medium text-slate-800">{row.label}</td>
                {(section.columns || []).map((column) => {
                  const key = buildKey(section.id, row.id, column.key);
                  return (
                    <td key={column.key} className="min-w-28 border border-blue-100 px-2 py-1 text-center">
                      <FieldInput
                        column={column}
                        value={getValue(values, key)}
                        checked={getCheckbox(values, key)}
                        onChange={(value) => onChange(key, value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function PhotoSection({ section, values, onChange }) {
  return (
    <Section title={`${section.title} (mínimo requerido)`}>
      <div className="grid gap-3 p-3 md:grid-cols-3 xl:grid-cols-6">
        {makeRows(section.count || 6).map((row) => {
          const titleKey = buildKey(section.id, row.id, "titulo");
          const dateKey = buildKey(section.id, row.id, "fecha");
          const evidenceKey = buildKey(section.id, row.id, "evidencia");
          return (
            <div key={row.id} className="rounded-xl border border-blue-100 bg-slate-50 p-3 text-center">
              <Camera className="mx-auto text-slate-400" size={34} />
              <p className="mt-2 text-xs font-black text-blue-900">Foto {Number(row.id)}</p>
              <input value={getValue(values, titleKey)} onChange={(event) => onChange(titleKey, event.target.value)} className={`${inputClass} mt-2 text-center`} placeholder="Descripción" />
              <input type="date" value={getValue(values, dateKey)} onChange={(event) => onChange(dateKey, event.target.value)} className={`${inputClass} mt-2`} />
              <input value={getValue(values, evidenceKey)} onChange={(event) => onChange(evidenceKey, event.target.value)} className={`${inputClass} mt-2`} placeholder="URL o evidencia" />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function DamageSection({ section, values, onChange }) {
  const types = ["R: Rayón", "G: Golpe", "F: Fisura", "D: Deformación", "C: Corrosión", "FUG: Fuga", "O: Otro"];
  return (
    <Section title={section.title}>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-dashed border-blue-200 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
          {['Frontal', 'Posterior', 'Lateral izquierdo', 'Lateral derecho'].map((view) => (
            <div key={view} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mx-auto mb-2 h-14 w-28 rounded-xl border-2 border-slate-300" />
              {view}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-950">
            <p className="font-black uppercase">Tipos de daño</p>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {types.map((type) => <span key={type}>{type}</span>)}
            </div>
          </div>
          <textarea value={getValue(values, `${section.id}.observaciones`)} onChange={(event) => onChange(`${section.id}.observaciones`, event.target.value)} className={`${inputClass} min-h-28`} placeholder="Observaciones generales del diagrama" />
        </div>
      </div>
    </Section>
  );
}

function SummarySection({ section, values, onChange }) {
  return (
    <Section title={section.title}>
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        {(section.cards || []).map((card) => {
          const key = `${section.id}.${card}`;
          return (
            <label key={card} className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-bold text-blue-950">
              <span>{card}</span>
              <input value={getValue(values, key)} onChange={(event) => onChange(key, event.target.value)} className={`${inputClass} mt-2 text-center text-lg font-black`} placeholder="0" />
            </label>
          );
        })}
      </div>
    </Section>
  );
}

function NotesSection({ section, values, onChange }) {
  return (
    <Section title={section.title}>
      <textarea value={getValue(values, `${section.id}.notas`)} onChange={(event) => onChange(`${section.id}.notas`, event.target.value)} className={`${inputClass} min-h-32 rounded-none border-0 p-3`} />
    </Section>
  );
}

function ResultSection({ section, values, onChange }) {
  return (
    <Section title={section.title}>
      <div className="grid gap-3 p-4 md:grid-cols-3">
        {(section.options || []).map((option) => (
          <label key={option} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
            <input type="radio" name={section.id} checked={getValue(values, `${section.id}.resultado`) === option} onChange={() => onChange(`${section.id}.resultado`, option)} className="h-4 w-4 text-blue-700" />
            {option}
          </label>
        ))}
      </div>
    </Section>
  );
}

function ProjectionSection({ section, values, onChange }) {
  return (
    <Section title={section.title}>
      <div className="grid gap-3 p-3 md:grid-cols-3">
        {["Fecha contractual", "Fecha proyectada actual", "Desviación proyectada"].map((label) => (
          <label key={label} className="space-y-1 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-bold text-blue-950">
            <span>{label}</span>
            <input value={getValue(values, `${section.id}.${label}`)} onChange={(event) => onChange(`${section.id}.${label}`, event.target.value)} className={inputClass} />
          </label>
        ))}
      </div>
    </Section>
  );
}

function SignatureSection({ section, values, onChange }) {
  return (
    <Section title={section.title}>
      <div className="grid gap-3 p-3 md:grid-cols-3">
        {(section.signatures || []).map((signature) => (
          <div key={signature.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-black text-blue-950">{signature.label}</p>
            {["Nombre", "Cargo", "Firma", "Fecha"].map((label) => {
              const key = buildKey(section.id, signature.id, label.toLowerCase());
              return (
                <label key={label} className="mb-2 block text-xs font-semibold text-slate-600">
                  {label}
                  <input type={label === "Fecha" ? "date" : "text"} value={getValue(values, key)} onChange={(event) => onChange(key, event.target.value)} className={inputClass} />
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </Section>
  );
}

function renderSection(section, values, onChange) {
  if (section.type === "photos") return <PhotoSection key={section.id} section={section} values={values} onChange={onChange} />;
  if (section.type === "damage") return <DamageSection key={section.id} section={section} values={values} onChange={onChange} />;
  if (section.type === "summary") return <SummarySection key={section.id} section={section} values={values} onChange={onChange} />;
  if (section.type === "notes") return <NotesSection key={section.id} section={section} values={values} onChange={onChange} />;
  if (section.type === "result") return <ResultSection key={section.id} section={section} values={values} onChange={onChange} />;
  if (section.type === "projection") return <ProjectionSection key={section.id} section={section} values={values} onChange={onChange} />;
  if (section.type === "signatures") return <SignatureSection key={section.id} section={section} values={values} onChange={onChange} />;
  return <TableSection key={section.id} section={section} values={values} onChange={onChange} />;
}

export default function ProtocoloManForm() {
  const { protocolId } = useParams();
  const navigate = useNavigate();
  const protocol = PROTOCOLO_MAN_BY_ID[protocolId];
  const [values, setValues] = useState({ fechaDocumento: today(), fechaPrincipal: today() });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!protocol) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Formulario no encontrado.
      </div>
    );
  }

  const updateValue = (key, value) => {
    setMessage("");
    setError("");
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (estado) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await saveOrUpdateReport({
        area: "operaciones",
        tipo: PROTOCOLO_MAN_TIPO,
        subtipo: protocol.id,
        data: {
          protocolCode: protocol.code,
          protocolTitle: protocol.title,
          values,
        },
        estado,
      });
      setMessage(estado === "completado" ? "Formulario completado y guardado." : "Borrador guardado correctamente.");
    } catch (err) {
      console.error("Error guardando protocolo MAN:", err);
      setError("No se pudo guardar el formulario. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={() => navigate(PROTOCOLO_MAN_BASE_PATH)} className="btn-volver-orange self-start">
          Volver
        </button>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => save("borrador")} className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
            <Save size={16} /> Guardar borrador
          </button>
          <button type="button" disabled={saving} onClick={() => save("completado")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60">
            <CheckCircle2 size={16} /> Marcar completado
          </button>
        </div>
      </div>

      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="space-y-4 rounded-2xl bg-slate-100 p-3 shadow-inner">
        <ProtocolHeader protocol={protocol} values={values} onChange={updateValue} />
        <GeneralInfo values={values} onChange={updateValue} />
        {protocol.sections.map((section) => renderSection(section, values, updateValue))}
        <div className="flex items-center justify-center gap-4 py-3 text-xs font-bold uppercase tracking-wide text-blue-700">
          <span>Trazabilidad</span>
          <span>|</span>
          <span>Calidad</span>
          <span>|</span>
          <span>Servicio</span>
          <span>|</span>
          <span>Vehículos en buenas manos</span>
          <span className="ml-4 text-blue-950">{protocol.code} V01</span>
        </div>
      </div>
    </div>
  );
}
