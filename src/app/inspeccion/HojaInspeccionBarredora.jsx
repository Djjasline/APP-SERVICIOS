import React from "react";
import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import SignaturesSection from "@components/common/SignaturesSection";
import ChecklistSection from "@components/common/ChecklistSection";

import {
  preServicio,
  sistemaBarrido,
  sistemaHidraulico,
  sistemaElectrico,
} from "./schemas/inspeccionBarredoraSchema";

export default function InspeccionBarredora() {
  const { data, setData, status, save, finalize } =
    useFormStorage("inspeccion_barredora", {
      cliente: {},
      equipo: {},
      inspeccion: {
        preServicio: [],
        sistemaBarrido: [],
        sistemaHidraulico: [],
        sistemaElectrico: [],
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
      title="Inspección Barredora"
      description="Hoja de inspección técnica del equipo barredora"
      status={status}
      onSave={save}
      onFinalize={finalize}
    >
      <ClientDataSection
        data={data.cliente}
        onChange={(e) =>
          setData((p) => ({ ...p, cliente: { ...p.cliente, [e.target.name]: e.target.value } }))
        }
      />

      <EquipmentDataSection
        data={data.equipo}
        onChange={(e) =>
          setData((p) => ({ ...p, equipo: { ...p.equipo, [e.target.name]: e.target.value } }))
        }
      />

      <ChecklistSection
        title="1. Pruebas pre-servicio"
        items={preServicio}
        data={data.inspeccion.preServicio}
        onChange={(v) =>
          setData((p) => ({ ...p, inspeccion: { ...p.inspeccion, preServicio: v } }))
        }
      />

      <ChecklistSection
        title="A. Sistema de barrido"
        items={sistemaBarrido}
        data={data.inspeccion.sistemaBarrido}
        onChange={(v) =>
          setData((p) => ({ ...p, inspeccion: { ...p.inspeccion, sistemaBarrido: v } }))
        }
      />

      <ChecklistSection
        title="B. Sistema hidráulico"
        items={sistemaHidraulico}
        data={data.inspeccion.sistemaHidraulico}
        onChange={(v) =>
          setData((p) => ({ ...p, inspeccion: { ...p.inspeccion, sistemaHidraulico: v } }))
        }
      />

      <ChecklistSection
        title="C. Sistema eléctrico"
        items={sistemaElectrico}
        data={data.inspeccion.sistemaElectrico}
        onChange={(v) =>
          setData((p) => ({ ...p, inspeccion: { ...p.inspeccion, sistemaElectrico: v } }))
        }
      />

      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Observaciones generales</h2>
        <textarea
          {...textProps}
          rows={3}
          className="input resize-y"
          value={data.observaciones}
          onChange={(e) => setData((p) => ({ ...p, observaciones: e.target.value }))}
        />
      </section>

      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Estado final del equipo</h2>
        <select
          className="input"
          value={data.estadoEquipo}
          onChange={(e) => setData((p) => ({ ...p, estadoEquipo: e.target.value }))}
        >
          <option value="">Seleccione</option>
          <option value="operativo">Operativo</option>
          <option value="operativo_observaciones">Operativo con observaciones</option>
          <option value="no_operativo">No operativo</option>
        </select>
      </section>

      <SignaturesSection
        data={data.firmas}
        onChange={(v) => setData((p) => ({ ...p, firmas: v }))}
      />
    </FormLayout>
  );
}
