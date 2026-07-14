import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { createEmptyVisitaCampoData } from "./visitaCampoData";
import { listToText, textToList } from "./tableUtils";

const inputClass = "w-full rounded border border-gray-300 px-3 py-2 text-sm";
const labelClass = "space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500";

const AutoTextarea = ({ value, onChange, className = "", rows = 3, ...props }) => {
  const ref = useRef(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value || ""}
      onChange={(event) => {
        onChange?.(event);
        requestAnimationFrame(resize);
      }}
      className={`${className} overflow-hidden`}
      {...props}
    />
  );
};

export default function VisitaCampoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isSuperAdmin } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const isEditing = !!id;
  const [data, setData] = useState(createEmptyVisitaCampoData());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadRecord = async () => {
      const { data: record, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !record) {
        console.error(error);
        alert("No se encontró el informe.");
        navigate("/petroleo/visita-campo");
        return;
      }

      if (!superAdminActivo && record.user_id !== user?.id) {
        alert("No tienes permiso para editar este informe.");
        navigate("/petroleo/visita-campo");
        return;
      }

      setData({ ...createEmptyVisitaCampoData(), ...(record.data || {}) });
      setLoading(false);
    };

    loadRecord();
  }, [id, navigate, superAdminActivo, user?.id]);

  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const updateRepuesto = (index, field, value) => {
    setData((prev) => ({
      ...prev,
      repuestos: prev.repuestos.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addRepuesto = () => {
    setData((prev) => ({
      ...prev,
      repuestos: [...prev.repuestos, { titulo: "Nuevo grupo", caption: "", rows: "Ítem\tDescripción\tRef.\tN/P\tCódigo EPP\tCant." }],
    }));
  };

  const removeRepuesto = (index) => {
    setData((prev) => ({ ...prev, repuestos: prev.repuestos.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const save = async (estado = "borrador") => {
    if (!user?.id) return;
    setSaving(true);

    const payload = {
      area: "petroleo",
      tipo: "visita_campo",
      subtipo: "flowserve",
      estado,
      data,
      updated_at: new Date().toISOString(),
    };

    const query = isEditing
      ? supabase.from("registros").update(payload).eq("id", id).select().maybeSingle()
      : supabase.from("registros").insert({ ...payload, user_id: user.id }).select().maybeSingle();

    const { data: saved, error } = await query;
    setSaving(false);

    if (error) {
      console.error(error);
      alert("No se pudo guardar el informe.");
      return;
    }

    navigate(`/petroleo/visita-campo/${saved.id}`);
  };

  if (loading) return <div className="p-6 text-gray-500">Cargando informe...</div>;

  return (
    <div className="rounded-2xl bg-white p-6 text-gray-900 shadow space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Informe técnico de visita en campo</h1>
          <p className="text-sm text-gray-500">Petróleo - formato Flowserve / EP Petroecuador.</p>
        </div>
        <button onClick={() => navigate("/petroleo/visita-campo")} className="btn-volver-orange py-1">Volver</button>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <label className={labelClass}>Código documento<input className={inputClass} value={data.codigoDocumento} onChange={(e) => set("codigoDocumento", e.target.value)} /></label>
        <label className={labelClass}>No. Revisión<input className={inputClass} value={data.revision} onChange={(e) => set("revision", e.target.value)} /></label>
        <label className={labelClass}>Fecha<input type="date" className={inputClass} value={data.fecha} onChange={(e) => set("fecha", e.target.value)} /></label>
        <label className={labelClass}>Cliente<input className={inputClass} value={data.cliente} onChange={(e) => set("cliente", e.target.value)} /></label>
        <label className={labelClass}>Ubicación<input className={inputClass} value={data.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} /></label>
        <label className={labelClass}>Marca<input className={inputClass} value={data.marca} onChange={(e) => set("marca", e.target.value)} /></label>
        <label className={`${labelClass} md:col-span-3`}>Modelos<input className={inputClass} value={data.modelos} onChange={(e) => set("modelos", e.target.value)} /></label>
      </section>

      <label className={labelClass}>Antecedentes<AutoTextarea rows={7} className={inputClass} value={data.antecedentes} onChange={(e) => set("antecedentes", e.target.value)} /></label>
      <label className={labelClass}>Objetivos de la asistencia en campo<AutoTextarea rows={6} className={inputClass} value={listToText(data.objetivos)} onChange={(e) => set("objetivos", textToList(e.target.value))} /></label>

      <section className="rounded-xl border border-slate-300 bg-white shadow-sm">
        <h2 className="border-b border-slate-300 bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-900">
          Descripción de actividades
        </h2>

        <div className="space-y-4 p-4">
          <label className={labelClass}>
            Lugar de ubicación del equipo.
            <AutoTextarea
              rows={4}
              className={inputClass}
              value={data.descripcionLugar}
              onChange={(e) => set("descripcionLugar", e.target.value)}
            />
          </label>

        {data.actividades.map((actividad, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              {index + 1}. {actividad.titulo}:
            </div>
            <AutoTextarea rows={3} className={inputClass} value={actividad.detalle} onChange={(e) => setData((prev) => ({ ...prev, actividades: prev.actividades.map((item, itemIndex) => itemIndex === index ? { ...item, detalle: e.target.value } : item) }))} />
          </div>
        ))}
        </div>
      </section>

      <label className={labelClass}>Tabla resumen de equipos<AutoTextarea rows={12} className={`${inputClass} font-mono`} value={data.equiposTabla} onChange={(e) => set("equiposTabla", e.target.value)} /></label>
      <p className="text-xs text-gray-500">Usa tabulaciones entre columnas. La primera línea es encabezado.</p>

      <label className={labelClass}>Introducción lista de partes<AutoTextarea rows={3} className={inputClass} value={data.partesIntro} onChange={(e) => set("partesIntro", e.target.value)} /></label>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Repuestos recomendados</h2>
          <button type="button" onClick={addRepuesto} className="rounded bg-slate-700 px-3 py-1 text-sm text-white">Agregar grupo</button>
        </div>
        {data.repuestos.map((grupo, index) => (
          <div key={index} className="rounded border bg-gray-50 p-3 space-y-2">
            <div className="flex gap-2">
              <input className={inputClass} value={grupo.titulo} onChange={(e) => updateRepuesto(index, "titulo", e.target.value)} />
              <button type="button" onClick={() => removeRepuesto(index)} className="rounded bg-red-600 px-3 text-sm text-white">Eliminar</button>
            </div>
            <input className={inputClass} value={grupo.caption} onChange={(e) => updateRepuesto(index, "caption", e.target.value)} />
            <AutoTextarea rows={7} className={`${inputClass} font-mono`} value={grupo.rows} onChange={(e) => updateRepuesto(index, "rows", e.target.value)} />
          </div>
        ))}
      </section>

      <label className={labelClass}>Intervalos API 610 / ANSI B73.1<AutoTextarea rows={7} className={`${inputClass} font-mono`} value={data.intervalosTabla} onChange={(e) => set("intervalosTabla", e.target.value)} /></label>
      <label className={labelClass}>Nota de intervalos<AutoTextarea rows={4} className={inputClass} value={data.notaIntervalos} onChange={(e) => set("notaIntervalos", e.target.value)} /></label>
      <label className={labelClass}>Conclusiones<AutoTextarea rows={6} className={inputClass} value={listToText(data.conclusiones)} onChange={(e) => set("conclusiones", textToList(e.target.value))} /></label>
      <label className={labelClass}>Recomendaciones<AutoTextarea rows={6} className={inputClass} value={listToText(data.recomendaciones)} onChange={(e) => set("recomendaciones", textToList(e.target.value))} /></label>

      <section className="grid gap-3 md:grid-cols-3">
        <label className={labelClass}>Realizado por<AutoTextarea rows={4} className={inputClass} value={data.realizadoPor} onChange={(e) => set("realizadoPor", e.target.value)} /></label>
        <label className={labelClass}>Revisado por<AutoTextarea rows={4} className={inputClass} value={data.revisadoPor} onChange={(e) => set("revisadoPor", e.target.value)} /></label>
        <label className={labelClass}>Recibido por<AutoTextarea rows={4} className={inputClass} value={data.recibidoPor} onChange={(e) => set("recibidoPor", e.target.value)} /></label>
      </section>

      <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:justify-between">
        <button type="button" onClick={() => navigate("/petroleo/visita-campo")} className="btn-volver-orange px-6">Volver</button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {isEditing && <button type="button" onClick={() => navigate(`/petroleo/visita-campo/${id}/pdf`)} className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700">Ver PDF</button>}
          <button type="button" disabled={saving} onClick={() => save("borrador")} className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400">Guardar borrador</button>
          <button type="button" disabled={saving} onClick={() => save("completado")} className="rounded bg-slate-900 px-6 py-2 text-white hover:bg-slate-800 disabled:bg-gray-400">Completar</button>
        </div>
      </div>
    </div>
  );
}
