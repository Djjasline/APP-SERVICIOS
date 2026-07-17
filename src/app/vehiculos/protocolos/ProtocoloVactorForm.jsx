import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { saveOrUpdateReport } from "@/services/reportService";
import ReportCodeInput from "@/components/ReportCodeInput";
import { leerBorrador, useAutoguardado } from "@/hooks/useAutoguardado";
import {
  buildInitialBooleanMap,
  buildInitialChecklist,
  buildInitialStatusMap,
  CHECKLIST_SECCIONES,
  EPP_SECTION_IMAGE,
  EPP_SECTION_MARKS,
  EPP_SECTION_TEXTS,
  EPP_ITEMS,
  ESPECIFICACIONES,
  HERRAMIENTAS,
  INSTRUCCIONES_OPERACION,
  LUBRICANTES,
  PROTOCOLO_VACTOR_INFO,
  PRUEBAS_PREVIAS,
  PRUEBAS_FINALES,
  RECAMBIO_ELEMENTOS,
  RIESGO_ITEMS,
  SEGURIDAD_ITEMS,
} from "./protocoloVactorData";

const emptyData = {
  referenciaContrato: "",
  pedidoDemanda: "",
  descripcion: "Mantenimiento semestral/anual de hidrosuccionador Vactor Serie 2100 PD",
  codInf: "",
  cliente: "",
  equipoNo: "",
  horometro: "",
  modelo: "2100 PD",
  serie: "",
  tipoMantenimiento: "semestral",
  tecnicoNombre: "",
  tecnicoCorreo: "",
  tecnicoFirma: "",
  seguridad: buildInitialBooleanMap(SEGURIDAD_ITEMS),
  epp: buildInitialBooleanMap(EPP_ITEMS),
  riesgos: buildInitialBooleanMap(RIESGO_ITEMS),
  pruebasPrevias: buildInitialStatusMap(PRUEBAS_PREVIAS),
  recambios: buildInitialStatusMap(RECAMBIO_ELEMENTOS, true),
  checklist: buildInitialChecklist(),
  pruebasFinales: buildInitialBooleanMap(PRUEBAS_FINALES),
  resultadoGeneral: "",
  observacionesGenerales: "",
  aprobacion: {
    fecha: "",
    horometro: "",
    proximoMantenimiento: "",
    tecnicoResponsable: "",
    firma: "",
  },
};

function mergeData(value = {}) {
  return {
    ...emptyData,
    ...value,
    seguridad: { ...emptyData.seguridad, ...(value.seguridad || {}) },
    epp: { ...emptyData.epp, ...(value.epp || {}) },
    riesgos: { ...emptyData.riesgos, ...(value.riesgos || {}) },
    pruebasPrevias: { ...emptyData.pruebasPrevias, ...(value.pruebasPrevias || {}) },
    recambios: { ...emptyData.recambios, ...(value.recambios || {}) },
    checklist: { ...emptyData.checklist, ...(value.checklist || {}) },
    pruebasFinales: { ...emptyData.pruebasFinales, ...(value.pruebasFinales || {}) },
    aprobacion: { ...emptyData.aprobacion, ...(value.aprobacion || {}) },
  };
}

const inputClass = "w-full rounded border border-slate-300 px-2 py-1 text-sm";

