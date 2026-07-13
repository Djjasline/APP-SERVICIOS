import React, { useEffect, useRef, useState } from "react";
import { useAutoguardado, limpiarBorrador } from "@/hooks/useAutoguardado";
import BannerAutoguardado from "@/components/BannerAutoguardado";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { generarPDFRecepcion } from "./generarPDFRecepcion";
import { useAuth } from "@/context/AuthContext";
import {
  checklistVehiculo,
  cloneRecepcionSchema,
  documentosVehiculo,
} from "./recepcionSchema";

const COL_WIDTHS = [172, 126, 25, 27, 160, 41, 39, 190, 25, 23, 41, 98, 31];

const mergeDeep = (base, value) => {
  if (Array.isArray(base)) return Array.isArray(value) ? value : [...base];
  if (!base || typeof base !== "object") return value ?? base;

  const source = value && typeof value === "object" ? value : {};
  const merged = { ...source };

  Object.keys(base).forEach((key) => {
    merged[key] = mergeDeep(base[key], source[key]);
  });

  return merged;
};

const clampFuel = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  return Math.min(1, Math.max(0, number));
};

const updateAtPath = (setter, path, value) => {
  setter((prev) => {
    const next = { ...prev };
    let ref = next;

    for (let i = 0; i < path.length - 1; i += 1) {
      const key = path[i];
      ref[key] = Array.isArray(ref[key]) ? [...ref[key]] : { ...ref[key] };
      ref = ref[key];
    }

    ref[path[path.length - 1]] = value;
    return next;
  });
};

const TextCell = ({ value, onChange, type = "text", readOnly = false, placeholder = "Ingrese dato" }) => (
  <input
    type={type}
    value={value || ""}
    readOnly={readOnly}
    placeholder={type === "date" ? undefined : placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="sheet-input"
  />
);

const TextAreaCell = ({ value, onChange, readOnly = false, placeholder = "Escriba observaciones" }) => (
  <textarea
    value={value || ""}
    readOnly={readOnly}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="sheet-textarea"
  />
);

const ChoiceCell = ({ value, option, onChange, readOnly = false }) => (
  <button
    type="button"
    disabled={readOnly}
    onClick={() => onChange(value === option ? "" : option)}
    className="choice-cell"
  >
    {value === option ? "X" : ""}
  </button>
);

const BooleanChoiceCell = ({ value, onChange, readOnly = false }) => (
  <button
    type="button"
    disabled={readOnly}
    onClick={() => onChange(!value)}
    className="choice-cell"
  >
    {value ? "X" : ""}
  </button>
);

const FuelGauge = ({ value, onChange, readOnly = false }) => {
  const level = clampFuel(value);
  const angle = -180 + level * 180;

  return (
    <div className="fuel-box">
      <svg viewBox="0 0 120 72" className="fuel-svg" aria-hidden="true">
        <path d="M20 58 A40 40 0 0 1 100 58" fill="none" stroke="#111" strokeWidth="2" />
        <path d="M23 58 A37 37 0 0 1 97 58" fill="none" stroke="#d9d9d9" strokeWidth="6" />
        <path d="M23 58 A37 37 0 0 1 38 29" fill="none" stroke="#d21f2b" strokeWidth="6" />
        <text x="15" y="62" fontSize="11" fontFamily="Calibri">E</text>
        <text x="101" y="62" fontSize="11" fontFamily="Calibri">F</text>
        <g transform={`translate(60 58) rotate(${angle})`}>
          <line x1="0" y1="0" x2="35" y2="0" stroke="#111" strokeWidth="2" />
        </g>
        <circle cx="60" cy="58" r="4" fill="#111" />
        <path d="M53 70 h14 l-2 -9 h-10 z" fill="none" stroke="#111" strokeWidth="1.5" />
      </svg>

      {!readOnly && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={level}
          onChange={(e) => onChange(Number(e.target.value))}
          className="fuel-range no-print"
        />
      )}
    </div>
  );
};

