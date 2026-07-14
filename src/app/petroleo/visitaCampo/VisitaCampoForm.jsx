import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { uploadRegistroImage } from "@/utils/storage";
import { createEmptyVisitaCampoData } from "./visitaCampoData";
import { listToText, parseTableText, textToList } from "./tableUtils";

const inputClass = "w-full rounded border border-gray-300 px-3 py-2 text-sm";
const labelClass = "space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500";
const equipmentColumns = ["ESTACIÓN", "GRUPO DE BOMBA", "MODELO DE BOMBA", "SERIE", "TOTAL"];
const repuestoColumns = ["Ítem", "Descripción", "Ref.", "N/P", "Código EPP", "Cant."];
const intervaloColumns = ["Parte", "API 610", "ANSI B73.1"];

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

const getStationRowSpan = (rows, rowIndex) => {
  const station = rows[rowIndex]?.[0]?.trim();
  if (!station) {
    for (let i = rowIndex - 1; i >= 0; i -= 1) {
      if (rows[i]?.[0]?.trim()) return 0;
    }
    return 1;
  }
  if (rowIndex > 0) {
    let previousStation = "";
    for (let i = rowIndex - 1; i >= 0; i -= 1) {
      previousStation = rows[i]?.[0]?.trim();
      if (previousStation) break;
    }
    if (previousStation === station) return 0;
  }

  let span = 1;
  for (let i = rowIndex + 1; i < rows.length; i += 1) {
    const nextStation = rows[i]?.[0]?.trim();
    if (nextStation && nextStation !== station) break;
    span += 1;
  }

  return span;
};

const normalizeEquipmentRow = (row = []) => equipmentColumns.map((_, index) => row[index] || "");

const parseEquipmentRows = (tableText) => {
  const rows = parseTableText(tableText);
  const body = rows[0]?.[0]?.toUpperCase() === equipmentColumns[0] ? rows.slice(1) : rows;
  const normalizedRows = body.map(normalizeEquipmentRow).filter((row) => row.some((cell) => cell.trim()));

  return normalizedRows.length > 0 ? normalizedRows : [normalizeEquipmentRow()];
};

const equipmentRowsToText = (rows) => [equipmentColumns, ...rows.map(normalizeEquipmentRow)].map((row) => row.join("\t")).join("\n");

const EquipmentEditableTable = ({ tableText, onChange }) => {
  const rows = parseEquipmentRows(tableText);

  const updateCell = (rowIndex, cellIndex, value) => {
    const nextRows = rows.map((row, index) => (index === rowIndex ? row.map((cell, colIndex) => (colIndex === cellIndex ? value : cell)) : row));
    onChange(equipmentRowsToText(nextRows));
  };

  const addRow = () => {
    const lastStation = [...rows].reverse().find((row) => row[0]?.trim())?.[0] || "Nueva estación";
    onChange(equipmentRowsToText([...rows, [lastStation, "", "", "", ""]]));
  };

  const removeRow = (rowIndex) => {
    const nextRows = rows.filter((_, index) => index !== rowIndex);
    onChange(equipmentRowsToText(nextRows.length > 0 ? nextRows : [normalizeEquipmentRow()]));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border border-slate-300">
        <table className="w-full min-w-[920px] border-collapse bg-white text-xs text-slate-900">
          <thead className="bg-slate-100 text-center font-bold uppercase">
            <tr>
              {equipmentColumns.map((column) => (
                <th key={column} className="border border-slate-300 px-2 py-2">
                  {column}
                </th>
              ))}
              <th className="w-20 border border-slate-300 px-2 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-top">
                <td className="w-[16%] border border-slate-300 p-1">
                  <AutoTextarea rows={2} className="w-full resize-none rounded border border-slate-200 px-2 py-1 text-center font-semibold uppercase" value={row[0]} onChange={(e) => updateCell(rowIndex, 0, e.target.value)} />
                </td>
                <td className="w-[13%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[1]} onChange={(e) => updateCell(rowIndex, 1, e.target.value)} />
                </td>
                <td className="w-[20%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[2]} onChange={(e) => updateCell(rowIndex, 2, e.target.value)} />
                </td>
                <td className="w-[39%] border border-slate-300 p-1">
                  <AutoTextarea rows={2} className="w-full resize-none rounded border border-slate-200 px-2 py-1 text-center" value={row[3]} onChange={(e) => updateCell(rowIndex, 3, e.target.value)} />
                </td>
                <td className="w-[8%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[4]} onChange={(e) => updateCell(rowIndex, 4, e.target.value)} />
                </td>
                <td className="border border-slate-300 p-1 text-center">
                  <button type="button" onClick={() => removeRow(rowIndex)} className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="rounded bg-slate-700 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800">
        Agregar fila
      </button>
    </div>
  );
};

