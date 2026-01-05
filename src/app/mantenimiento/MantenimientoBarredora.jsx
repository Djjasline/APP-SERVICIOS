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
  sistemaBarrido,
  sistemaHidraulico,
  sistemaElectrico,
  postServicio,
} from "./schemas/mantenimientoBarredoraSchema";

export default function MantenimientoBarredora() {
  const { data, setData, status, save, finalize } =
    useFormStorage("mantenimiento_barredora", {
      cliente: {},
      equipo: {},
      mantenimiento: {
        preServicio: [],
        sistemaBarrido: [],
        sistemaHidraulico: [],
        sistemaElectrico: [],
        postServicio: [],
        repuestos: [],
      },
      manoObra: "",
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
      title="Mantenimiento Barredora"
      description="Formato de servicio de mantenimiento del equipo barredora"
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

      {/* PRE SERVICIO */}
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

      {/* SISTEMAS */}
      <ChecklistSection
        title="A. Sistema de barrido"
        items={sistemaBarrido}
        data={data.mantenimiento.sistemaBarrido}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, sistemaBarrido: v },
          }))
        }
      />

      <ChecklistSection
        title="B. Sistema hidráulico"
        items={sistemaHidraulico}
        data={data.mantenimiento.sistemaHidraulico}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, sistemaHidraulico: v },
          }))
        }
      />

      <ChecklistSection
        title="C. Sistema eléctrico"
        items={sistemaElectrico}
        data={data.mantenimiento.sistemaElectrico}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, sistemaElectrico: v },
          }))
        }
      />

      {/* REPUESTOS */}
      <RepuestosTable
        data={data.mantenimiento.repuestos}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, repuestos: v },
          }))
        }
      />

      {/* POST SERVICIO */}
      <ChecklistSection
        title="D. Pruebas post-servicio"
        items={postServicio}
        data={data.mantenimiento.postServicio}
        onChange={(v) =>
          setData((p) => ({
            ...p,
            mantenimiento: { ...p.mantenimiento, postServicio: v },
          }))
        }
      />

      {/* MANO DE OBRA */}
      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Mano de obra
        </h2>
        <textarea
          {...textProps}
          rows={3}
          className="input resize-y"
          value={data.manoObra}
          onChange={(e) =>
            setData((p) => ({ ...p, manoObra: e.target.value }))
          }
          placeholder="Detalle de horas trabajadas y actividades"
        />
      </section>

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
