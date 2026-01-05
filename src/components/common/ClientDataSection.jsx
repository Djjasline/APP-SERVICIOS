import React from "react";

export default function ClientDataSection({ data, onChange }) {
  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Datos del cliente
        </h2>
        <p className="text-sm text-slate-600">
          Información general del cliente y responsable.
        </p>
      </div>

      {/* FORM */}
      <div className="grid md:grid-cols-2 gap-4">
        <input
          {...textProps}
          name="cliente"
          value={data.cliente || ""}
          onChange={onChange}
          placeholder="Nombre del cliente"
          className="input"
        />

        <input
          {...textProps}
          name="cargo"
          value={data.cargo || ""}
          onChange={onChange}
          placeholder="Cargo del responsable"
          className="input"
        />

        <input
          {...textProps}
          name="contacto"
          value={data.contacto || ""}
          onChange={onChange}
          placeholder="Nombre del contacto"
          className="input"
        />

        <input
          {...textProps}
          name="telefono"
          value={data.telefono || ""}
          onChange={onChange}
          placeholder="Teléfono"
          className="input"
        />

        <input
          {...textProps}
          type="email"
          name="correo"
          value={data.correo || ""}
          onChange={onChange}
          placeholder="Correo electrónico"
          className="input"
        />

        <input
          {...textProps}
          name="ubicacion"
          value={data.ubicacion || ""}
          onChange={onChange}
          placeholder="Ubicación del servicio"
          className="input"
        />

        <input
          {...textProps}
          name="direccion"
          value={data.direccion || ""}
          onChange={onChange}
          placeholder="Dirección"
          className="input md:col-span-2"
        />
      </div>
    </section>
  );
}