const normalizeRepuestoRow = (row = []) => repuestoColumns.map((_, index) => row[index] || "");

const parseRepuestoRows = (tableText) => {
  const rows = parseTableText(tableText);
  const body = rows[0]?.[0]?.toLowerCase() === repuestoColumns[0].toLowerCase() ? rows.slice(1) : rows;
  const normalizedRows = body.map(normalizeRepuestoRow).filter((row) => row.some((cell) => cell.trim()));

  return normalizedRows.length > 0 ? normalizedRows : [normalizeRepuestoRow()];
};

const repuestoRowsToText = (rows) => [repuestoColumns, ...rows.map(normalizeRepuestoRow)].map((row) => row.join("\t")).join("\n");

const RepuestoEditableTable = ({ tableText, onChange }) => {
  const rows = parseRepuestoRows(tableText);

  const updateCell = (rowIndex, cellIndex, value) => {
    const nextRows = rows.map((row, index) => (index === rowIndex ? row.map((cell, colIndex) => (colIndex === cellIndex ? value : cell)) : row));
    onChange(repuestoRowsToText(nextRows));
  };

  const addRow = () => {
    onChange(repuestoRowsToText([...rows, normalizeRepuestoRow()]));
  };

  const removeRow = (rowIndex) => {
    const nextRows = rows.filter((_, index) => index !== rowIndex);
    onChange(repuestoRowsToText(nextRows.length > 0 ? nextRows : [normalizeRepuestoRow()]));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border border-slate-300">
        <table className="w-full min-w-[980px] border-collapse bg-white text-xs text-slate-900">
          <thead className="bg-slate-100 text-center font-bold uppercase">
            <tr>
              {repuestoColumns.map((column) => (
                <th key={column} className="border border-slate-300 px-2 py-2">
                  {column}
                </th>
              ))}
              <th className="w-20 border border-slate-300 px-2 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-top">
                <td className="w-[8%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[0]} onChange={(e) => updateCell(rowIndex, 0, e.target.value)} />
                </td>
                <td className="w-[31%] border border-slate-300 p-1">
                  <AutoTextarea rows={2} className="w-full resize-none rounded border border-slate-200 px-2 py-1 font-semibold" value={row[1]} onChange={(e) => updateCell(rowIndex, 1, e.target.value)} />
                </td>
                <td className="w-[11%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[2]} onChange={(e) => updateCell(rowIndex, 2, e.target.value)} />
                </td>
                <td className="w-[19%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[3]} onChange={(e) => updateCell(rowIndex, 3, e.target.value)} />
                </td>
                <td className="w-[19%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[4]} onChange={(e) => updateCell(rowIndex, 4, e.target.value)} />
                </td>
                <td className="w-[8%] border border-slate-300 p-1">
                  <input className="w-full rounded border border-slate-200 px-2 py-1 text-center" value={row[5]} onChange={(e) => updateCell(rowIndex, 5, e.target.value)} />
                </td>
                <td className="border border-slate-300 p-1 text-center">
                  <button type="button" onClick={() => removeRow(rowIndex)} className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="rounded bg-slate-700 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800">
        Agregar fila
      </button>
    </div>
  );
};

const normalizeIntervaloRow = (row = []) => intervaloColumns.map((_, index) => String(row[index] || "").replace(/\r?\n/g, " / "));

const parseIntervaloRows = (tableText) => {
  const rows = parseTableText(tableText);
  const body = rows[0]?.[0]?.toLowerCase() === intervaloColumns[0].toLowerCase() ? rows.slice(1) : rows;
  const normalizedRows = body.map(normalizeIntervaloRow).filter((row) => row.some((cell) => cell.trim()));

  return normalizedRows.length > 0 ? normalizedRows : [normalizeIntervaloRow()];
};

const intervaloRowsToText = (rows) => [intervaloColumns, ...rows.map(normalizeIntervaloRow)].map((row) => row.join("\t")).join("\n");

