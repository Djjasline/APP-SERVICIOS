import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

// Secciones
import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import SignaturesSection from "@components/common/SignaturesSection";
import ChecklistSection from "@components/common/ChecklistSection";
import EstadoEquipoSection from "@components/common/EstadoEquipoSection";

// Schema
import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "./schemas/InspeccionHidroSchema";

// Botones PDF (se agregan luego, no rompen nada)
import PdfInspeccionButtons from "./components/PdfInspeccionButtons";

export default function InspeccionHidro() {
  const [params] = useSearchParams();

  const {
    data,
    setData,
    status,
    save,
    finalize,
  } = useFormStorage("inspeccion_hidro", {
    tipoFormulario: "hidro",

    cliente: {},
    equipo: {},

    inspeccion: {
      preServicio: [],
      sistemaHidraulicoAceite: [],
      sistemaHidraulicoAgua: [],
      sistemaElectrico: [],
      sistemaSuccion: [],
    },

    estadoEquipoPuntos: [],
    observaciones: "",
    estadoEquipo: "",
    firmas: {},
  });

  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  const handleFinalize = () => {
    finalize();
  };

  /* ======================================================
     AUTO PDF SI VIENE DESDE HISTORIAL (?pdf=1)
     (NO genera PDF aquí, solo prepara el HTML)
  ====================================================== */
  useEffect(() => {
    if (params.get("pdf") === "1" && status === "completado") {
      // No hacemos nada aquí todavía
      // El PDF se genera SOLO desde html2pdf
    }
  }, [status, params]);

  return (
    <>
      {/* ======================================================
          CONTENEDOR PDF (REGLA DE ORO)
          TODO lo que esté aquí SALE en el PDF
      ====================================================== */}
      <div id="pdf-inspeccion-hidro">

        <FormLayout
          title="Inspección Hidrosuccionador"
          description="Hoja de inspección técnica del equipo hidrosuccionador"
          status={status}
          onSave={save}
          onFinalize={handleFinalize}
        >
          {/* ================= CLIENTE ================= */}
          <ClientDataSection
            data={data.cliente}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                cliente: {
                  ...prev.cliente,
                  [e.target.name]: e.target.value,
                },
              }))
            }
          />

          {/* ================= EQUIPO ================= */}
          <EquipmentDataSection
            data={data.equipo}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                equipo: {
                  ...prev.equipo,
                  [e.target.name]: e.target.value,
                },
              }))
            }
          />

          {/* ============ ESTADO DEL EQUIPO (PUNTOS) ============ */}
          <EstadoEquipoSection
            puntos={data.estadoEquipoPuntos}
            onChange={(puntos) =>
              setData((prev) => ({
                ...prev,
                estadoEquipoPuntos: puntos,
              }))
            }
          />

          {/* ================= CHECKLISTS ================= */}
          <ChecklistSection
            title="1. Pruebas de encendido"
            items={preServicio}
            data={data.inspeccion.preServicio}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                inspeccion: {
                  ...prev.inspeccion,
                  preServicio: val,
                },
              }))
            }
          />

          <ChecklistSection
            title="A. Sistema hidráulico (Aceite)"
            items={sistemaHidraulicoAceite}
            data={data.inspeccion.sistemaHidraulicoAceite}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                inspeccion: {
                  ...prev.inspeccion,
                  sistemaHidraulicoAceite: val,
                },
              }))
            }
          />

          <ChecklistSection
            title="B. Sistema hidráulico (Agua)"
            items={sistemaHidraulicoAgua}
            data={data.inspeccion.sistemaHidraulicoAgua}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                inspeccion: {
                  ...prev.inspeccion,
                  sistemaHidraulicoAgua: val,
                },
              }))
            }
          />

          <ChecklistSection
            title="C. Sistema eléctrico / electrónico"
            items={sistemaElectrico}
            data={data.inspeccion.sistemaElectrico}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                inspeccion: {
                  ...prev.inspeccion,
                  sistemaElectrico: val,
                },
              }))
            }
          />

          <ChecklistSection
            title="D. Sistema de succión"
            items={sistemaSuccion}
            data={data.inspeccion.sistemaSuccion}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                inspeccion: {
                  ...prev.inspeccion,
                  sistemaSuccion: val,
                },
              }))
            }
          />

          {/* ================= OBSERVACIONES ================= */}
          <section className="bg-white border rounded-xl p-6 space-y-2">
            <h2 className="text-lg font-semibold">
              Observaciones generales
            </h2>
            <textarea
              {...textProps}
              rows={3}
              className="input resize-y"
              value={data.observaciones}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  observaciones: e.target.value,
                }))
              }
            />
          </section>

          {/* ================= ESTADO FINAL ================= */}
          <section className="bg-white border rounded-xl p-6 space-y-2">
            <h2 className="text-lg font-semibold">
              Estado final del equipo
            </h2>
            <select
              className="input"
              value={data.estadoEquipo}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  estadoEquipo: e.target.value,
                }))
              }
            >
              <option value="">Seleccione</option>
              <option value="operativo">Operativo</option>
              <option value="operativo_observaciones">
                Operativo con observaciones
              </option>
              <option value="no_operativo">
                No operativo
              </option>
            </select>
          </section>

          {/* ================= FIRMAS ================= */}
          <SignaturesSection
            data={data.firmas}
            onChange={(val) =>
              setData((prev) => ({
                ...prev,
                firmas: val,
              }))
            }
          />
        </FormLayout>
      </div>

      {/* ======================================================
          BOTONES PDF (SOLO VISUALES, NO AFECTAN FORMULARIO)
      ====================================================== */}
      {status === "completado" && <PdfInspeccionButtons />}
    </>
  );
}
