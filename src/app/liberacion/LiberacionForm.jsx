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
      alert("Debes seleccionar APROBADO o NO APROBADO");
      return;
    }

    const ncCount = Object.values(form.checklist).filter(v => v === "NC").length;

    if (form.estadoFinal === "APROBADO" && ncCount > 0) {
      const confirmacion = confirm(
        `Hay ${ncCount} ítems NO CUMPLE. ¿Seguro que deseas aprobar?`
      );
      if (!confirmacion) return;
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

    alert("Liberación guardada correctamente");
    navigate("/liberacion");
  };

  let contadorGlobal = 1;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow space-y-6 max-w-5xl mx-auto">

        {/* HEADER */}
       <div className="border border-gray-400 text-sm">

  {/* FILA 1 */}
  <div className="grid grid-cols-4">
    
    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Fecha Inspección
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Lugar Inspección
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border col-span-2">
      <div className="bg-gray-100 px-2 py-2 w-1/3 border-r">
        Fecha Caducidad
      </div>
      <input className="w-2/3 p-2 outline-none" />
    </div>

  </div>

  {/* FILA 2 */}
  <div className="grid grid-cols-4">

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Nombre Conductor
      </div>
      <input name="conductor" onChange={handleChange} className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border items-center">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Tipo Licencia
      </div>
      <div className="flex gap-1 p-1">
        {["B","C","D","E"].map((l) => (
          <button
            key={l}
            className="px-2 py-1 border text-xs hover:bg-blue-100"
          >
            {l}
          </button>
        ))}
      </div>
    </div>

    <div className="flex border col-span-2">
      <div className="bg-gray-100 px-2 py-2 w-1/3 border-r">
        Fecha Caducidad
      </div>
      <input className="w-2/3 p-2 outline-none" />
    </div>

  </div>

  {/* FILA 3 */}
  <div className="grid grid-cols-4">

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Empresa / Contratista
      </div>
      <input name="cliente" onChange={handleChange} className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Placa
      </div>
      <input name="placa" onChange={handleChange} className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Marca
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Color
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

  </div>

  {/* FILA 4 */}
  <div className="grid grid-cols-4">

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Tipo Vehículo
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Modelo
      </div>
      <input name="vehiculo" onChange={handleChange} className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Año
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

    <div className="flex border">
      <div className="bg-gray-100 px-2 py-2 w-1/2 border-r">
        Matrícula
      </div>
      <input className="w-1/2 p-2 outline-none" />
    </div>

  </div>

</div>

        {/* LEYENDA */}
        <div className="flex justify-end gap-4 text-xs font-semibold">
          <span className="text-blue-600">C = CUMPLE</span>
          <span className="text-red-600">NC = NO CUMPLE</span>
          <span className="text-gray-500">NA = NO APLICA</span>
        </div>

        {/* CHECKLIST */}
        {Object.entries(checklist).map(([section, items]) => (
          <div key={section} className="space-y-2">

            <h2 className="font-semibold text-lg bg-blue-50 text-blue-700 p-2 rounded">
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
                  <span className="text-sm text-slate-700">
                    <strong>{numero}.</strong> {label}
                  </span>

                  <div className="flex gap-2">
                    {["C", "NC", "NA"].map((opt) => {
                      const styles = {
                        C: "bg-blue-600 text-white",      // 🔵 institucional
                        NC: "bg-red-600 text-white",
                        NA: "bg-gray-400 text-white",
                      };

                      return (
                        <button
                          key={opt}
                          onClick={() => handleCheck(key, opt)}
                          className={`px-3 py-1 rounded text-xs font-bold transition ${
                            form.checklist[key] === opt
                              ? styles[opt]
                              : "border hover:bg-gray-100"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
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
              className={`px-6 py-2 rounded font-semibold transition ${
                form.estadoFinal === opt
                  ? opt === "APROBADO"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-red-600 text-white shadow-lg"
                  : "border hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* BOTÓN */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full py-3 rounded text-lg font-semibold hover:bg-blue-700 transition"
        >
          Guardar Liberación
        </button>

      </div>
    </div>
  );
}