const DamageArea = ({
  imagenes = [],
  onChange,
  readOnly = false,
  registroId = "temp-recepcion",
}) => {

  const compressImage = async (file) =>
  imageCompression(file, {
    maxSizeMB: 0.18,
    useWebWorker: true,
    alwaysKeepResolution: true,
    initialQuality: 0.7,
    maxWidthOrHeight: undefined,
    fileType: file.type || "image/jpeg",
  });
  
const addImages = async (files) => {
  if (readOnly) return;

  const arr = Array.from(files || []).filter((file) =>
    file.type.startsWith("image/")
  );

  if (!arr.length) return;

  const disponibles = Math.max(0, 6 - imagenes.length);

  if (disponibles <= 0) {
    alert("Máximo 6 fotografías");
    return;
  }

  const nuevas = [];

  for (const file of arr.slice(0, disponibles)) {
    const compressedFile = await compressImage(file);

const url = await uploadRegistroImage(
  compressedFile,
  registroId || "temp-recepcion",
  "danos-carroceria"
);
    if (!url) continue;

    nuevas.push({
      id: `danio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url,
      puntos: [],
    });
  }

  if (nuevas.length) {
    onChange([...imagenes, ...nuevas]);
  }
};
  const removeImage = (imgId) => {
    if (readOnly) return;
    onChange(imagenes.filter((img) => img.id !== imgId));
  };

  const addPoint = (event, imgId) => {
    if (readOnly) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Number(((event.clientX - rect.left) / rect.width).toFixed(4));
    const y = Number(((event.clientY - rect.top) / rect.height).toFixed(4));

    onChange(
      imagenes.map((img) =>
        img.id === imgId
          ? {
              ...img,
              puntos: [
                ...(img.puntos || []),
                {
                  id: `p-${Date.now()}`,
                  x,
                  y,
                  observacion: "",
                },
              ],
            }
          : img
      )
    );
  };

  const removePoint = (imgId, pointId) => {
    if (readOnly) return;

    onChange(
      imagenes.map((img) =>
        img.id === imgId
          ? {
              ...img,
              puntos: (img.puntos || []).filter((p) => p.id !== pointId),
            }
          : img
      )
    );
  };

  const updatePointObs = (imgId, pointId, value) => {
    onChange(
      imagenes.map((img) =>
        img.id === imgId
          ? {
              ...img,
              puntos: (img.puntos || []).map((p) =>
                p.id === pointId ? { ...p, observacion: value } : p
              ),
            }
          : img
      )
    );
  };

  return (
    <div className="damage-area-photo">
      {!readOnly && (
        <div className="no-print damage-upload-row">
          <label className="damage-upload-btn">
            📁 Galería
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                addImages(e.target.files);
                e.target.value = null;
              }}
            />
          </label>

          <label className="damage-upload-btn damage-upload-camera">
            📷 Cámara
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={(e) => {
                addImages(e.target.files);
                e.target.value = null;
              }}
            />
          </label>
        </div>
      )}

      {!readOnly && (
        <div className="no-print damage-help">
          Sube hasta 6 fotos. Haz clic sobre una imagen para marcar un daño y escribe la observación del punto marcado.
        </div>
      )}

      {imagenes.length === 0 ? (
        <div className="damage-empty">
          <strong>Sin fotografías de daños registradas</strong>
          <span>Agrega evidencia de carrocería, accesorios o novedades visibles.</span>
        </div>
      ) : (
        <div className="damage-photo-list">
          {imagenes.map((img, index) => (
            <div key={img.id || index} className="damage-photo-card">
              <div className="damage-photo-title">
                <span>Fotografía {index + 1}</span>

                {!readOnly && (
                  <button
                    type="button"
                    className="damage-remove-btn no-print"
                    onClick={() => removeImage(img.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div
                className="damage-photo-wrap"
                onClick={(e) => addPoint(e, img.id)}
              >
                <img
                  src={img.url}
                  alt={`Daño ${index + 1}`}
                  className="damage-photo-img"
                />

                {(img.puntos || []).map((p, pi) => (
                  <button
                    key={p.id || pi}
                    type="button"
                    className="damage-dot"
                    style={{
                      left: `${p.x * 100}%`,
                      top: `${p.y * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removePoint(img.id, p.id);
                    }}
                  >
                    {pi + 1}
                  </button>
                ))}
              </div>

              {(img.puntos || []).map((p, pi) => (
                <div key={p.id || pi} className="damage-point-row">
                  <span>{pi + 1})</span>
                  <input
                    value={p.observacion || ""}
                    readOnly={readOnly}
                    onChange={(e) =>
                      updatePointObs(img.id, p.id, e.target.value)
                    }
                    placeholder={`Observación punto ${pi + 1}`}
                    className="damage-point-input"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SignatureBox = ({ dataUrl, canvasRef, readOnly = false }) => {
  if (readOnly) {
    return dataUrl ? (
      <img src={dataUrl} alt="Firma" className="signature-img" />
    ) : null;
  }

  return (
    <SignatureCanvas
      ref={canvasRef}
      canvasProps={{
        width: 280,
        height: 88,
        className: "signature-canvas",
      }}
    />
  );
};

const SheetStyles = () => (
  <style>{`
    .control-sheet {
      width: 1060px;
      background: #fff;
      color: #000;
      font-family: Calibri, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.15;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
    }

    .control-sheet table {
      width: 1060px;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .control-sheet td {
      border: 1px solid #334155;
      padding: 0;
      vertical-align: middle;
      overflow: hidden;
    }

    .sheet-title {
      position: relative;
      height: 42px;
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0;
      background: #f8fafc;
    }

    .sheet-logo {
      position: absolute;
      right: 16px;
      top: 4px;
      height: 34px;
      max-width: 90px;
      object-fit: contain;
    }

    .section-title {
      height: 21px;
      padding-left: 4px !important;
      font-size: 14px;
      font-weight: 700;
      text-align: left;
      background: #dbeafe;
      color: #0f172a;
    }

    .cell-label {
      padding: 2px 4px !important;
      font-size: 12px;
      white-space: normal;
    }

    .cell-label-center {
      padding: 2px 4px !important;
      text-align: center;
      font-size: 12px;
      white-space: normal;
    }

    .small-center {
      text-align: center;
      font-size: 10px;
      padding: 1px !important;
    }

    .bold {
      font-weight: 700;
    }

    .sheet-input,
    .sheet-textarea {
      width: 100%;
      height: 100%;
      min-height: 21px;
      border: 0;
      outline: 0;
      resize: none;
      background: transparent;
      color: #000;
      font: inherit;
      text-align: center;
      padding: 1px 3px;
    }

    .sheet-textarea {
      text-align: left;
      padding: 4px 6px;
    }

    .choice-cell {
      width: 100%;
      height: 100%;
      min-height: 20px;
      border: 0;
      background: transparent;
      color: #000;
      font-weight: 700;
      line-height: 1;
    }

    .choice-cell:disabled,
    .sheet-input:read-only,
    .sheet-textarea:read-only {
      cursor: default;
    }

    .fuel-box {
      width: 100%;
      height: 100%;
      min-height: 58px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      padding: 1px;
    }

    .fuel-svg {
      width: 96%;
      max-height: 50px;
    }

    .fuel-range {
      width: 86%;
      height: 12px;
    }

    .damage-area-photo {
  min-height: 170px;
  padding: 5px;
  background: #fff;
}

.damage-upload-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.damage-upload-btn {
  background: #4b5563;
  color: #fff;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.damage-upload-camera {
  background: #2563eb;
}

.damage-empty {
  height: 130px;
  border: 1px dashed #9ca3af;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  padding: 12px;
}

.damage-photo-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.damage-photo-card {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
  background: #f9fafb;
}

.damage-photo-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  font-size: 11px;
  font-weight: 700;
  border-bottom: 1px solid #d1d5db;
}

.damage-remove-btn {
  color: #dc2626;
  font-size: 10px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.damage-help {
  margin-bottom: 6px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1e3a8a;
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 11px;
  line-height: 1.35;
}

.damage-photo-wrap {
  position: relative;
  background: #fff;
  cursor: crosshair;
}

.damage-photo-img {
  width: 100%;
  height: 88px;
  object-fit: cover;
  display: block;
}
.damage-dot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc2626;
  border: 2px solid #fff;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.damage-point-row {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 2px 4px;
  font-size: 9px;
}

.damage-point-input {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 1px 2px;
  font-size: 9px;
}

.signature-canvas {
      width: 100%;
      height: 58px;
      display: block;
      background: #fff;
    }

    .signature-img {
      width: 100%;
      height: 58px;
      object-fit: contain;
      display: block;
    }

    .footer-cell {
      text-align: center;
      font-size: 8px;
      padding: 1px 3px !important;
    }

    @media print {
      .no-print {
        display: none !important;
      }

      body {
        background: #fff !important;
      }

      .control-sheet {
        box-shadow: none !important;
        margin: 0 !important;
        transform: scale(0.74);
        transform-origin: top left;
      }
    }
  `}</style>
);

export function ControlVehicularSheet({
  data,
  setData,
  readOnly = false,
  canEditConductor = false,
  puedeFirmarRecepcion = false,
  signatureRefs = {},
  registroId = "temp-recepcion",
}) {
  
  const setField = (key, value) => updateAtPath(setData, [key], value);
  const setNested = (path, value) => updateAtPath(setData, path, value);

  const interior = checklistVehiculo.interior;
  const motor = checklistVehiculo.motor;
  const exterior = checklistVehiculo.exterior;

  return (
    <>
      <SheetStyles />
      <div className="control-sheet">
        <table>
          <colgroup>
            {COL_WIDTHS.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>

          <tbody>
            <tr style={{ height: 7 }}>
              <td colSpan={13} style={{ border: 0 }} />
            </tr>

            <tr>
              <td colSpan={13} className="sheet-title">
                BITÁCORA Y CONTROL VEHICULAR
                <img src="/astap-logo.jpg" alt="ASTAP" className="sheet-logo" />
              </td>
            </tr>

            <tr>
              <td colSpan={13} className="section-title">
                ENTREGA VEHICULAR
              </td>
            </tr>

            <tr style={{ height: 28 }}>
              <td className="cell-label">CONDUCTOR:</td>
              <td colSpan={7}>
                <TextCell
  value={data.conductor}
  readOnly={readOnly || !canEditConductor}
  placeholder="Nombre del conductor"
  onChange={(v) => setField("conductor", v)}
/>
              </td>
              <td colSpan={3} className="cell-label">FECHA:</td>
              <td colSpan={2}>
                <TextCell type="date" value={data.fecha} readOnly={readOnly} onChange={(v) => setField("fecha", v)} />
              </td>
            </tr>

            <tr style={{ height: 29 }}>
              <td className="cell-label">LUGAR DESTINO:</td>
              <td colSpan={7}>
                <TextCell value={data.lugarDestino} readOnly={readOnly} placeholder="Lugar de destino" onChange={(v) => setField("lugarDestino", v)} />
              </td>
              <td colSpan={3} className="cell-label">CIUDAD:</td>
              <td colSpan={2}>
                <TextCell value={data.ciudad} readOnly={readOnly} placeholder="Ciudad" onChange={(v) => setField("ciudad", v)} />
              </td>
            </tr>

            <tr style={{ height: 58 }}>
              <td rowSpan={2} className="cell-label-center">VEHÍCULO:</td>
              <td className="cell-label">MODELO / MARCA:</td>
              <td className="small-center bold"></td>
              <td colSpan={2} className="cell-label-center">COMBUSTIBLE:</td>
              <td colSpan={2}></td>
              <td className="cell-label-center">PLACA:</td>
              <td colSpan={3} className="cell-label-center">COLOR:</td>
              <td colSpan={2} className="cell-label-center">PICO Y PLACA:</td>
            </tr>

            <tr style={{ height: 21 }}>
              <td>
                <TextCell value={data.modelo} readOnly={readOnly} placeholder="Modelo / marca" onChange={(v) => setField("modelo", v)} />
              </td>
              <td />
              <td colSpan={2}>
                <TextCell value={data.combustible} readOnly={readOnly} placeholder="Ej: Diésel / gasolina" onChange={(v) => setField("combustible", v)} />
              </td>
              <td colSpan={2}>
                <TextCell value={data.totalCombustible} readOnly={readOnly} placeholder="Ej: 1/2 tanque" onChange={(v) => setField("totalCombustible", v)} />
              </td>
              <td>
                <TextCell value={data.placa} readOnly={readOnly} placeholder="Ej: ABC-1234" onChange={(v) => setField("placa", v)} />
              </td>
              <td colSpan={3}>
                <TextCell value={data.color} readOnly={readOnly} placeholder="Color" onChange={(v) => setField("color", v)} />
              </td>
              <td colSpan={2}>
                <TextCell value={data.picoPlaca} readOnly={readOnly} placeholder="Día / restricción" onChange={(v) => setField("picoPlaca", v)} />
              </td>
            </tr>

            <tr style={{ height: 21 }}>
              <td colSpan={7} />
              <td colSpan={4} className="cell-label-center bold">PEDIDO/DEMANDA</td>
              <td colSpan={2}>
                <TextCell value={data.pedidoDemanda} readOnly={readOnly} placeholder="Ej: P-23-046" onChange={(v) => setField("pedidoDemanda", v)} />
              </td>
            </tr>

            <tr style={{ height: 23 }}>
              <td rowSpan={13} className="cell-label-center" style={{ fontSize: 16 }}>
                DOCUMENTOS Y ESTADO<br />DEL VEHÍCULO:
              </td>
              <td rowSpan={2} className="cell-label">{documentosVehiculo[0].label}</td>
              <td className="small-center">SI</td>
              <td className="small-center">NO</td>
              <td rowSpan={2} className="cell-label">{documentosVehiculo[1].label}</td>
              <td className="small-center">SI</td>
              <td className="small-center">NO</td>
              <td rowSpan={2} className="cell-label">{documentosVehiculo[2].label}</td>
              <td className="small-center">SI</td>
              <td className="small-center">NO</td>
              <td colSpan={3} className="cell-label-center">KILOMETROS SALIDA</td>
            </tr>

            <tr style={{ height: 22 }}>
              <td>
                <ChoiceCell value={data.documentos.soat} option="SI" readOnly={readOnly} onChange={(v) => setNested(["documentos", "soat"], v)} />
              </td>
              <td>
                <ChoiceCell value={data.documentos.soat} option="NO" readOnly={readOnly} onChange={(v) => setNested(["documentos", "soat"], v)} />
              </td>
              <td>
                <ChoiceCell value={data.documentos.manualSeguradora} option="SI" readOnly={readOnly} onChange={(v) => setNested(["documentos", "manualSeguradora"], v)} />
              </td>
              <td>
                <ChoiceCell value={data.documentos.manualSeguradora} option="NO" readOnly={readOnly} onChange={(v) => setNested(["documentos", "manualSeguradora"], v)} />
              </td>
              <td>
                <ChoiceCell value={data.documentos.matricula} option="SI" readOnly={readOnly} onChange={(v) => setNested(["documentos", "matricula"], v)} />
              </td>
              <td>
                <ChoiceCell value={data.documentos.matricula} option="NO" readOnly={readOnly} onChange={(v) => setNested(["documentos", "matricula"], v)} />
              </td>
              <td colSpan={3}>
                <TextCell value={data.kilometrosSalida} readOnly={readOnly} placeholder="Km salida" onChange={(v) => setField("kilometrosSalida", v)} />
              </td>
            </tr>

            <tr style={{ height: 22 }}>
              <td className="cell-label">INTERIOR</td>
              <td className="small-center">SI</td>
              <td className="small-center">NO</td>
              <td className="cell-label-center">MOTOR</td>
              <td className="small-center">SI</td>
              <td className="small-center">NO</td>
              <td className="cell-label-center">EXTERIOR</td>
              <td className="small-center">SI</td>
              <td className="small-center">NO</td>
              <td colSpan={3} className="cell-label-center">NIVEL DE COMBUSTIBLE</td>
            </tr>

            {Array.from({ length: 6 }).map((_, index) => {
              const interiorItem = interior[index];
              const motorItem = motor[index];
              const exteriorItem = exterior[index];

              return (
                <tr key={interiorItem.key} style={{ height: 21 }}>
                  <td className="cell-label">{interiorItem.label}</td>
                  <td>
                    <ChoiceCell value={data.checklist.interior[interiorItem.key]} option="SI" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interiorItem.key], v)} />
                  </td>
                  <td>
                    <ChoiceCell value={data.checklist.interior[interiorItem.key]} option="NO" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interiorItem.key], v)} />
                  </td>
                  <td className="cell-label">{motorItem.label}</td>
                  <td>
                    <ChoiceCell value={data.checklist.motor[motorItem.key]} option="SI" readOnly={readOnly} onChange={(v) => setNested(["checklist", "motor", motorItem.key], v)} />
                  </td>
                  <td>
                    <ChoiceCell value={data.checklist.motor[motorItem.key]} option="NO" readOnly={readOnly} onChange={(v) => setNested(["checklist", "motor", motorItem.key], v)} />
                  </td>
                  <td className="cell-label">{exteriorItem.label}</td>
                  <td>
                    <ChoiceCell value={data.checklist.exterior[exteriorItem.key]} option="SI" readOnly={readOnly} onChange={(v) => setNested(["checklist", "exterior", exteriorItem.key], v)} />
                  </td>
                  <td>
                    <ChoiceCell value={data.checklist.exterior[exteriorItem.key]} option="NO" readOnly={readOnly} onChange={(v) => setNested(["checklist", "exterior", exteriorItem.key], v)} />
                  </td>
                  {index === 0 && (
                    <td colSpan={3} className="cell-label-center">SALIDA</td>
                  )}
                  {index === 1 && (
                    <td colSpan={3} rowSpan={5}>
                      <FuelGauge
                        value={data.combustibleSalida}
                        readOnly={readOnly}
                        onChange={(v) => setField("combustibleSalida", v)}
                      />
                    </td>
                  )}
                </tr>
              );
            })}

            <tr style={{ height: 21 }}>
              <td className="cell-label">{interior[6].label}</td>
              <td>
                <ChoiceCell value={data.checklist.interior[interior[6].key]} option="SI" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interior[6].key], v)} />
              </td>
              <td>
                <ChoiceCell value={data.checklist.interior[interior[6].key]} option="NO" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interior[6].key], v)} />
              </td>
              <td colSpan={9} className="cell-label">OBSERVACIONES:</td>
            </tr>

            <tr style={{ height: 21 }}>
              <td className="cell-label">{interior[7].label}</td>
              <td>
                <ChoiceCell value={data.checklist.interior[interior[7].key]} option="SI" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interior[7].key], v)} />
              </td>
              <td>
                <ChoiceCell value={data.checklist.interior[interior[7].key]} option="NO" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interior[7].key], v)} />
              </td>
              <td colSpan={9}>
                <TextCell value={data.observacionesMotor[0]} readOnly={readOnly} placeholder="Observación del vehículo" onChange={(v) => setNested(["observacionesMotor", 0], v)} />
              </td>
            </tr>

            <tr style={{ height: 21 }}>
              <td className="cell-label">{interior[8].label}</td>
              <td>
                <ChoiceCell value={data.checklist.interior[interior[8].key]} option="SI" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interior[8].key], v)} />
              </td>
              <td>
                <ChoiceCell value={data.checklist.interior[interior[8].key]} option="NO" readOnly={readOnly} onChange={(v) => setNested(["checklist", "interior", interior[8].key], v)} />
              </td>
              <td colSpan={9}>
                <TextCell value={data.observacionesMotor[1]} readOnly={readOnly} placeholder="Detalle adicional" onChange={(v) => setNested(["observacionesMotor", 1], v)} />
              </td>
            </tr>

            <tr style={{ height: 22 }}>
              <td colSpan={3} />
              <td colSpan={9} />
            </tr>

            <tr style={{ height: 20 }}>
              <td colSpan={13} className="cell-label-center" style={{ fontSize: 14 }}>
                DAÑOS DE CARROCERÍA Y COMENTARIOS GENERALES
              </td>
            </tr>

            <tr>
              <td colSpan={13}>
                <DamageArea
  imagenes={data.danos.imagenes || []}
  readOnly={readOnly}
  registroId={registroId || "temp-recepcion"}
  onChange={(imagenes) => setNested(["danos", "imagenes"], imagenes)}