const IntervalosEditableTable = ({ tableText, onChange }) => {
  const rows = parseIntervaloRows(tableText);

  const updateCell = (rowIndex, cellIndex, value) => {
    const nextRows = rows.map((row, index) => (index === rowIndex ? row.map((cell, colIndex) => (colIndex === cellIndex ? value : cell)) : row));
    onChange(intervaloRowsToText(nextRows));
  };

  const addRow = () => {
    onChange(intervaloRowsToText([...rows, normalizeIntervaloRow()]));
  };

  const removeRow = (rowIndex) => {
    const nextRows = rows.filter((_, index) => index !== rowIndex);
    onChange(intervaloRowsToText(nextRows.length > 0 ? nextRows : [normalizeIntervaloRow()]));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border border-slate-300">
        <table className="w-full min-w-[860px] border-collapse bg-white text-xs text-slate-900">
          <thead className="bg-slate-100 text-center font-bold uppercase">
            <tr>
              {intervaloColumns.map((column) => (
                <th key={column} className="border border-slate-300 px-2 py-2">
                  {column}
                </th>
              ))}
              <th className="w-20 border border-slate-300 px-2 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-top">
                <td className="w-[22%] border border-slate-300 p-1">
                  <AutoTextarea rows={2} className="w-full resize-none rounded border border-slate-200 px-2 py-1 text-center font-semibold" value={row[0]} onChange={(e) => updateCell(rowIndex, 0, e.target.value)} />
                </td>
                <td className="w-[36%] border border-slate-300 p-1">
                  <AutoTextarea rows={3} className="w-full resize-none rounded border border-slate-200 px-2 py-1 text-center" value={row[1]} onChange={(e) => updateCell(rowIndex, 1, e.target.value)} />
                </td>
                <td className="w-[36%] border border-slate-300 p-1">
                  <AutoTextarea rows={3} className="w-full resize-none rounded border border-slate-200 px-2 py-1 text-center" value={row[2]} onChange={(e) => updateCell(rowIndex, 2, e.target.value)} />
                </td>
                <td className="border border-slate-300 p-1 text-center">
                  <button type="button" onClick={() => removeRow(rowIndex)} className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="rounded bg-slate-700 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800">
        Agregar fila
      </button>
    </div>
  );
};

