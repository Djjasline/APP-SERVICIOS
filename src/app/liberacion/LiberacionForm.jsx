import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

const checklist = {
  "Sistema Mecánico": [
    "Frenos sin fugas (Liqueos)",
    "Llantas: Delanteras / Traseras (%)",
    "Llanta emergencia (%)",
    "Tuercas completas y ajustadas",
    "Parabrisas, vidrios y espejos (no trizados)",
    "Asientos con apoya cabezas",
    "Cinturones de seguridad (3 puntos)",
    "Limpia parabrisas y plumas operativos",
    "No liqueos (combustible, aceite, fluido)",
    "Kit básico de herramientas",
    "Agua limpia parabrisas",
    "Gato, palanca, llave de ruedas",
  ],
  "Sistema Eléctrico & Otros": [
    "Cableado eléctrico en buen estado",
    "Batería y bornes ajustados (sin corrosión)",
    "Luces delanteras altas y bajas",
    "Luces direccionales",
    "Luces de freno",
    "Luces de reversa",
    "Alarma de retro",
    "Luz interior / tablero",
    "Luces de parqueo",
    "Bocina",
    "Certificado o revisión mecánica",
  ],
  "Accesorios de Seguridad Industrial": [
    "Arrestallamas",
    "Extintor tipo PQS (≥ 5 lbs)",
    "Botiquín de primeros auxilios",
    "Triángulos o conos (mínimo 2)",
    "Chaleco reflectivo",
    "Linterna con batería y repuesto",
    "Cables pasa corriente",
  ],
  "Estado / Área de Carga": [
    "Roll bar asegurado al chasis",
    "Balde o cajón en buen estado",
    "Malla de protección en roll bar",
  ],
};

export default function LiberacionForm() {
  const navigate = useNavigate();
const sigRef = useRef();
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
      alert("Selecciona resultado final");
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

  let contador = 1;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

  <div className="max-w-[794px] mx-auto bg-white p-6 shadow-lg border">

        {/* HEADER */}
        <div className="border border-gray-400 p-4">
          <div className="flex items-center">
            <img src="/astap-logo.jpg" className="w-16 mr-4" />
            <div className="flex-1 text-center">
              <h1 className="font-bold text-base">
                FORMATO PARA INSPECCIÓN CAMIONETAS
              </h1>
              <p className="text-xs">
                Vehículo liviano menor a 4500kg
              </p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>

        {/* TABLA DE DATOS */}
      <div className="border border-gray-500 text-sm w-full overflow-hidden">

  {/* FILA 1 */}
  <div className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr]">
    <div className="border p-2 bg-gray-100">Fecha Inspección:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Lugar Inspección:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Fecha Caducidad:</div>
    <input className="border p-2 w-full" />
  </div>

  {/* FILA 2 */}
  <div className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr]">
    <div className="border p-2 bg-gray-100">Nombre Conductor:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Tipo Licencia:</div>
    <div className="border p-2 flex gap-1 justify-center">
      {["B","C","D","E"].map((l) => (
        <button key={l} className="w-7 h-7 border text-xs">{l}</button>
      ))}
    </div>

    <div className="border p-2 bg-gray-100">Fecha Caducidad:</div>
    <input className="border p-2 w-full" />
  </div>

  {/* FILA 3 */}
  <div className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr]">
    <div className="border p-2 bg-gray-100">Empr. Contratista:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Placas:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Marca:</div>
    <input className="border p-2 w-full" />
  </div>

  {/* FILA 4 */}
  <div className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr]">
    <div className="border p-2 bg-gray-100">GDP/MANT.:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Tipo Vehículo:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Color:</div>
    <input className="border p-2 w-full" />
  </div>

  {/* FILA 5 */}
  <div className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr]">
    <div className="border p-2 bg-gray-100">Curso Manejo Def:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Año:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Fecha Caducidad:</div>
    <input className="border p-2 w-full" />
  </div>

  {/* FILA 6 */}
  <div className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr]">
    <div className="border p-2 bg-gray-100">Matrícula:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Año:</div>
    <input className="border p-2 w-full" />

    <div className="border p-2 bg-gray-100">Fecha Caducidad:</div>
    <input className="border p-2 w-full" />
  </div>

</div>
        {/* TITULO CORRECTO */}
        <h2 className="bg-blue-600 text-white px-3 py-2 font-semibold">
          Condiciones Generales del Vehículo
        </h2>

        {/* LEYENDA */}
        <div className="flex justify-end gap-4 text-xs font-bold">
          <span className="text-blue-600">C</span>
          <span className="text-red-600">NC</span>
          <span className="text-gray-500">NA</span>
        </div>

        {/* CHECKLIST */}
        {Object.entries(checklist).map(([section, items]) => (
          <div key={section}>
            <div className="bg-blue-600 text-white px-2 py-1 text-sm font-semibold">
              {section}
            </div>

            {items.map((item, index) => {
              const key = `${section}-${index}`;
              const numero = contador++;

              return (
                <div key={key} className="flex border-b items-center">
                  <div className="flex-1 px-2 py-1 text-sm">
                    {numero}. {item}
                  </div>

                  <div className="flex">
                    {["C","NC","NA"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleCheck(key, opt)}
                        className={`w-10 h-8 border text-xs font-bold ${
                          form.checklist[key] === opt
                            ? opt === "C"
                              ? "bg-blue-600 text-white"
                              : opt === "NC"
                              ? "bg-red-600 text-white"
                              : "bg-gray-400 text-white"
                            : ""
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

    <div className="grid grid-cols-2 gap-6 items-end">

  {/* RESULTADO */}
  <div className="flex justify-center gap-4">
    {["APROBADO", "NO APROBADO"].map((opt) => (
      <button
        key={opt}
        onClick={() => setForm({ ...form, estadoFinal: opt })}
        className={`px-6 py-2 rounded font-bold ${
          form.estadoFinal === opt
            ? opt === "APROBADO"
              ? "bg-blue-600 text-white"
              : "bg-red-600 text-white"
            : "border"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>

  {/* FIRMA */}
  <div className="text-sm">

  <p className="font-semibold mb-1">Firma del Inspector</p>

  {/* FIRMA DIGITAL */}
  <div className="border bg-white">
    <SignatureCanvas
      penColor="black"
      canvasProps={{
        width: 300,
        height: 120,
        className: "w-full h-[120px]"
      }}
      ref={sigRef}
    />
  </div>

  {/* BOTONES */}
  <div className="flex justify-between mt-2">
    <button
      type="button"
      onClick={() => sigRef.current.clear()}
      className="text-xs text-red-600"
    >
      Limpiar
    </button>
  </div>

  {/* NOMBRE */}
  <input
    type="text"
    placeholder="Nombre del inspector"
    className="border w-full p-2 mt-2"
    onChange={(e) =>
      setForm({ ...form, inspector: e.target.value })
    }
  />

</div>

</div>
        

        {/* GUARDAR */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full py-3 rounded font-bold"
        >
          Guardar Liberación
        </button>

      </div>
    </div>
  );
}