function GuideCheck({ checked, onChange, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-full w-full items-center justify-center rounded-sm border-2 border-blue-950 bg-white/95 font-black leading-none text-blue-950 shadow-sm transition hover:bg-blue-50 hover:ring-2 hover:ring-blue-500 ${
        compact ? "text-[clamp(8px,0.95vw,13px)]" : "text-[clamp(9px,1.1vw,16px)]"
      }`}
      aria-pressed={checked}
    >
      {checked ? "✓" : ""}
    </button>
  );
}

function EppGuideSection({ data, setNested }) {
  const groups = [
    ["seguridad", EPP_SECTION_MARKS.seguridad],
    ["epp", EPP_SECTION_MARKS.epp],
    ["riesgos", EPP_SECTION_MARKS.riesgos],
  ];

  return (
    <section className="overflow-x-auto rounded-xl border border-blue-900 bg-white p-2 shadow-sm">
      <div className="relative mx-auto w-[1100px] max-w-none overflow-hidden">
        <img src={EPP_SECTION_IMAGE} alt="Seguridad, EPP recomendado y riesgos principales" className="block w-full select-none" />
        {EPP_SECTION_TEXTS.seguridad.map(([key, label, left, top, width]) => (
          <div
            key={`texto-seguridad-${key}`}
            className="absolute z-10 text-[clamp(7.5px,0.82vw,12px)] font-bold leading-[1.08] text-slate-950"
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
          >
            {label}
          </div>
        ))}

        {[...EPP_SECTION_TEXTS.epp, ...EPP_SECTION_TEXTS.riesgos].map(([key, label, left, top, width]) => (
          <div
            key={`texto-${key}`}
            className="absolute z-10 -translate-x-1/2 text-center text-[clamp(6px,0.62vw,9.5px)] font-bold leading-[1.05] text-slate-950"
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
          >
            {label}
          </div>
        ))}

        {groups.flatMap(([group, marks]) =>
          marks.map(([key, left, top]) => (
            <div
              key={`${group}-${key}`}
              className="absolute z-10"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: group === "seguridad" ? "2.35%" : "2.25%",
                aspectRatio: "1 / 1",
                transform: "translate(-50%, -50%)",
              }}
            >
              <GuideCheck checked={!!data[group]?.[key]} compact={group !== "seguridad"} onChange={(checked) => setNested(group, key, checked)} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function ProtocoloVactorForm() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(emptyData);
  const [saving, setSaving] = useState(false);
  const draftKey = `protocolo_vactor_${isEditing ? id : "new"}`;
  const { limpiar } = useAutoguardado(draftKey, data, !saving);

  useEffect(() => {
    const load = async () => {
      if (!isEditing) return;

      const { data: record, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("area", "vehiculos")
        .eq("tipo", "protocolo")
        .eq("subtipo", "hidrosuccionador-vactor")
        .maybeSingle();

      if (error || !record) {
        console.error("Error cargando protocolo:", error);
        alert("No se pudo cargar el protocolo.");
        navigate("/vehiculos/protocolos");
        return;
      }

      setData(mergeData(record.data));
    };

    load();
  }, [id, isEditing, navigate]);

  useEffect(() => {
    if (isEditing || !user?.email) return;
    const draft = leerBorrador(draftKey, user?.id || "anon");
    if (draft?.datos) {
      setData(mergeData(draft.datos));
      return;
    }

    setData((prev) => ({ ...prev, tecnicoCorreo: user.email }));
  }, [draftKey, isEditing, user?.email, user?.id]);

  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  const setNested = (group, field, value) => {
    setData((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
  };
  const setChecklist = (codigo, field, value) => {
    setData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [codigo]: { ...(prev.checklist?.[codigo] || {}), [field]: value },
      },
    }));
  };
  const setStatusItem = (group, codigo, field, value) => {
    setData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [codigo]: { ...(prev[group]?.[codigo] || {}), [field]: value },
      },
    }));
  };

  const save = async (estado) => {
    if (!data.tecnicoNombre.trim()) {
      alert("Técnico responsable es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await saveOrUpdateReport({
        id: isEditing ? id : null,
        area: "vehiculos",
        tipo: "protocolo",
        subtipo: "hidrosuccionador-vactor",
        data,
        estado,
      });

      limpiar();
      alert(estado === "completado" ? "Protocolo completado." : "Borrador guardado.");
      navigate("/vehiculos/protocolos");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el protocolo. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 bg-slate-100 min-h-screen">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{PROTOCOLO_VACTOR_INFO.titulo}</h1>
          <p className="text-sm text-slate-600">{PROTOCOLO_VACTOR_INFO.descripcion}</p>
        </div>
        <button className="btn-volver-orange" onClick={() => navigate("/vehiculos/protocolos")}>Volver</button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div><strong>Código:</strong> {PROTOCOLO_VACTOR_INFO.codigo}</div>
          <div><strong>Versión:</strong> {PROTOCOLO_VACTOR_INFO.version}</div>
          <label>Fecha<input className={inputClass} type="date" value={data.aprobacion.fecha} onChange={(e) => setNested("aprobacion", "fecha", e.target.value)} /></label>
          <label>Código del informe<ReportCodeInput value={data.codInf} onChange={(value) => set("codInf", value)} placeholder="Ej: P-26-006-54" /></label>
        </div>
      </div>

      <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-slate-900">1. Datos generales del equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">Cliente<input className={inputClass} value={data.cliente} onChange={(e) => set("cliente", e.target.value)} /></label>
          <label className="text-sm">Equipo No.<input className={inputClass} value={data.equipoNo} onChange={(e) => set("equipoNo", e.target.value)} /></label>
          <label className="text-sm">Horómetro<input className={inputClass} value={data.horometro} onChange={(e) => set("horometro", e.target.value)} /></label>
          <label className="text-sm">Modelo<input className={inputClass} value={data.modelo} onChange={(e) => set("modelo", e.target.value)} /></label>
          <label className="text-sm">Serie<input className={inputClass} value={data.serie} onChange={(e) => set("serie", e.target.value)} /></label>
          <label className="text-sm">Pedido / Demanda<input className={inputClass} value={data.pedidoDemanda} onChange={(e) => set("pedidoDemanda", e.target.value)} /></label>
          <label className="text-sm">Referencia contrato<input className={inputClass} value={data.referenciaContrato} onChange={(e) => set("referenciaContrato", e.target.value)} /></label>
          <label className="text-sm">Tipo de mantenimiento<select className={inputClass} value={data.tipoMantenimiento} onChange={(e) => set("tipoMantenimiento", e.target.value)}><option value="semestral">Semestral</option><option value="anual">Anual</option></select></label>
        </div>
      </section>

      <EppGuideSection data={data} setNested={setNested} />

      <section className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <h2 className="font-semibold text-slate-900">Pruebas de encendido previas al servicio</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border">
            <thead><tr className="bg-slate-100"><th className="border p-2">Ítem</th><th className="border p-2">Detalle</th><th className="border p-2">Cumple</th><th className="border p-2">No cumple</th><th className="border p-2">N/A</th><th className="border p-2">Observación</th></tr></thead>
            <tbody>
              {PRUEBAS_PREVIAS.map(([codigo, detalle]) => (
                <tr key={codigo}>
                  <td className="border p-2 font-semibold">{codigo}</td>
                  <td className="border p-2">{detalle}</td>
                  {["cumple", "noCumple", "na"].map((estado) => (
                    <td key={estado} className="border p-2 text-center"><input type="radio" name={`prueba-previa-${codigo}`} checked={data.pruebasPrevias?.[codigo]?.estado === estado} onChange={() => setStatusItem("pruebasPrevias", codigo, "estado", estado)} /></td>
                  ))}
                  <td className="border p-2"><input className="w-full border rounded px-2 py-1" value={data.pruebasPrevias?.[codigo]?.observacion || ""} onChange={(e) => setStatusItem("pruebasPrevias", codigo, "observacion", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <h2 className="font-semibold text-slate-900">Recambio de elementos del módulo hidrosuccionador</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border">
            <thead><tr className="bg-slate-100"><th className="border p-2">Ítem</th><th className="border p-2">Elemento</th><th className="border p-2">Cantidad</th><th className="border p-2">Cumple</th><th className="border p-2">No cumple</th><th className="border p-2">N/A</th><th className="border p-2">Observación</th></tr></thead>
            <tbody>
              {RECAMBIO_ELEMENTOS.map(([codigo, detalle]) => (
                <tr key={codigo}>
                  <td className="border p-2 font-semibold">{codigo}</td>
                  <td className="border p-2">{detalle}</td>
                  <td className="border p-2"><input className="w-20 border rounded px-2 py-1 text-center" value={data.recambios?.[codigo]?.cantidad || ""} onChange={(e) => setStatusItem("recambios", codigo, "cantidad", e.target.value)} /></td>
                  {["cumple", "noCumple", "na"].map((estado) => (
                    <td key={estado} className="border p-2 text-center"><input type="radio" name={`recambio-${codigo}`} checked={data.recambios?.[codigo]?.estado === estado} onChange={() => setStatusItem("recambios", codigo, "estado", estado)} /></td>
                  ))}
                  <td className="border p-2"><input className="w-full border rounded px-2 py-1" value={data.recambios?.[codigo]?.observacion || ""} onChange={(e) => setStatusItem("recambios", codigo, "observacion", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Herramientas requeridas</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            {HERRAMIENTAS.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Instrucciones operativas</h2>
          <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
            {INSTRUCCIONES_OPERACION.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <h2 className="font-semibold text-slate-900">3. Checklist de mantenimiento</h2>
        {CHECKLIST_SECCIONES.map((section) => (
          <div key={section.titulo} className="overflow-x-auto">
            <h3 className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-t">{section.titulo}</h3>
            {section.imagenReferencia && (
              <div className="border border-t-0 p-3 bg-slate-50">
                <p className="text-xs font-semibold text-slate-700 mb-2">Imagen de referencia fija del protocolo</p>
                <img
                  src={section.imagenReferencia}
                  alt={`Imagen de referencia ${section.titulo}`}
                  className="max-h-72 w-full object-contain rounded border bg-white"
                />
              </div>
            )}
            <table className="w-full text-xs border-collapse border">
              <thead><tr className="bg-slate-100"><th className="border p-2">No.</th><th className="border p-2">Sistema / componente</th><th className="border p-2">Actividad</th><th className="border p-2">Cumple</th><th className="border p-2">No cumple</th><th className="border p-2">N/A</th><th className="border p-2">Observación</th></tr></thead>
              <tbody>
                {section.items.map(([codigo, componente, actividad]) => (
                  <tr key={codigo}>
                    <td className="border p-2 font-semibold">{codigo}</td>
                    <td className="border p-2">{componente}</td>
                    <td className="border p-2">{actividad}</td>
                    {["cumple", "noCumple", "na"].map((estado) => (
                      <td key={estado} className="border p-2 text-center"><input type="radio" name={codigo} checked={data.checklist?.[codigo]?.estado === estado} onChange={() => setChecklist(codigo, "estado", estado)} /></td>
                    ))}
                    <td className="border p-2"><input className="w-full border rounded px-2 py-1" value={data.checklist?.[codigo]?.observacion || ""} onChange={(e) => setChecklist(codigo, "observacion", e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-2">
          <h2 className="font-semibold text-slate-900">4. Pruebas finales de operación</h2>
          {PRUEBAS_FINALES.map(([key, label]) => (
            <label key={key} className="flex gap-2 text-sm"><input type="checkbox" checked={!!data.pruebasFinales[key]} onChange={(e) => setNested("pruebasFinales", key, e.target.checked)} /> {label}</label>
          ))}
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-2">
          <h2 className="font-semibold text-slate-900">5. Resultado general</h2>
          {["cumple", "noCumple", "na"].map((value) => <label key={value} className="flex gap-2 text-sm"><input type="radio" name="resultado" checked={data.resultadoGeneral === value} onChange={() => set("resultadoGeneral", value)} /> {value === "cumple" ? "Cumple" : value === "noCumple" ? "No cumple" : "N/A"}</label>)}
          <textarea className={`${inputClass} min-h-24`} placeholder="Observaciones generales" value={data.observacionesGenerales} onChange={(e) => set("observacionesGenerales", e.target.value)} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-2">
          <h2 className="font-semibold text-slate-900">Técnico responsable</h2>
          <input className={inputClass} placeholder="Nombre" value={data.tecnicoNombre} onChange={(e) => set("tecnicoNombre", e.target.value)} />
          <input className={inputClass} placeholder="Correo" value={data.tecnicoCorreo} onChange={(e) => set("tecnicoCorreo", e.target.value)} />
          <input className={inputClass} placeholder="Firma / iniciales" value={data.tecnicoFirma} onChange={(e) => set("tecnicoFirma", e.target.value)} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-4"><h2 className="font-semibold text-slate-900 mb-2">Lubricantes</h2><ul className="list-disc pl-5 text-sm text-slate-700">{LUBRICANTES.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div className="bg-white rounded-xl border shadow-sm p-4"><h2 className="font-semibold text-slate-900 mb-2">Especificaciones de referencia</h2><table className="w-full text-sm"><tbody>{ESPECIFICACIONES.map(([label, value]) => <tr key={label}><td className="border p-2 font-medium">{label}</td><td className="border p-2">{value}</td></tr>)}</tbody></table></div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-slate-900">6. Registro y aprobación</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">Fecha<input className={inputClass} type="date" value={data.aprobacion.fecha} onChange={(e) => setNested("aprobacion", "fecha", e.target.value)} /></label>
          <label className="text-sm">Horómetro<input className={inputClass} value={data.aprobacion.horometro} onChange={(e) => setNested("aprobacion", "horometro", e.target.value)} /></label>
          <label className="text-sm">Próximo mantenimiento<input className={inputClass} value={data.aprobacion.proximoMantenimiento} onChange={(e) => setNested("aprobacion", "proximoMantenimiento", e.target.value)} /></label>
          <label className="text-sm">Firma<input className={inputClass} value={data.aprobacion.firma} onChange={(e) => setNested("aprobacion", "firma", e.target.value)} /></label>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-end gap-3 no-print">
        <button disabled={saving} onClick={() => save("borrador")} className="rounded border px-5 py-2 text-sm">Guardar borrador</button>
        <button disabled={saving} onClick={() => save("completado")} className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white">Guardar completado</button>
      </div>
    </div>
  );
}
