// ──────────────────────────────────────────────────────
//  InformeAgua.jsx
//  Formulario: Reporte de Avance EPMAPS – Cloro Gas
//  Filosofía: igual que HojaInspeccionHidro / HojaRecepcion
// ──────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import imageCompression from "browser-image-compression";
import { generarPDFInformeAgua } from "./generarPDFInformeAgua";
import {
  cloneInformeAguaSchema,
  nuevaActividad,
} from "./informeAguaSchema";

// ── utilidades ──────────────────────────────────────────
const mergeDeep = (base, value) => {
  if (Array.isArray(base)) return Array.isArray(value) ? value : [...base];
  if (!base || typeof base !== "object") return value ?? base;
  const source = value && typeof value === "object" ? value : {};
  const merged = { ...source };
  Object.keys(base).forEach((k) => {
    merged[k] = mergeDeep(base[k], source[k]);
  });
  return merged;
};

const updateAtPath = (setter, path, val) => {
  setter((prev) => {
    const next = { ...prev };
    let ref = next;
    for (let i = 0; i < path.length - 1; i++) {
      const k = path[i];
      ref[k] = Array.isArray(ref[k]) ? [...ref[k]] : { ...ref[k] };
      ref = ref[k];
    }
    ref[path[path.length - 1]] = val;
    return next;
  });
};

// ── sub-componentes de celda ────────────────────────────
const Field = ({ label, children, className = "" }) => (
  <div className={`ia-field ${className}`}>
    {label && <span className="ia-field-label">{label}</span>}
    {children}
  </div>
);

const Input = ({ value, onChange, type = "text", readOnly = false, placeholder = "" }) => (
  <input
    type={type}
    value={value || ""}
    readOnly={readOnly}
    placeholder={placeholder}
    onChange={(e) => onChange?.(e.target.value)}
    className="ia-input"
  />
);

const Textarea = ({ value, onChange, readOnly = false, placeholder = "", rows = 3 }) => (
  <textarea
    value={value || ""}
    readOnly={readOnly}
    rows={rows}
    placeholder={placeholder}
    onChange={(e) => onChange?.(e.target.value)}
    className="ia-textarea"
  />
);

const Toggle = ({ label, value, onChange, readOnly = false }) => (
  <button
    type="button"
    disabled={readOnly}
    onClick={() => onChange?.(!value)}
    className={`ia-toggle ${value ? "ia-toggle--on" : "ia-toggle--off"}`}
  >
    <span className="ia-toggle-dot" />
    <span className="ia-toggle-text">{label}</span>
  </button>
);

// ── Componente de foto individual ───────────────────────
const FotoCard = ({ foto, index, onRemove, onDescripcion, readOnly, registroId }) => (
  <div className="ia-foto-card">
    <img src={foto.url} alt={`Foto ${index + 1}`} className="ia-foto-img" />
    {!readOnly && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="ia-foto-remove"
      >
        ✕
      </button>
    )}
    <input
      type="text"
      value={foto.descripcion || ""}
      readOnly={readOnly}
      placeholder="Descripción..."
      onChange={(e) => onDescripcion(index, e.target.value)}
      className="ia-foto-desc"
    />
  </div>
);

// ── Uploader de fotos ───────────────────────────────────
const FotosUploader = ({ fotos = [], onChange, readOnly, registroId, actividadId }) => {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setSubiendo(true);

    try {
      const nuevas = [];
      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
        });
        const path = `registros/${registroId}/agua/${actividadId}/${Date.now()}_${file.name}`;
        const url = await uploadRegistroImage(compressed, path);
        if (url) nuevas.push({ url, descripcion: "" });
      }
      onChange([...fotos, ...nuevas]);
    } catch (err) {
      console.error("Error subiendo foto:", err);
    } finally {
      setSubiendo(false);
    }
  };

  const handleRemove = (idx) => {
    onChange(fotos.filter((_, i) => i !== idx));
  };

  const handleDescripcion = (idx, val) => {
    const updated = fotos.map((f, i) => (i === idx ? { ...f, descripcion: val } : f));
    onChange(updated);
  };

  return (
    <div className="ia-fotos">
      {!readOnly && (
        <div className="ia-fotos-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={subiendo}
            onClick={() => inputRef.current?.click()}
            className="ia-btn ia-btn--secondary"
          >
            {subiendo ? "Subiendo..." : "📷 Agregar fotos"}
          </button>
        </div>
      )}

      {fotos.length === 0 && (
        <div className="ia-fotos-empty">Sin fotografías</div>
      )}

      <div className="ia-fotos-grid">
        {fotos.map((f, i) => (
          <FotoCard
            key={i}
            foto={f}
            index={i}
            onRemove={handleRemove}
            onDescripcion={handleDescripcion}
            readOnly={readOnly}
            registroId={registroId}
          />
        ))}
      </div>
    </div>
  );
};

