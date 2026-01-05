import React from "react";

export default function EquipmentDataSection({ data, onChange }) {
  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-4">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Datos del equipo
        </h2>
        <p className="text-sm text-slate-600">
          Información técnica del equipo atendido.
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tipo de equipo */}
        <input
          {...textProps}
          name="tipoEquipo"
          value={data.tipoEquipo || ""}
          onChange={onChange}
          placeholder="Tipo de equipo (Hidro, Barredora, Cámara)"
          className="input"
        />

        {/* Marca */}
        <input
          {...textProps}
          name="marca"
          value={data.marca || ""}
          onChange={onChange}
          placeholder="Marca"
          className="input"
        />

        {/* Modelo */}
        <input
          {...textProps}
          name="modelo"
          value={data.modelo || ""}
          onChange={onChange}
          placeholder="Modelo"
          className="input"
        />

        {/* Número de serie */}
        <input
          {...textProps}
          name="numeroSerie"
          value={data.numeroSerie || ""}
          onChange={onChange}
          placeholder="Número de serie"
          className="input"
        />

        {/* Año */}
        <input
          type="number"
          name="anio"
          value={data.anio || ""}
          onChange={onChange}
          placeholder="Año de fabricación"
          className="input"
        />

        {/* Placa */}
        <input
          {...textProps}
          name="placa"
          value={data.placa || ""}
          onChange={onChange}
          placeholder="Placa"
          className="input"
        />

        {/* VIN / Chasis */}
        <input
          {...textProps}
          name="vin"
          value={data.vin || ""}
          onChange={onChange}
          placeholder="VIN / Chasis"
          className="input"
        />

        {/* Kilometraje */}
        <input
          type="number"
          name="kilometraje"
          value={data.kilometraje || ""}
          onChange={onChange}
          placeholder="Kilometraje"
          className="input"
        />

        {/* Horas chasis */}
        <input
          type="number"
          name="horasChasis"
          value={data.horasChasis || ""}
          onChange={onChange}
          placeholder="Horas de trabajo chasis"
          className="input"
        />

        {/* Horas módulo */}
        <input
          type="number"
          name="horasModulo"
          value={data.horasModulo || ""}
          onChange={onChange}
          placeholder="Horas de trabajo módulo"
          className="input"
        />
      </div>
    </section>
  );
}
