// src/pages/service-report-creation/index.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";
import { useReports } from "../../context/ReportContext";

/* ======================================================
   Componente reutilizable de firma
====================================================== */
const SignatureBox = ({ title, subtitle, value, onChange }) => {
  const sigRef = useRef(null);

  useEffect(() => {
    if (!sigRef.current) return;
    sigRef.current.clear();
    if (value) {
      try {
        sigRef.current.fromDataURL(value);
      } catch {}
    }
  }, [value]);

  const handleEnd = () => {
    if (!sigRef.current) return;
    const data = sigRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    onChange(data);
  };

  const handleClear = () => {
    sigRef.current?.clear();
    onChange(null);
  };

  return (
    <div className="border rounded-xl p-4 bg-slate-50 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="border-2 border-dashed rounded-lg bg-white">
        <SignatureCanvas
          ref={sigRef}
          penColor="#111827"
          onEnd={handleEnd}
          canvasProps={{
            className: "w-full h-40 cursor-crosshair",
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
      >
        <Icon name="RotateCcw" size={12} />
        Limpiar
      </button>
    </div>
  );
};

/* ======================================================
   Estados base
====================================================== */
const emptyRow = { parameter: "", value: "" };

const ServiceReportCreation = () => {
  const navigate = useNavigate();
  const { currentReport, saveDraft, setCurrentReport } = useReports();

  const [beforeTesting, setBeforeTesting] = useState([emptyRow]);
  const [afterTesting, setAfterTesting] = useState([emptyRow]);
  const [signatures, setSignatures] = useState({
    astap: null,
    client: null,
  });

  /* ======================================================
     Cargar borrador
  ====================================================== */
  useEffect(() => {
    if (!currentReport) return;

    setBeforeTesting(
      currentReport.beforeTesting?.length
        ? currentReport.beforeTesting
        : [emptyRow]
    );

    setAfterTesting(
      currentReport.afterTesting?.length
        ? currentReport.afterTesting
        : [emptyRow]
    );

    setSignatures(
      currentReport.digitalSignatures || {
        astap: null,
        client: null,
      }
    );
  }, [currentReport]);

  /* ======================================================
     Helpers
  ====================================================== */
  const updateRow = (setter, index, field, value) => {
    setter((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
    );
  };

  const addRow = (setter) =>
    setter((prev) => [...prev, { ...emptyRow }]);

  const buildReport = () => ({
    ...currentReport,
    beforeTesting,
    afterTesting,
    digitalSignatures: signatures,
    updatedAt: new Date().toISOString(),
  });

  /* ======================================================
     Acciones
  ====================================================== */
  const handleSave = () => {
    const report = buildReport();
    saveDraft(report);
    setCurrentReport(report);
    alert("Borrador guardado");
  };

  const handlePreview = () => {
    const report = buildReport();
    setCurrentReport(report);
    navigate("/pdf-report-preview");
  };

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <header>
          <h1 className="text-2xl font-semibold">
            Reporte de Servicio
          </h1>
          <p className="text-sm text-slate-600">
            Complete el formulario y firme para generar el PDF
          </p>
        </header>

        {/* PRUEBAS ANTES */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Pruebas antes del servicio
          </h2>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100 border-b text-xs font-semibold">
              <div className="col-span-2 text-center py-2 border-r">
                Ítem
              </div>
              <div className="col-span-5 text-center py-2 border-r">
                Parámetro
              </div>
              <div className="col-span-5 text-center py-2">
                Valor
              </div>
            </div>

            {beforeTesting.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 border-b last:border-b-0"
              >
                <div className="col-span-2 text-center py-2 border-r">
                  {i + 1}
                </div>
                <div className="col-span-5 p-2 border-r">
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    value={row.parameter}
                    onChange={(e) =>
                      updateRow(
                        setBeforeTesting,
                        i,
                        "parameter",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="col-span-5 p-2">
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    value={row.value}
                    onChange={(e) =>
                      updateRow(
                        setBeforeTesting,
                        i,
                        "value",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            iconName="Plus"
            onClick={() => addRow(setBeforeTesting)}
          >
            Agregar fila
          </Button>
        </section>

        {/* PRUEBAS DESPUÉS */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Pruebas después del servicio
          </h2>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100 border-b text-xs font-semibold">
              <div className="col-span-2 text-center py-2 border-r">
                Ítem
              </div>
              <div className="col-span-5 text-center py-2 border-r">
                Parámetro
              </div>
              <div className="col-span-5 text-center py-2">
                Valor
              </div>
            </div>

            {afterTesting.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 border-b last:border-b-0"
              >
                <div className="col-span-2 text-center py-2 border-r">
                  {i + 1}
                </div>
                <div className="col-span-5 p-2 border-r">
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    value={row.parameter}
                    onChange={(e) =>
                      updateRow(
                        setAfterTesting,
                        i,
                        "parameter",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="col-span-5 p-2">
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    value={row.value}
                    onChange={(e) =>
                      updateRow(
                        setAfterTesting,
                        i,
                        "value",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            iconName="Plus"
            onClick={() => addRow(setAfterTesting)}
          >
            Agregar fila
          </Button>
        </section>

        {/* FIRMAS */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Firmas digitales del reporte
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <SignatureBox
              title="Técnico ASTAP"
              value={signatures.astap}
              onChange={(v) =>
                setSignatures((p) => ({ ...p, astap: v }))
              }
            />
            <SignatureBox
              title="Cliente"
              value={signatures.client}
              onChange={(v) =>
                setSignatures((p) => ({ ...p, client: v }))
              }
            />
          </div>
        </section>

        {/* BOTONES */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            iconName="Save"
            onClick={handleSave}
          >
            Guardar borrador
          </Button>

          <Button
            iconName="FileText"
            iconPosition="right"
            onClick={handlePreview}
          >
            Ver PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceReportCreation;