const EquipmentSummaryPreview = ({ intro, tableText }) => {
  const rows = parseTableText(tableText);
  const header = rows[0] || [];
  const body = rows.slice(1);

  return (
    <div className="overflow-x-auto rounded border border-slate-900 bg-white text-[11px] text-slate-950">
      <table className="w-full min-w-[780px] border-collapse">
        <tbody>
          <tr>
            <th colSpan={5} className="border border-slate-900 bg-slate-100 px-2 py-1 text-center font-bold">
              Tabla resumen de equipos centrífugos
            </th>
          </tr>
          <tr>
            <td colSpan={5} className="border border-slate-900 px-3 py-2 text-justify font-semibold">
              {intro}
            </td>
          </tr>
          {header.length > 0 && (
            <tr className="bg-slate-100 text-center font-bold uppercase">
              {header.map((cell, index) => (
                <th key={index} className="border border-slate-900 px-2 py-1">
                  {cell}
                </th>
              ))}
            </tr>
          )}
          {body.map((row, rowIndex) => {
            const stationSpan = getStationRowSpan(body, rowIndex);

            return (
              <tr key={`${rowIndex}-${row.join("-")}`} className="align-middle">
                {stationSpan > 0 && (
                  <td rowSpan={stationSpan} className="border border-slate-900 px-2 py-1 text-center font-bold uppercase">
                    {row[0]}
                  </td>
                )}
                {row.slice(1).map((cell, cellIndex) => (
                  <td key={cellIndex} className={`border border-slate-900 px-2 py-1 ${cellIndex === 2 ? "text-left" : "text-center"}`}>
                    {cell || " "}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const PartsIntroBox = ({ value, onChange }) => (
  <section className="overflow-hidden rounded border border-slate-900 bg-white text-slate-950">
    <h2 className="border-b border-slate-900 px-3 py-1 text-center text-xs font-bold">
      Lista de partes recomendada por el fabricante- FLOWSERVE
    </h2>
    <AutoTextarea
      rows={4}
      className="w-full resize-none border-0 px-8 py-3 text-sm font-semibold leading-relaxed text-slate-900 outline-none"
      value={value}
      onChange={onChange}
    />
  </section>
);

const IntervalosBox = ({ intro, tableText, note, onIntroChange, onTableChange, onNoteChange }) => (
  <section className="space-y-3 rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
    <h2 className="rounded border border-slate-900 bg-slate-100 px-3 py-1 text-center text-sm font-bold text-slate-950">
      Tiempo mínimo para cambio de partes según normativa API 610 y ANSI B73.1
    </h2>
    <label className={labelClass}>
      Criterio de confiabilidad operacional
      <AutoTextarea rows={4} className={inputClass} value={intro} onChange={onIntroChange} />
    </label>
    <div className={labelClass}>
      <span>Tabla de intervalos</span>
      <IntervalosEditableTable tableText={tableText} onChange={onTableChange} />
    </div>
    <label className={labelClass}>
      Nota y criterios complementarios
      <AutoTextarea rows={8} className={inputClass} value={note} onChange={onNoteChange} />
    </label>
  </section>
);

const SignatureField = ({ label, value, onChange }) => (
  <div className="space-y-2 rounded border border-slate-300 bg-white p-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
    <div className="flex h-24 items-center justify-center rounded border border-slate-400 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
      Firma
    </div>
    <AutoTextarea rows={4} className={inputClass} value={value} onChange={onChange} />
  </div>
);

export default function VisitaCampoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isSuperAdmin } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const isEditing = !!id;
  const [data, setData] = useState(createEmptyVisitaCampoData());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingRepuesto, setUploadingRepuesto] = useState(null);

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
      repuestos: [...prev.repuestos, { titulo: "Nuevo grupo", caption: "", rows: repuestoRowsToText([normalizeRepuestoRow()]), esquema: "" }],
    }));
  };

  const removeRepuesto = (index) => {
    setData((prev) => ({ ...prev, repuestos: prev.repuestos.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const uploadRepuestoImage = async (index, files) => {
    const file = Array.from(files || []).find((item) => item.type?.startsWith("image/") || /\.(heic|heif)$/i.test(item.name || ""));
    if (!file) return;

    setUploadingRepuesto(index);
    try {
      const isHeic = /\.(heic|heif)$/i.test(file.name || "") || /heic|heif/i.test(file.type || "");
      const fileToUpload = isHeic
        ? file
        : await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            initialQuality: 0.78,
          });
      const url = await uploadRegistroImage(fileToUpload, id || "visita-campo-temp", `repuesto-esquema-${index + 1}`);
      if (url) updateRepuesto(index, "esquema", url);
    } finally {
      setUploadingRepuesto(null);
    }
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

      <section className="space-y-3 rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <h2 className="text-center text-sm font-semibold text-slate-900">Tabla resumen de equipos centrífugos</h2>
        <label className={labelClass}>Texto introductorio<AutoTextarea rows={3} className={inputClass} value={data.equiposIntro} onChange={(e) => set("equiposIntro", e.target.value)} /></label>
        <div className={labelClass}>
          <span>Datos de la tabla</span>
          <EquipmentEditableTable tableText={data.equiposTabla} onChange={(value) => set("equiposTabla", value)} />
        </div>
        <p className="text-xs text-gray-500">Para repetir la misma estación en varias filas, puedes escribirla solo en la primera fila del grupo.</p>
        <EquipmentSummaryPreview intro={data.equiposIntro} tableText={data.equiposTabla} />
      </section>

      <PartsIntroBox value={data.partesIntro} onChange={(e) => set("partesIntro", e.target.value)} />

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
            <RepuestoEditableTable tableText={grupo.rows} onChange={(value) => updateRepuesto(index, "rows", value)} />
            <div className="rounded border border-slate-300 bg-white p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Esquema / imagen de referencia</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id={`repuesto-esquema-galeria-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    uploadRepuestoImage(index, event.target.files);
                    event.target.value = "";
                  }}
                />
                <input
                  id={`repuesto-esquema-camara-${index}`}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) => {
                    uploadRepuestoImage(index, event.target.files);
                    event.target.value = "";
                  }}
                />
                <label htmlFor={`repuesto-esquema-camara-${index}`} className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                  Cámara
                </label>
                <label htmlFor={`repuesto-esquema-galeria-${index}`} className="cursor-pointer rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  Imagen
                </label>
                {uploadingRepuesto === index && <span className="text-xs text-slate-500">Subiendo imagen...</span>}
                {grupo.esquema && (
                  <button type="button" onClick={() => updateRepuesto(index, "esquema", "")} className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">
                    Quitar imagen
                  </button>
                )}
              </div>
              {grupo.esquema && <img src={grupo.esquema} alt={`Esquema ${grupo.titulo}`} className="mt-3 max-h-72 w-full rounded border object-contain" />}
            </div>
          </div>
        ))}
      </section>

      <IntervalosBox
        intro={data.intervalosIntro}
        tableText={data.intervalosTabla}
        note={data.notaIntervalos}
        onIntroChange={(e) => set("intervalosIntro", e.target.value)}
        onTableChange={(value) => set("intervalosTabla", value)}
        onNoteChange={(e) => set("notaIntervalos", e.target.value)}
      />
      <label className={labelClass}>Conclusiones<AutoTextarea rows={6} className={inputClass} value={listToText(data.conclusiones)} onChange={(e) => set("conclusiones", textToList(e.target.value))} /></label>
      <label className={labelClass}>Recomendaciones<AutoTextarea rows={6} className={inputClass} value={listToText(data.recomendaciones)} onChange={(e) => set("recomendaciones", textToList(e.target.value))} /></label>

      <section className="grid gap-3 md:grid-cols-3">
        <SignatureField label="Realizado por" value={data.realizadoPor} onChange={(e) => set("realizadoPor", e.target.value)} />
        <SignatureField label="Revisado por" value={data.revisadoPor} onChange={(e) => set("revisadoPor", e.target.value)} />
        <SignatureField label="Recibido por" value={data.recibidoPor} onChange={(e) => set("recibidoPor", e.target.value)} />
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
