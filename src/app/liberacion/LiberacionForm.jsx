import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const checklist = [
  { id: 1, label: "Frenos sin fugas" },
  { id: 2, label: "Llantas en buen estado" },
  { id: 3, label: "Tuercas ajustadas" },
  { id: 4, label: "Parabrisas en buen estado" },
  { id: 5, label: "Cinturones de seguridad" },
  { id: 6, label: "Luces operativas" },
  { id: 7, label: "Extintor" },
  { id: 8, label: "Botiquín" },
  { id: 9, label: "Triángulos de seguridad" },
  { id: 10, label: "Chaleco reflectivo" },
];

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

  const handleCheck = (id, value) => {
    setForm({
      ...form,
      checklist: {
        ...form.checklist,
        [id]: value,
      },
    });
  };

  const handleSubmit = async () => {
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
      return;
    }

    alert("Liberación guardada");
    navigate("/liberacion");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow space-y-6">

        <h1 className="text-xl font-bold">
          Formulario de Liberación
        </h1>

        {/* DATOS GENERALES */}
        <div className="grid grid-cols-2 gap-4">
          <input name="cliente" placeholder="Cliente" className="border p-2 rounded" />
          <input name="conductor" placeholder="Conductor" className="border p-2 rounded" />
          <input name="placa" placeholder="Placa" className="border p-2 rounded" />
          <input name="vehiculo" placeholder="Vehículo" className="border p-2 rounded" />
        </div>

        {/* CHECKLIST */}
        <div>
          <h2 className="font-semibold mb-2">Checklist</h2>

          {checklist.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-2">

              <span>{item.label}</span>

              <div className="flex gap-2">
                {["C", "NC", "NA"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleCheck(item.id, opt)}
                    className={`px-3 py-1 border rounded ${
                      form.checklist[item.id] === opt
                        ? "bg-indigo-600 text-white"
                        : ""
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* OBSERVACIONES */}
        <textarea
          placeholder="Observaciones"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, observaciones: e.target.value })
          }
        />

        {/* RESULTADO */}
        <div className="flex gap-4">
          {["APROBADO", "NO APROBADO"].map((opt) => (
            <button
              key={opt}
              onClick={() =>
                setForm({ ...form, estadoFinal: opt })
              }
              className={`px-4 py-2 border rounded ${
                form.estadoFinal === opt
                  ? "bg-green-600 text-white"
                  : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* BOTONES */}
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white w-full py-2 rounded"
        >
          Guardar
        </button>

      </div>
    </div>
  );
}
