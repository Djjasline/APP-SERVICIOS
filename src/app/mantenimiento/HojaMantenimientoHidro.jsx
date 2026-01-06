import { useState } from "react";

export default function HojaMantenimientoHidro() {
  const [data, setData] = useState({
    cliente: "",
    descripcion: "",
    observaciones: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...data,
      tipo: "hidro",
      estado: "borrador",
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "mantenimiento_hidro_actual",
      JSON.stringify(payload)
    );

    alert("Mantenimiento guardado como borrador");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-bold">
          Mantenimiento Hidrosuccionador
        </h1>

        <input
          className="input"
          name="cliente"
          placeholder="Cliente"
          value={data.cliente}
          onChange={handleChange}
        />

        <textarea
          className="textarea"
          name="descripcion"
          placeholder="Descripción del mantenimiento"
          rows={4}
          value={data.descripcion}
          onChange={handleChange}
        />

        <textarea
          className="textarea"
          name="observaciones"
          placeholder="Observaciones"
          rows={3}
          value={data.observaciones}
          onChange={handleChange}
        />

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
        >
          Guardar borrador
        </button>
      </div>
    </div>
  );
}
