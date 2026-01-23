import React from "react";
import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import SignaturesSection from "@components/common/SignaturesSection";
import ChecklistSection from "@components/common/ChecklistSection";
import EstadoEquipoSection from "@components/common/EstadoEquipoSection";

import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "./schemas/inspeccionHidroSchema";

import { generateInspectionPdf } from "./utils/generateInspectionPdf";

export default function InspeccionHidro() {
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

  /* =============================
     FINALIZAR INSPECCIÓN (FIX)
     PDF → luego finalize()
  ============================== */
  const handleFinalize = async () => {
    generateInspectionPdf(data); // ✅ primero PDF
    finalize();                  // ✅ luego navegación / guardado
  };

  return (
    <FormLayout
      title="Inspección Hidrosuccionador"
      description="Hoja de inspección técnica del equipo hidrosuccionador"
      status={status}
      onSave={save}
      onFinalize={handleFinalize}
    >
      {/* DATOS DEL CLIENTE */}
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

      {/* DATOS DEL EQUIPO */}
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

      {/* ESTADO DEL EQUIPO (PUNTOS) */}
      <EstadoEquipoSection
        puntos={data.estadoEquipoPuntos}
        onChange={(puntos) =>
          setData((prev) => ({
            ...prev,
            estadoEquipoPuntos: puntos,
          }))
        }
      />

      {/* CHECKLISTS */}
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

      {/* OBSERVACIONES */}
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

      {/* ESTADO FINAL */}
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

      {/* FIRMAS */}
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
  );
}
