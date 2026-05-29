import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { saveOrUpdateReport } from "@/services/reportService";
import { supabase } from "@/lib/supabase";
import { generarPDFRecepcion } from "./generarPDFRecepcion";
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

const TextCell = ({ value, onChange, type = "text", readOnly = false }) => (
  <input
    type={type}
    value={value || ""}
    readOnly={readOnly}
    onChange={(e) => onChange(e.target.value)}
    className="sheet-input"
  />
);

const TextAreaCell = ({ value, onChange, readOnly = false }) => (
  <textarea
    value={value || ""}
    readOnly={readOnly}
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

const DamageArea = ({ puntos = [], onChange, readOnly = false }) => {
  const addPoint = (event) => {
    if (readOnly) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onChange([
      ...puntos,
      {
        id: Date.now(),
        x,
        y,
      },
    ]);
  };

  const removePoint = (id, event) => {
    event.stopPropagation();
    if (readOnly) return;
    onChange(puntos.filter((p) => p.id !== id));
  };

  return (
    <div className="damage-area" onClick={addPoint}>
      <svg viewBox="0 0 720 230" className="truck-svg" aria-hidden="true">
        <g fill="none" stroke="#68707a" strokeWidth="2">
          <rect x="70" y="34" width="120" height="56" rx="10" />
          <path d="M72 44 L50 59 L50 88 L72 88" />
          <path d="M190 44 L214 62 L214 88 L190 88" />
          <line x1="92" y1="34" x2="92" y2="90" />
          <line x1="168" y1="34" x2="168" y2="90" />
          <circle cx="72" cy="101" r="15" />
          <circle cx="192" cy="101" r="15" />

          <path d="M275 65 L340 35 L445 35 L486 64 L666 64 L678 82 L670 111 L280 111 L268 88 Z" />
          <path d="M350 36 L334 64 L413 64 L407 36" />
          <path d="M419 36 L427 64 L485 64" />
          <line x1="500" y1="64" x2="665" y2="64" />
          <circle cx="345" cy="115" r="25" />
          <circle cx="600" cy="115" r="25" />

          <rect x="62" y="145" width="142" height="58" rx="10" />
          <path d="M62 165 H204" />
          <path d="M78 145 V203 M188 145 V203" />
          <circle cx="80" cy="207" r="14" />
          <circle cx="188" cy="207" r="14" />

          <path d="M288 171 L352 145 L456 145 L498 172 L650 172 L666 190 L658 218 L292 218 L276 196 Z" />
          <path d="M362 146 L346 174 L424 174 L417 146" />
          <path d="M430 146 L438 174 L498 174" />
          <circle cx="355" cy="218" r="22" />
          <circle cx="590" cy="218" r="22" />
        </g>

        {puntos.map((p) => (
          <circle
            key={p.id}
            cx={(p.x / 100) * 720}
            cy={(p.y / 100) * 230}
            r="8"
            fill="#d21f2b"
            stroke="#fff"
            strokeWidth="2"
            className={readOnly ? "" : "damage-point"}
            onClick={(event) => removePoint(p.id, event)}
          />
        ))}
      </svg>
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
      width: 998px;
      background: #fff;
      color: #000;
      font-family: Calibri, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.05;
    }

    .control-sheet table {
      width: 998px;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .control-sheet td {
      border: 1px solid #111;
      padding: 0;
      vertical-align: middle;
      overflow: hidden;
    }

    .sheet-title {
      position: relative;
      height: 42px;
      text-align: center;
      font-size: 24px;
      font-weight: 400;
      letter-spacing: 0;
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
      min-height: 74px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      padding: 1px;
    }

    .fuel-svg {
      width: 96%;
      max-height: 64px;
    }

    .fuel-range {
      width: 86%;
      height: 12px;
    }

    .damage-area {
      height: 224px;
      position: relative;
      cursor: crosshair;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }

    .truck-svg {
      width: 94%;
      height: 92%;
    }

    .damage-point {
      cursor: pointer;
    }

    .signature-canvas {
      width: 100%;
      height: 88px;
      display: block;
      background: #fff;
    }

    .signature-img {
      width: 100%;
      height: 88px;
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
  signatureRefs = {},
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
                HOJA DE CONTROL VEHICULAR
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
                <TextCell value={data.conductor} readOnly={readOnly} onChange={(v) => setField("conductor", v)} />
              </td>
              <td colSpan={3} className="cell-label">FECHA:</td>
              <td colSpan={2}>
                <TextCell type="date" value={data.fecha} readOnly={readOnly} onChange={(v) => setField("fecha", v)} />
              </td>
            </tr>

            <tr style={{ height: 29 }}>
              <td className="cell-label">LUGAR DESTINO:</td>
              <td colSpan={7}>
                <TextCell value={data.lugarDestino} readOnly={readOnly} onChange={(v) => setField("lugarDestino", v)} />
              </td>
              <td colSpan={3} className="cell-label">CUIDAD:</td>
              <td colSpan={2}>
                <TextCell value={data.ciudad} readOnly={readOnly} onChange={(v) => setField("ciudad", v)} />
              </td>
            </tr>

            <tr style={{ height: 58 }}>
              <td rowSpan={2} className="cell-label-center">VEHICULO:</td>
              <td className="cell-label">MODELO:</td>
              <td className="small-center bold">SELECCIÓN</td>
              <td colSpan={2} className="cell-label-center">COMBUSTIBLE:</td>
              <td colSpan={2} className="small-center">TOTAL<br />COMBUSTIBLE</td>
              <td className="cell-label-center">PLACA:</td>
              <td colSpan={3} className="cell-label-center">COLOR:</td>
              <td colSpan={2} className="cell-label-center">PICO Y PLACA:</td>
            </tr>

            <tr style={{ height: 21 }}>
              <td>
                <TextCell value={data.modelo} readOnly={readOnly} onChange={(v) => setField("modelo", v)} />
              </td>
              <td>
                <BooleanChoiceCell value={data.seleccionado} readOnly={readOnly} onChange={(v) => setField("seleccionado", v)} />
              </td>
              <td colSpan={2}>
                <TextCell value={data.combustible} readOnly={readOnly} onChange={(v) => setField("combustible", v)} />
              </td>
              <td colSpan={2}>
                <TextCell value={data.totalCombustible} readOnly={readOnly} onChange={(v) => setField("totalCombustible", v)} />
              </td>
              <td>
                <TextCell value={data.placa} readOnly={readOnly} onChange={(v) => setField("placa", v)} />
              </td>
              <td colSpan={3}>
                <TextCell value={data.color} readOnly={readOnly} onChange={(v) => setField("color", v)} />
              </td>
              <td colSpan={2}>
                <TextCell value={data.picoPlaca} readOnly={readOnly} onChange={(v) => setField("picoPlaca", v)} />
              </td>
            </tr>

            <tr style={{ height: 21 }}>
              <td colSpan={7} />
              <td colSpan={4} className="cell-label-center bold">PEDIDO/DEMANDA</td>
              <td colSpan={2}>
                <TextCell value={data.pedidoDemanda} readOnly={readOnly} onChange={(v) => setField("pedidoDemanda", v)} />
              </td>
            </tr>

            <tr style={{ height: 23 }}>
              <td rowSpan={13} className="cell-label-center" style={{ fontSize: 16 }}>
                DOCUMENTOS Y ESTADO<br />DEL VEHICULO:
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
                <TextCell value={data.kilometrosSalida} readOnly={readOnly} onChange={(v) => setField("kilometrosSalida", v)} />
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
                <TextCell value={data.observacionesMotor[0]} readOnly={readOnly} onChange={(v) => setNested(["observacionesMotor", 0], v)} />
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
                <TextCell value={data.observacionesMotor[1]} readOnly={readOnly} onChange={(v) => setNested(["observacionesMotor", 1], v)} />
              </td>
            </tr>

            <tr style={{ height: 22 }}>
              <td colSpan={3} />
              <td colSpan={9} />
            </tr>

            <tr style={{ height: 26 }}>
              <td colSpan={13} className="cell-label-center" style={{ fontSize: 14 }}>
                DAÑOS DE CARROCERIA Y COMENTARIOS GENERALES
              </td>
            </tr>

            <tr>
              <td colSpan={13}>
                <DamageArea
                  puntos={data.danos.puntos}
                  readOnly={readOnly}
                  onChange={(puntos) => setNested(["danos", "puntos"], puntos)}
                />
              </td>
            </tr>

            <tr style={{ height: 22 }}>
              <td colSpan={13} className="cell-label">OBSERVACIONES ENTREGA:</td>
            </tr>

            <tr style={{ height: 70 }}>
              <td colSpan={13}>
                <TextAreaCell value={data.observacionesEntrega} readOnly={readOnly} onChange={(v) => setField("observacionesEntrega", v)} />
              </td>
            </tr>

            <tr style={{ height: 26 }}>
              <td colSpan={13} className="section-title">
                RECEPCIÓN VEHICULAR
              </td>
            </tr>

            <tr style={{ height: 18 }}>
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
                KILOMETROS<br />DE LLEGADA
                <TextCell value={data.recepcion.kilometrosLlegada} readOnly={readOnly} onChange={(v) => setNested(["recepcion", "kilometrosLlegada"], v)} />
              </td>
              <td colSpan={5} className="cell-label-center bold">MANTENIMIENTO</td>
            </tr>

            <tr style={{ height: 18 }}>
              <td colSpan={3} className="small-center bold">SI</td>
              <td colSpan={2} className="small-center bold">NO</td>
            </tr>

            <tr style={{ height: 24 }}>
              <td colSpan={3} rowSpan={2}>
                <ChoiceCell value={data.recepcion.mantenimiento} option="SI" readOnly={readOnly} onChange={(v) => setNested(["recepcion", "mantenimiento"], v)} />
              </td>
              <td colSpan={2} rowSpan={2}>
                <ChoiceCell value={data.recepcion.mantenimiento} option="NO" readOnly={readOnly} onChange={(v) => setNested(["recepcion", "mantenimiento"], v)} />
              </td>
            </tr>
            <tr style={{ height: 24 }} />

            <tr style={{ height: 95 }}>
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
                RECEPCION FINAL SERVICIO:
              </td>
              <td colSpan={5}>
                <SignatureBox
                  dataUrl={data.firmas.recepcionFinal}
                  canvasRef={signatureRefs.recepcionFinal}
                  readOnly={readOnly}
                />
              </td>
            </tr>

            <tr style={{ height: 22 }}>
              <td colSpan={13} className="cell-label bold">OBSERVACIONES DE LA RECEPCIÓN:</td>
            </tr>

            <tr style={{ height: 92 }}>
              <td colSpan={13}>
                <TextAreaCell value={data.observacionesRecepcion} readOnly={readOnly} onChange={(v) => setField("observacionesRecepcion", v)} />
              </td>
            </tr>

            <tr style={{ height: 15 }}>
              <td colSpan={5} className="footer-cell bold">ASTAP Cía. Ltda.</td>
              <td colSpan={2} />
              <td colSpan={6} className="footer-cell bold">TELEFONOS CONTACTO/EMERGENCIA:</td>
            </tr>
            <tr style={{ height: 13 }}>
              <td colSpan={5} className="footer-cell">Av. Naciones Unidas 1084 y Av. Amazonas</td>
              <td colSpan={2} />
              <td colSpan={6} />
            </tr>
            <tr style={{ height: 12 }}>
              <td colSpan={5} className="footer-cell">Torre B, 6to Piso</td>
              <td colSpan={2} />
              <td colSpan={6} className="footer-cell">ECUASISTENCIA 0999494488</td>
            </tr>
            <tr style={{ height: 12 }}>
              <td colSpan={5} className="footer-cell">Telef: 2262154 / Fax: 2462160</td>
              <td colSpan={2} />
              <td colSpan={6} className="footer-cell">DECISEG - AMERICA MEDINA - CEL. 0987166104 - TELF.3530422</td>
            </tr>
            <tr style={{ height: 12 }}>
              <td colSpan={5} className="footer-cell">P.O. BOX: 17-17-1136</td>
              <td colSpan={2} />
              <td colSpan={6} className="footer-cell">DECISEG - GABRIELA CORAL - CEL. 0987690320 - TELF. 3530422</td>
            </tr>
            <tr style={{ height: 12 }}>
              <td colSpan={5} className="footer-cell">E-mail: astap@astap.com</td>
              <td colSpan={2} />
              <td colSpan={6} />
            </tr>
            <tr style={{ height: 13 }}>
              <td colSpan={5} className="footer-cell">Quito-Ecuador</td>
              <td colSpan={2} />
              <td colSpan={6} />
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function HojaRecepcion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const firmaResponsableRef = useRef(null);
  const firmaRecepcionRef = useRef(null);

  const [registroId, setRegistroId] = useState(id || null);
  const [data, setData] = useState(cloneRecepcionSchema());
  const [guardando, setGuardando] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

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
      const completado = Boolean(payload.firmas.responsable && payload.firmas.recepcionFinal);

      const result = await saveOrUpdateReport({
        id: registroId,
        tipo: "recepcion",
        subtipo: "control_vehicular",
        data: payload,
        estado: completado ? "completado" : "borrador",
      });

      if (result?.id) setRegistroId(result.id);
      alert("Guardado correctamente");
      navigate("/recepcion");
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

  const limpiarFirma = (ref, key) => {
    ref.current?.clear();
    updateAtPath(setData, ["firmas", key], "");
  };

  return (
    <div className="p-4 max-w-[1080px] mx-auto space-y-3">
      <div className="no-print flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate("/recepcion")}
          className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          Volver
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePDF}
            className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
          >
            Descargar PDF
          </button>

          {!isLocked && (
            <>
              <button
                type="button"
                onClick={() => limpiarFirma(firmaResponsableRef, "responsable")}
                className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
              >
                Limpiar firma conductor
              </button>

              <button
                type="button"
                onClick={() => limpiarFirma(firmaRecepcionRef, "recepcionFinal")}
                className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
              >
                Limpiar firma recepción
              </button>

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

          {isLocked && (
            <span className="bg-green-100 text-green-700 text-sm px-3 py-2 rounded">
              Completado
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow border p-2">
        <ControlVehicularSheet
          data={data}
          setData={setData}
          readOnly={isLocked}
          signatureRefs={{
            responsable: firmaResponsableRef,
            recepcionFinal: firmaRecepcionRef,
          }}
        />
      </div>
    </div>
  );
}