/>
              </td>
            </tr>

            <tr style={{ height: 18 }}>
              <td colSpan={13} className="cell-label">OBSERVACIONES ENTREGA:</td>
            </tr>

            <tr style={{ height: 44 }}>
              <td colSpan={13}>
                <TextAreaCell value={data.observacionesEntrega} readOnly={readOnly} placeholder="Observaciones al momento de la entrega" onChange={(v) => setField("observacionesEntrega", v)} />
              </td>
            </tr>

            <tr style={{ height: 20 }}>
              <td colSpan={13} className="section-title">
                RECEPCIÓN VEHICULAR
              </td>
            </tr>

            <tr style={{ height: 15 }}>
              <td rowSpan={4} className="cell-label-center bold">
                NIVEL<br />DE COMBUSTIBLE LLEGADA
              </td>
              <td colSpan={3} rowSpan={4}>
                <FuelGauge
                  value={data.recepcion.combustibleLlegada}
                  readOnly={readOnly}
                  onChange={(v) => setNested(["recepcion", "combustibleLlegada"], v)}
                />
              </td>
              <td rowSpan={4} />
              <td colSpan={3} rowSpan={4} className="cell-label-center bold">
                KILÓMETROS<br />DE LLEGADA
                <TextCell value={data.recepcion.kilometrosLlegada} readOnly={readOnly} placeholder="Km llegada" onChange={(v) => setNested(["recepcion", "kilometrosLlegada"], v)} />
              </td>
              <td colSpan={5} className="cell-label-center bold">MANTENIMIENTO</td>
            </tr>

            <tr style={{ height: 14 }}>
              <td colSpan={3} className="small-center bold">SI</td>
              <td colSpan={2} className="small-center bold">NO</td>
            </tr>

            <tr style={{ height: 18 }}>
              <td colSpan={3} rowSpan={2}>
                <ChoiceCell value={data.recepcion.mantenimiento} option="SI" readOnly={readOnly} onChange={(v) => setNested(["recepcion", "mantenimiento"], v)} />
              </td>
              <td colSpan={2} rowSpan={2}>
                <ChoiceCell value={data.recepcion.mantenimiento} option="NO" readOnly={readOnly} onChange={(v) => setNested(["recepcion", "mantenimiento"], v)} />
              </td>
            </tr>
            <tr style={{ height: 18 }} />

            <tr style={{ height: 66 }}>
              <td className="cell-label-center" style={{ fontSize: 14 }}>
                FIRMA RESPONSABLE /<br />CONDUCTOR:
              </td>
              <td colSpan={4}>
                <SignatureBox
                  dataUrl={data.firmas.responsable}
                  canvasRef={signatureRefs.responsable}
                  readOnly={readOnly}
                />
              </td>
              <td colSpan={3} className="cell-label-center" style={{ fontSize: 14 }}>
                RECEPCIÓN FINAL SERVICIO:
              </td>
              <td colSpan={5}>
               <SignatureBox
  dataUrl={data.firmas.recepcionFinal}
  canvasRef={signatureRefs.recepcionFinal}
  readOnly={readOnly || !puedeFirmarRecepcion}
