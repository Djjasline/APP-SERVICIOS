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
      // ✅ CORRECCIÓN AQUÍ
      firmas: {
        tecnico: "",
        cliente: "",
      },
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

      {/* SISTEMA BARRIDO */}
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

      {/* SISTEMA HIDRÁULICO */}
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

      {/* SISTEMA ELÉCTRICO */}
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

      {/* POST SERV
