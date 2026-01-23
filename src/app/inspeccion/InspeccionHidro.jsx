import React from "react";
import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

/* SECCIONES */
import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import EstadoEquipoSection from "@components/common/EstadoEquipoSection";
import ChecklistSection from "@components/common/ChecklistSection";
import SignaturesSection from "@components/common/SignaturesSection";

/* SCHEMA */
import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "./schemas/inspeccionHidroSchema";

/* ✅ BOTONES PDF */
import PdfInspeccionButtons from "./components/PdfInspeccionButtons";

export default function InspeccionHidro() {
  const { data, setData, status, save, finalize } = useFormStorage(
    "inspeccion_hidro",
    {
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
    }
  );

  return (
    <>
      {/* 🔴 CONTENEDOR ÚNICO PARA EL PDF */}
      <div id="pdf-inspeccion-hidro">

        <FormLayout
          title="Inspección Hidrosuccionador"
          description="Hoja de inspección técnica del equipo hidrosuccionador"
          status={status}
          onSave={save}
          onFinalize={finalize}
        >
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

          <EstadoEquipoSection
            puntos={data.estadoEquipoPuntos}
            onChange={(puntos) =>
              setData((prev) => ({
                ...prev,
                estadoEquipoPuntos: puntos,
              }))
            }
          />

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

      {/* ✅ BOTONES SIEMPRE VISIBLES */}
      <PdfInspeccionButtons />
    </>
  );
}
