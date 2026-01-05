import React from "react";
import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import SignaturesSection from "@components/common/SignaturesSection";
import ChecklistSection from "@components/common/ChecklistSection";
import RepuestosTable from "@components/mantenimiento/RepuestosTable";

import {
  preServicio,
  serviciosModulo,
  postServicio,
} from "./schemas/mantenimientoHidroSchema";

export default function MantenimientoHidro() {
  const { data, setData, status, save, finalize } =
    useFormStorage("mantenimiento_hidro", {
      cliente: {},
      equipo: {},
      mantenimiento: {
        preServicio: [],
        serviciosModulo: [],
        postServicio: [],
        repuestos: [],
      },
      otrosTrabajos: "",
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
      title="Mantenimiento Hidrosuccionador"
      description="Formato de servicio de mantenimiento del equipo hidrosuccionador"
      status={status}
      onSave={save}
      onFinalize={finalize}
    >
      <ClientDataSection
        data={data.cliente}
        onChange={(e) =>
          setData((p) => ({
            ...p,
            cliente: { ...p.cliente, [e.target.name]: e.target.value },
          }))
        }
      />

      <EquipmentDataSection
        data={data.equipo}
        onChange={(e) =>
          setData((p) => ({
            ...p,
            equipo: { ...p.equipo, [e.target.name]: e.target.value },
          }))
        }
      />

      <ChecklistSection
        title="1. Pruebas pre-servicio"
        items={preServicio}
        data={data.mantenimiento.preServicio}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, preServicio: v },
          }))
        }
      />

      <ChecklistSection
        title="A. Servicios de módulos"
        items={serviciosModulo}
        data={data.mantenimiento.serviciosModulo}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, serviciosModulo: v },
          }))
        }
      />

      <RepuestosTable
        data={data.mantenimiento.repuestos}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, repuestos: v },
          }))
        }
      />

      <ChecklistSection
        title="B. Pruebas post-servicio"
        items={postServicio}
        data={data.mantenimiento.postServicio}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, postServicio: v },
          }))
        }
      />

      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Otros trabajos</h2>
        <textarea
          {...textProps}
          rows={3}
          className="input resize-y"
          value={data.otrosTrabajos}
          onChange={(e) =>
            setData((p) => ({ ...p, otrosTrabajos: e.target.value }))
          }
        />
      </section>

      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Observaciones generales</h2>
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

      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Estado final del equipo</h2>
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

      <SignaturesSection
        data={data.firmas}
        onChange={(v) =>
          setData((p) => ({ ...p, firmas: v }))
        }
      />
    </FormLayout>
  );
}