// ── Tarjeta de una actividad ────────────────────────────
const ActividadCard = ({
  act,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  readOnly,
  registroId,
}) => {
  const set = (path, val) =>
    onChange({ ...act, ...Object.fromEntries([[path, val]]) });

  const setFoto = (fotos) => onChange({ ...act, fotografias: fotos });

  return (
    <div className="ia-actividad-card">
      <div className="ia-actividad-header">
        <span className="ia-actividad-num">Actividad {index + 1}</span>
        <div className="ia-actividad-controls">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="ia-ctrl-btn"
                title="Subir"
              >▲</button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === total - 1}
                className="ia-ctrl-btn"
                title="Bajar"
              >▼</button>
              <button
                type="button"
                onClick={onRemove}
                className="ia-ctrl-btn ia-ctrl-btn--danger"
                title="Eliminar"
              >✕</button>
            </>
          )}
        </div>
      </div>

      {/* Datos de la OT */}
      <div className="ia-actividad-body">
        <div className="ia-row ia-row--4">
          <Field label="N° Orden de Trabajo">
            <Input
              value={act.ordenNumero}
              onChange={(v) => set("ordenNumero", v)}
              placeholder="UMED-702-2026"
              readOnly={readOnly}
            />
          </Field>
          <Field label="Lugar">
            <Input
              value={act.lugar}
              onChange={(v) => set("lugar", v)}
              placeholder="Tanque San Ignacio"
              readOnly={readOnly}
            />
          </Field>
          <Field label="Unidad Operativa">
            <Input
              value={act.unidadOperativa}
              onChange={(v) => set("unidadOperativa", v)}
              placeholder="NORTE CIUDAD"
              readOnly={readOnly}
            />
          </Field>
          <Field label="Fecha de ejecución">
            <Input
              type="date"
              value={act.fechaEjecucion}
              onChange={(v) => set("fechaEjecucion", v)}
              readOnly={readOnly}
            />
          </Field>
        </div>

        {/* Checkboxes de actividades estándar */}
        <div className="ia-section-title">Actividades realizadas</div>
        <div className="ia-toggles-row">
          {[
            ["comprobacionOperativa", "Comprobación operativa"],
            ["mantenimientoHidraulico", "Mant. hidráulico / vacío"],
            ["mantenimientoElectrico", "Mant. eléctrico"],
            ["limpiezaGeneral", "Limpieza general"],
            ["registroDocumentacion", "Registro y documentación"],
          ].map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              value={act[key]}
              onChange={(v) => set(key, v)}
              readOnly={readOnly}
            />
          ))}
        </div>

        <Field label="Observaciones adicionales / actividades especiales">
          <Textarea
            value={act.observacionesAdicionales}
            onChange={(v) => set("observacionesAdicionales", v)}
            placeholder="ej. Se cambió el sensor de la balanza..."
            readOnly={readOnly}
          />
        </Field>

        {/* Estado del sistema */}
        <div className="ia-row ia-row--2">
          <Field label="Estado del sistema">
            <div className="ia-estado-row">
              {["habilitado", "inhabilitado"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={readOnly}
                  onClick={() => set("sistemaHabilitado", opt === "habilitado")}
                  className={`ia-estado-btn ${
                    (act.sistemaHabilitado ? "habilitado" : "inhabilitado") === opt
                      ? "ia-estado-btn--active"
                      : ""
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </Field>
          {!act.sistemaHabilitado && (
            <Field label="Motivo inhabilitación">
              <Input
                value={act.observacionSistema}
                onChange={(v) => set("observacionSistema", v)}
                placeholder="ej. Daño en bomba sumergible"
                readOnly={readOnly}
              />
            </Field>
          )}
        </div>

        {/* Mediciones */}
        <div className="ia-section-title">Mediciones obtenidas</div>
        <div className="ia-row ia-row--3">
          <Field label="Peso cilindros Cl">
            <Input
              value={act.pesoCilindros}
              onChange={(v) => set("pesoCilindros", v)}
              placeholder="50 kg y 56 kg"
              readOnly={readOnly}
            />
          </Field>
          <Field label="Cloro residual (PPM)">
            <Input
              value={act.cloroResidual}
              onChange={(v) => set("cloroResidual", v)}
              placeholder="1.05"
              readOnly={readOnly}
            />
          </Field>
          <Field label="Dosis Cl">
            <Input
              value={act.dosisCl}
              onChange={(v) => set("dosisCl", v)}
              placeholder="3 PPD"
              readOnly={readOnly}
            />
          </Field>
        </div>

        {act.mantenimientoElectrico && (
          <div className="ia-row ia-row--2">
            <Field label="Voltaje (VAC)">
              <Input
                value={act.voltaje}
                onChange={(v) => set("voltaje", v)}
                placeholder="230"
                readOnly={readOnly}
              />
            </Field>
            <Field label="Corriente (AMP)">
              <Input
                value={act.corriente}
                onChange={(v) => set("corriente", v)}
                placeholder="4.94"
                readOnly={readOnly}
              />
            </Field>
          </div>
        )}

        {/* Fotografías */}
        <div className="ia-section-title">Fotografías</div>
        <FotosUploader
          fotos={act.fotografias}
          onChange={setFoto}
          readOnly={readOnly}
          registroId={registroId}
          actividadId={act.id}
        />
      </div>
    </div>
  );
};

// ── Estilos ─────────────────────────────────────────────
const Styles = () => (
  <style>{`
    .ia-wrap {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #f5f6f8;
      min-height: 100vh;
    }

    /* ── toolbar ── */
    .ia-toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #1a2942;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
    }
    .ia-toolbar-title {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: .3px;
    }
    .ia-toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }

    /* ── botones ── */
    .ia-btn {
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity .15s;
    }
    .ia-btn:disabled { opacity: .5; cursor: not-allowed; }
    .ia-btn--primary  { background: #2563eb; color: #fff; }
    .ia-btn--secondary{ background: #fff; color: #374151; border: 1px solid #d1d5db; }
    .ia-btn--danger   { background: #dc2626; color: #fff; }
    .ia-btn--ghost    { background: transparent; color: #9ca3af; border: 1px solid rgba(255,255,255,.3); }
    .ia-btn--yellow   { background: #f59e0b; color: #fff; }
    .ia-btn--green    { background: #16a34a; color: #fff; }

    /* ── contenedor principal ── */
    .ia-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 16px 48px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── sección ── */
    .ia-section {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
      overflow: hidden;
    }
    .ia-section-header {
      background: #1a2942;
      color: #fff;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .5px;
      text-transform: uppercase;
    }
    .ia-section-body { padding: 18px; }

    /* ── rows y fields ── */
    .ia-row {
      display: grid;
      gap: 12px;
      margin-bottom: 12px;
    }
    .ia-row--2 { grid-template-columns: 1fr 1fr; }
    .ia-row--3 { grid-template-columns: 1fr 1fr 1fr; }
    .ia-row--4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
    @media (max-width: 640px) {
      .ia-row--2, .ia-row--3, .ia-row--4 { grid-template-columns: 1fr; }
    }

    .ia-field { display: flex; flex-direction: column; gap: 4px; }
    .ia-field-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: #6b7280;
    }

    .ia-input, .ia-textarea {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 13px;
      color: #1a1a1a;
      background: #fafafa;
      transition: border-color .15s;
      width: 100%;
      box-sizing: border-box;
    }
    .ia-input:focus, .ia-textarea:focus {
      outline: none;
      border-color: #2563eb;
      background: #fff;
    }
    .ia-input:read-only, .ia-textarea:read-only {
      background: #f3f4f6;
      cursor: default;
    }
    .ia-textarea { resize: vertical; }

    /* ── section-title interno ── */
    .ia-section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin: 16px 0 10px;
    }

    /* ── toggles ── */
    .ia-toggles-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }
    .ia-toggle {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px 6px 8px;
      border-radius: 20px;
      border: 1px solid;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all .15s;
    }
    .ia-toggle--on  { background: #dcfce7; border-color: #16a34a; color: #15803d; }
    .ia-toggle--off { background: #f3f4f6; border-color: #d1d5db; color: #6b7280; }
    .ia-toggle--on:hover  { background: #bbf7d0; }
    .ia-toggle--off:hover { background: #e5e7eb; }
    .ia-toggle:disabled { opacity: .6; cursor: default; }
    .ia-toggle-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .ia-toggle--on  .ia-toggle-dot { background: #16a34a; }
    .ia-toggle--off .ia-toggle-dot { background: #9ca3af; }

    /* ── estado sistema ── */
    .ia-estado-row { display: flex; gap: 8px; }
    .ia-estado-btn {
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      background: #f3f4f6;
      color: #6b7280;
      transition: all .15s;
    }
    .ia-estado-btn--active {
      background: #2563eb;
      border-color: #2563eb;
      color: #fff;
    }
    .ia-estado-btn:disabled { opacity: .6; cursor: default; }

    /* ── actividad card ── */
    .ia-actividad-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .ia-actividad-header {
      background: #f0f4ff;
      border-bottom: 1px solid #dde3f0;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ia-actividad-num {
      font-size: 12px;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: .4px;
    }
    .ia-actividad-controls { display: flex; gap: 6px; }
    .ia-ctrl-btn {
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      background: #fff;
      font-size: 11px;
      cursor: pointer;
      color: #374151;
    }
    .ia-ctrl-btn:disabled { opacity: .3; cursor: default; }
    .ia-ctrl-btn--danger { border-color: #fca5a5; color: #dc2626; }
    .ia-actividad-body { padding: 16px; }

    /* ── fotos ── */
    .ia-fotos { }
    .ia-fotos-actions { margin-bottom: 10px; }
    .ia-fotos-empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 12px;
      border: 1px dashed #e5e7eb;
      border-radius: 8px;
      margin-top: 8px;
    }
    .ia-fotos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .ia-foto-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      background: #f9fafb;
    }
    .ia-foto-img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      display: block;
    }
    .ia-foto-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(220,38,38,.85);
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ia-foto-desc {
      width: 100%;
      border: 0;
      border-top: 1px solid #e5e7eb;
      padding: 5px 8px;
      font-size: 10px;
      color: #374151;
      background: #fff;
      box-sizing: border-box;
    }

    /* ── agregar actividad ── */
    .ia-add-btn-wrap { text-align: center; margin-top: 4px; }

    /* ── firma ── */
    .ia-firma-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ia-firma-canvas-wrap {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      background: #fafafa;
    }
    .ia-firma-img {
      width: 100%;
      height: 80px;
      object-fit: contain;
      display: block;
      background: #fafafa;
    }
    .ia-firma-limpiar {
      font-size: 11px;
      color: #6b7280;
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 3px 8px;
      cursor: pointer;
      align-self: flex-end;
    }

    /* ── estado completado ── */
    .ia-badge-completado {
      background: #dcfce7;
      color: #15803d;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 20px;
    }
  `}</style>
);

// ── Componente principal ────────────────────────────────
export default function InformeAgua() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const firmaTecnicoRef = useRef(null);
  const firmaSupervisorRef = useRef(null);

  const [registroId, setRegistroId] = useState(id || null);
  const [data, setData] = useState(cloneInformeAguaSchema());
  const [guardando, setGuardando] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // ── carga desde Supabase ──────────────────────────────
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: reg, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !reg) return;

      const loaded = mergeDeep(cloneInformeAguaSchema(), reg.data || {});
      setData(loaded);
      setRegistroId(reg.id);
      setIsLocked(reg.estado === "completado");

      setTimeout(() => {
        if (loaded.firmas?.tecnico)
          firmaTecnicoRef.current?.fromDataURL(loaded.firmas.tecnico);
        if (loaded.firmas?.supervisor)
          firmaSupervisorRef.current?.fromDataURL(loaded.firmas.supervisor);
      }, 250);
    };
    load();
  }, [id]);

  // ── helpers ───────────────────────────────────────────
  const setField = (key, val) => setData((prev) => ({ ...prev, [key]: val }));

  const setActividad = (idx, act) => {
    setData((prev) => {
      const acts = [...prev.actividades];
      acts[idx] = act;
      return { ...prev, actividades: acts };
    });
  };

  const addActividad = () => {
    setData((prev) => ({
      ...prev,
      actividades: [...prev.actividades, nuevaActividad()],
    }));
  };

  const removeActividad = (idx) => {
    if (!confirm("¿Eliminar esta actividad?")) return;
    setData((prev) => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== idx),
    }));
  };

  const moveActividad = (idx, dir) => {
    setData((prev) => {
      const acts = [...prev.actividades];
      const target = idx + dir;
      if (target < 0 || target >= acts.length) return prev;
      [acts[idx], acts[target]] = [acts[target], acts[idx]];
      return { ...prev, actividades: acts };
    });
  };

  const buildPayload = () => {
    const tecnico =
      firmaTecnicoRef.current && !firmaTecnicoRef.current.isEmpty()
        ? firmaTecnicoRef.current.toDataURL("image/png")
        : data.firmas.tecnico || "";
    const supervisor =
      firmaSupervisorRef.current && !firmaSupervisorRef.current.isEmpty()
        ? firmaSupervisorRef.current.toDataURL("image/png")
        : data.firmas.supervisor || "";

    return { ...data, firmas: { tecnico, supervisor } };
  };

  // ── guardar ───────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const payload = buildPayload();
      const completado = Boolean(payload.firmas.tecnico && payload.firmas.supervisor);

      const result = await saveOrUpdateReport({
        id: registroId,
        area: "agua",
        tipo: "informe",
        subtipo: "avance_epmaps",
        data: payload,
        estado: completado ? "completado" : "borrador",
      });

      if (result?.id) setRegistroId(result.id);
     alert("Guardado correctamente");
navigate("/agua/recorrido/informe");
    } catch (err) {
      console.error("Error guardando informe:", err);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const handlePDF = async () => {
    try {
      await generarPDFInformeAgua(buildPayload());
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el PDF.");
    }
  };

  const handleDesbloquear = () => {
    if (confirm("¿Desbloquear este informe para editarlo?")) {
      setIsLocked(false);
      setTimeout(() => {
        if (data.firmas?.tecnico)
          firmaTecnicoRef.current?.fromDataURL(data.firmas.tecnico);
        if (data.firmas?.supervisor)
          firmaSupervisorRef.current?.fromDataURL(data.firmas.supervisor);
      }, 150);
    }
  };

  const limpiarFirma = (ref, key) => {
    ref.current?.clear();
    updateAtPath(setData, ["firmas", key], "");
  };

  const tempId = registroId || `temp-informe-agua-${Date.now()}`;

  // ── render ────────────────────────────────────────────
  return (
    <div className="ia-wrap">
      <Styles />

      {/* Toolbar */}
      <div className="ia-toolbar">
        <span className="ia-toolbar-title">
          Informe de Avance – Cloro Gas EPMAPS
        </span>
        <div className="ia-toolbar-actions">
          <button
            type="button"
            onClick={() => navigate("/agua/recorrido/informe")}
            className="ia-btn ia-btn--ghost"
          >
            ← Volver
          </button>

          <button
  type="button"
  onClick={handlePDF}
  className="ia-btn ia-btn--green"
>
  Ver / Descargar PDF
</button>

          {isLocked ? (
            <>
              <span className="ia-badge-completado">✓ Completado</span>
              <button
                type="button"
                onClick={handleDesbloquear}
                className="ia-btn ia-btn--yellow"
              >
                ✏️ Editar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="ia-btn ia-btn--green"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          )}
        </div>
      </div>

      <div className="ia-container">

        {/* ── 1. Encabezado del informe ── */}
        <div className="ia-section">
          <div className="ia-section-header">Encabezado del Informe</div>
          <div className="ia-section-body">
            <div className="ia-row ia-row--2">
              <Field label="Período / Semana">
                <Input
                  value={data.periodo}
                  onChange={(v) => setField("periodo", v)}
                  placeholder="Mayo 2026 - 2 Semana (del 11 al 17 de mayo)"
                  readOnly={isLocked}
                />
              </Field>
              <Field label="Contrato">
                <Input
                  value={data.contrato}
                  onChange={(v) => setField("contrato", v)}
                  readOnly={isLocked}
                />
              </Field>
            </div>
            <div className="ia-row ia-row--3">
              <Field label="Pedido N°">
                <Input
                  value={data.pedido}
                  onChange={(v) => setField("pedido", v)}
                  readOnly={isLocked}
                />
              </Field>
              <Field label="Supervisor">
                <Input
                  value={data.supervisor}
                  onChange={(v) => setField("supervisor", v)}
                  readOnly={isLocked}
                />
              </Field>
              <Field label="Administrador">
                <Input
                  value={data.administrador}
                  onChange={(v) => setField("administrador", v)}
                  readOnly={isLocked}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── 2. Actividades ── */}
        <div className="ia-section">
          <div className="ia-section-header">
            Actividades — Órdenes de Trabajo ({data.actividades.length})
          </div>
          <div className="ia-section-body">
            {data.actividades.map((act, idx) => (
              <ActividadCard
                key={act.id}
                act={act}
                index={idx}
                total={data.actividades.length}
                onChange={(updated) => setActividad(idx, updated)}
                onRemove={() => removeActividad(idx)}
                onMoveUp={() => moveActividad(idx, -1)}
                onMoveDown={() => moveActividad(idx, 1)}
                readOnly={isLocked}
                registroId={tempId}
              />
            ))}

            {!isLocked && (
              <div className="ia-add-btn-wrap">
                <button
                  type="button"
                  onClick={addActividad}
                  className="ia-btn ia-btn--secondary"
                >
                  + Agregar actividad
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Nota final ── */}
        <div className="ia-section">
          <div className="ia-section-header">Nota Final</div>
          <div className="ia-section-body">
            <Textarea
              value={data.notaFinal}
              onChange={(v) => setField("notaFinal", v)}
              placeholder="Observaciones generales del período..."
              readOnly={isLocked}
              rows={4}
            />
          </div>
        </div>

        {/* ── 4. Firmas ── */}
        <div className="ia-section">
          <div className="ia-section-header">Firmas</div>
          <div className="ia-section-body">
            <div className="ia-row ia-row--2">
              {/* Firma técnico */}
              <Field label="Técnico de campo">
                <div className="ia-firma-wrap">
                  {isLocked && data.firmas.tecnico ? (
                    <img
                      src={data.firmas.tecnico}
                      alt="Firma técnico"
                      className="ia-firma-img"
                    />
                  ) : (
                    <div className="ia-firma-canvas-wrap">
                      <SignatureCanvas
                        ref={firmaTecnicoRef}
                        penColor="#1a2942"
                        canvasProps={{ width: 380, height: 80, className: "ia-firma-img" }}
                      />
                    </div>
                  )}
                  {!isLocked && (
                    <button
                      type="button"
                      className="ia-firma-limpiar"
                      onClick={() => limpiarFirma(firmaTecnicoRef, "tecnico")}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </Field>

              {/* Firma supervisor */}
              <Field label="Supervisor de contrato">
                <div className="ia-firma-wrap">
                  {isLocked && data.firmas.supervisor ? (
                    <img
                      src={data.firmas.supervisor}
                      alt="Firma supervisor"
                      className="ia-firma-img"
                    />
                  ) : (
                    <div className="ia-firma-canvas-wrap">
                      <SignatureCanvas
                        ref={firmaSupervisorRef}
                        penColor="#1a2942"
                        canvasProps={{ width: 380, height: 80, className: "ia-firma-img" }}
                      />
                    </div>
                  )}
                  {!isLocked && (
                    <button
                      type="button"
                      className="ia-firma-limpiar"
                      onClick={() => limpiarFirma(firmaSupervisorRef, "supervisor")}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
