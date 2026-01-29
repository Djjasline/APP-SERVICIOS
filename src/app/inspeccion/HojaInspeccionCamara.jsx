import React from "react";
import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import SignaturesSection from "@components/common/SignaturesSection";
import ChecklistSection from "@components/common/ChecklistSection";

import {
  preServicio,
  sistemaCamara,
  cableCarrete,
  monitorGrabacion,
} from "./schemas/inspeccionCamaraSchema";

export default function InspeccionCamara() {
  const { data, setData, status, save, finalize } =
    useFormStorage("inspeccion_camara", {
      cliente: {},
      equipo: {},
      inspeccion: {
        preServicio: [],
        sistemaCamara: [],
        cableCarrete: [],
        monitorGrabacion: [],
      },
      observaciones: "",
      estadoEquipo: "",
      firmas: {},
    });

  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  return (
    <FormLayout
      title="Inspección Cámara"
      description="Hoja de inspección técnica de sistema de cámara"
      status={status}
      onSave={save}
      onFinalize={finalize}
    >
      {/* CLIENTE */}
      <ClientDataSection
        data={data.cliente}
        onChange={(e) =>
          setData((p) => ({
            ...p,
            cliente: { ...p.cliente, [e.target.name]: e.target.value },
          }))
        }
      />

      {/* EQUIPO */}
      <EquipmentDataSection
        data={data.equipo}
        onChange={(e) =>
          setData((p) => ({
            ...p,
            equipo: { ...p.equipo, [e.target.name]: e.target.value },
          }))
        }
      />

      {/* CHECKLISTS */}
      <ChecklistSection
        title="1. Pruebas pre-servicio"
        items={preServicio}
        data={data.inspeccion.preServicio}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            inspeccion: { ...p.inspeccion, preServicio: v },
          }))
        }
      />

      <ChecklistSection
        title="A. Sistema de cámara"
        items={sistemaCamara}
        data={data.inspeccion.sistemaCamara}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            inspeccion: { ...p.inspeccion, sistemaCamara: v },
          }))
        }
      />

      <ChecklistSection
        title="B. Cable y carrete"
        items={cableCarrete}
        data={data.inspeccion.cableCarrete}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            inspeccion: { ...p.inspeccion, cableCarrete: v },
          }))
        }
      />

      <ChecklistSection
        title="C. Monitor y grabación"
        items={monitorGrabacion}
        data={data.inspeccion.monitorGrabacion}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            inspeccion: { ...p.inspeccion, monitorGrabacion: v },
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
            setData((p) => ({ ...p, observaciones: e.target.value }))
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
            setData((p) => ({ ...p, estadoEquipo: e.target.value }))
          }
        >
          <option value="">Seleccione</option>
          <option value="operativo">Operativo</option>
          <option value="operativo_observaciones">
            Operativo con observaciones
          </option>
          <option value="no_operativo">No operativo</option>
        </select>
      </section>

      {/* FIRMAS */}
      <SignaturesSection
        data={data.firmas}
        onChange={(v) =>
          setData((p) => ({ ...p, firmas: v }))
        }
      />
    </FormLayout>
  );
}
