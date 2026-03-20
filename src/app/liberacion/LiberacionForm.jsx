import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const checklist = {
  "Sistema Mecánico": [
    "Frenos sin fugas",
    "Llantas en buen estado",
    "Tuercas ajustadas",
    "Parabrisas en buen estado",
    "Cinturones de seguridad",
  ],
  "Sistema Eléctrico": [
    "Luces operativas",
    "Luces direccionales",
    "Luces de freno",
    "Bocina",
  ],
  "Seguridad Industrial": [
    "Extintor",
    "Botiquín",
    "Triángulos de seguridad",
    "Chaleco reflectivo",
  ],
  "Área de Carga": [
    "Roll bar en buen estado",
    "Balde en buen estado",
    "Malla de protección",
  ],
};

export default function LiberacionForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente: "",
    conductor: "",
    placa: "",
    vehiculo: "",
    observaciones: "",
    estadoFinal: "",
    checklist: {},
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheck = (key, value) => {
    setForm({
      ...form,
      checklist: {
        ...form.checklist,
        [key]: value,
      },
    });
  };

  const handleSubmit = async () => {
    if (!form.estadoFinal) {
      alert("Selecciona estado final");
      return;
    }

    const { error } = await supabase.from("registros").insert([
      {
        tipo: "liberacion",
        subtipo: "vehiculo",
        estado: form.estadoFinal === "APROBADO" ? "completado" : "borrador",
        data: form,
      },
    ]);

    if (error) {
      alert("Error al guardar");
      console.error(error);
      return;
    }

    alert("Liberación guardada");
    navigate("/liberacion");
  };

  let contadorGlobal = 1;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow space-y-6 max-w-5xl mx-auto">

        <h1 className="text-2xl font-bold text-center">
          Formulario de Liberación de Vehículo
        </h1>

        {/* DATOS GENERALES */}
        <div className="grid md:grid-cols-2 gap-4">
          <input name="cliente" placeholder="Cliente" onChange={handleChange} className="border p-2 rounded" />
          <input name="conductor" placeholder="Conductor" onChange={handleChange} className="border p-2 rounded" />
          <input name="placa" placeholder="Placa" onChange={handleChange} className="border p-2 rounded" />
          <input name="vehiculo" placeholder="Vehículo" onChange={handleChange} className="border p-2 rounded" />
        </div>

        {/* CHECKLIST POR SECCIONES */}
        {Object.entries(checklist).map(([section, items]) => (
          <div key={section} className="space-y-2">

            <h2 className="font-semibold text-lg bg-slate-100 p-2 rounded">
              {section}
            </h2>

            {items.map((label, index) => {
              const key = `${section}-${index}`;
              const numero = contadorGlobal++;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span className="text-sm">
                    <strong>{numero}.</strong> {label}
                  </span>

                  <div className="flex gap-2">
                    {["C", "NC", "NA"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleCheck(key, opt)}
                        className={`px-3 py-1 border rounded text-sm transition ${
                          form.checklist[key] === opt
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* OBSERVACIONES */}
        <textarea
          placeholder="Observaciones"
          className="border p-3 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, observaciones: e.target.value })
          }
        />

        {/* RESULTADO FINAL */}
        <div className="flex gap-4 justify-center">
          {["APROBADO", "NO APROBADO"].map((opt) => (
            <button
              key={opt}
              onClick={() =>
                setForm({ ...form, estadoFinal: opt })
              }
              className={`px-6 py-2 rounded font-semibold ${
                form.estadoFinal === opt
                  ? opt === "APROBADO"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                  : "border"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* BOTONES */}
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white w-full py-3 rounded text-lg"
        >
          Guardar Liberación
        </button>

      </div>
    </div>
  );
}
