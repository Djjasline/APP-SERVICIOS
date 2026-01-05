import React from "react";
import FormLayout from "@components/FormLayout";
import useFormStorage from "@/hooks/useFormStorage";

import ClientDataSection from "@components/common/ClientDataSection";
import EquipmentDataSection from "@components/common/EquipmentDataSection";
import SignaturesSection from "@components/common/SignaturesSection";
import ActivitiesSection from "@components/informe/ActivitiesSection";

export default function InformeGeneral() {
  const {
    data,
    setData,
    status,
    save,
    finalize,
  } = useFormStorage("informe_general", {
    cliente: {},
    equipo: {},
    actividades: [],
    notas: "",
    conclusiones: "",
    recomendaciones: "",
    firmas: {},
  });

  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  return (
    <FormLayout
      title="Informe General de Servicios"
      description="Registro general de actividades realizadas durante el servicio"
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

      <ActivitiesSection
        data={data.actividades}
        onChange={(value) =>
          setData((prev) => ({
            ...prev,
            actividades: value,
          }))
        }
      />

      {/* NOTAS */}
      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Notas
        </h2>
        <textarea
          {...textProps}
          rows={3}
          className="input resize-y"
          value={data.notas}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              notas: e.target.value,
            }))
          }
        />
      </section>

      {/* CONCLUSIONES */}
      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Conclusiones
        </h2>
        <textarea
          {...textProps}
          rows={3}
          className="input resize-y"
          value={data.conclusiones}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              conclusiones: e.target.value,
            }))
          }
        />
      </section>

      {/* RECOMENDACIONES */}
      <section className="bg-white border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Recomendaciones
        </h2>
        <textarea
          {...textProps}
          rows={3}
          className="input resize-y"
          value={data.recomendaciones}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              recomendaciones: e.target.value,
            }))
          }
        />
      </section>

      <SignaturesSection
        data={data.firmas}
        onChange={(value) =>
          setData((prev) => ({
            ...prev,
            firmas: value,
          }))
        }
      />
    </FormLayout>
  );
}