/>
              </td>
            </tr>

            <tr style={{ height: 18 }}>
              <td colSpan={13} className="cell-label bold">OBSERVACIONES DE LA RECEPCIÓN:</td>
            </tr>

            <tr style={{ height: 52 }}>
              <td colSpan={13}>
                <TextAreaCell value={data.observacionesRecepcion} readOnly={readOnly} placeholder="Observaciones finales de recepción" onChange={(v) => setField("observacionesRecepcion", v)} />
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </>
  );
}

export default function HojaRecepcion() {
  const { id } = useParams();
  const isEditing = !!id;
  const claveAutoguardado = `recepcion_${id ?? "new"}`;
  const navigate = useNavigate();

  const { isSuperAdmin, isSupervisorOperaciones } = useAuth();

  const puedeFirmarRecepcion =
    isSuperAdmin || isSupervisorOperaciones;
  const firmaResponsableRef = useRef(null);
  const firmaRecepcionRef = useRef(null);

  const [registroId, setRegistroId] = useState(id || null);
const [data, setData] = useState(cloneRecepcionSchema());
const [guardando, setGuardando] = useState(false);
const [isLocked, setIsLocked] = useState(false);

// Autoguardado automático cada 15 segundos
useAutoguardado(claveAutoguardado, data, !isLocked);
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: registro, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !registro) return;

      const loaded = mergeDeep(cloneRecepcionSchema(), registro.data || {});
      setData(loaded);
      setRegistroId(registro.id);
      setIsLocked(registro.estado === "completado");

      setTimeout(() => {
        if (loaded.firmas?.responsable) {
          firmaResponsableRef.current?.fromDataURL(loaded.firmas.responsable);
        }
        if (loaded.firmas?.recepcionFinal) {
          firmaRecepcionRef.current?.fromDataURL(loaded.firmas.recepcionFinal);
        }
      }, 250);
    };

    load();
  }, [id]);

  const buildPayload = () => {
    const firmaResponsable =
      firmaResponsableRef.current && !firmaResponsableRef.current.isEmpty()
        ? firmaResponsableRef.current.toDataURL("image/png")
        : data.firmas.responsable || "";

    const firmaRecepcion =
      firmaRecepcionRef.current && !firmaRecepcionRef.current.isEmpty()
        ? firmaRecepcionRef.current.toDataURL("image/png")
        : data.firmas.recepcionFinal || "";

    return {
      ...data,
      firmas: {
        responsable: firmaResponsable,
        recepcionFinal: firmaRecepcion,
      },
    };
  };

  const handleGuardar = async () => {
    setGuardando(true);

    try {
      const payload = buildPayload();
      const completado = Boolean(
        payload.firmas.responsable && payload.firmas.recepcionFinal
      );

      const result = await saveOrUpdateReport({
        id: registroId,
        area: "operaciones",
        tipo: "recepcion",
        subtipo: "control_vehicular",
        data: payload,
        estado: completado ? "completado" : "borrador",
      });

      if (result?.id) setRegistroId(result.id);
      alert("Guardado correctamente");

      limpiarBorrador(claveAutoguardado);
      navigate("/operaciones/recepcion");
    } catch (error) {
      console.error("Error guardando hoja de control vehicular:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const handlePDF = async () => {
    try {
      await generarPDFRecepcion(buildPayload());
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("No se pudo generar el PDF.");
    }
  };

  const handleVistaPreviaPDF = () => {
    if (!registroId) {
      alert("Guarda primero la bitácora para abrir la vista previa del PDF.");
      return;
    }

    navigate(`/operaciones/recepcion/${registroId}/pdf`);
  };

  const handleDesbloquear = () => {
    if (
      confirm(
        "¿Deseas desbloquear este registro para editarlo? Se guardará como borrador al guardar."
      )
    ) {
      setIsLocked(false);
      // Recargar firmas en los canvas ahora que están visibles
      setTimeout(() => {
        if (data.firmas?.responsable) {
          firmaResponsableRef.current?.fromDataURL(data.firmas.responsable);
        }
        if (data.firmas?.recepcionFinal) {
          firmaRecepcionRef.current?.fromDataURL(data.firmas.recepcionFinal);
        }
      }, 150);
    }
  };

  const limpiarFirma = (ref, key) => {
    ref.current?.clear();
    updateAtPath(setData, ["firmas", key], "");
  };

  return (
    <div className="p-4 max-w-[1080px] mx-auto space-y-3">
      <BannerAutoguardado
      clave={claveAutoguardado}
      onRestaurar={(datosGuardados) => setData(datosGuardados)}
      isEditing={isEditing}
    />
      <div className="no-print flex flex-wrap justify-between gap-2">
        <button
          type="button"
         onClick={() => navigate("/operaciones/recepcion")}
          className="btn-volver-orange"
        >
          Volver
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePDF}
            className="border border-white/60 text-white px-4 py-2 rounded text-sm hover:bg-white/10"
          >
            Descargar PDF
          </button>

          <button
            type="button"
            onClick={handleVistaPreviaPDF}
            className="border border-white/60 text-white px-4 py-2 rounded text-sm hover:bg-white/10"
          >
            Vista previa PDF
          </button>

          {isLocked ? (
            <>
              <span className="bg-green-100 text-green-700 text-sm px-3 py-2 rounded">
                Completado
              </span>
              <button
                type="button"
                onClick={handleDesbloquear}
                className="border border-yellow-400 text-yellow-300 px-4 py-2 rounded text-sm hover:bg-yellow-400/10"
              >
                ✏️ Editar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => limpiarFirma(firmaResponsableRef, "responsable")}
                className="border border-white/60 text-white px-4 py-2 rounded text-sm hover:bg-white/10"
              >
                Limpiar firma conductor
              </button>

             {puedeFirmarRecepcion && (
  <button
    type="button"
    onClick={() =>
      limpiarFirma(firmaRecepcionRef, "recepcionFinal")
    }
    className="border border-white/60 text-white px-4 py-2 rounded text-sm hover:bg-white/10"
  >
    Limpiar firma recepción
  </button>
)}

              <button
                type="button"
                onClick={handleGuardar}
                disabled={guardando}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="no-print rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Completa datos de entrega, documentos, kilometraje y combustible. En daños de carrocería puedes subir fotos, marcar puntos sobre la imagen y describir cada novedad antes de guardar o descargar el PDF.
      </div>

      <div className="overflow-x-auto bg-white shadow border p-2">
        <ControlVehicularSheet
  data={data}
  setData={setData}
  readOnly={isLocked}
  canEditConductor={isSuperAdmin}        
  puedeFirmarRecepcion={puedeFirmarRecepcion}
          registroId={registroId || "temp-recepcion"}
          signatureRefs={{
            responsable: firmaResponsableRef,
            recepcionFinal: firmaRecepcionRef,
          }}
        />
      </div>
    </div>
  );
}
