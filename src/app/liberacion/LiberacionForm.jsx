import { saveOrUpdateReport } from "@/services/reportService"
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

const checklist = {
  "Sistema Mecánico": [
    "Frenos sin fugas (Liqueos)",
    "Llantas: Delanteras / Traseras",
    "Llanta emergencia",
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

// 🔥 COMPONENTE REUTILIZABLE
const AutoTextarea = ({ name, onChange }) => (
  <textarea
    name={name}
    rows={1}
    onChange={onChange}
    className="w-full resize-none overflow-hidden outline-none px-1 bg-transparent"
    onInput={(e) => {
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
    }}
  />
);

export default function LiberacionForm() {
  const navigate = useNavigate();
  const sigRef = useRef();

  const [loading, setLoading] = useState(false);
  const [licencia, setLicencia] = useState("");

  const [form, setForm] = useState({
    cliente: "",
    conductor: "",
    placa: "",
    vehiculo: "",
    observaciones: "",
    estadoFinal: "",
    inspector: "",
    checklist: {},
  });

  useEffect(() => {
const sync = async () => {
  const pendientes = JSON.parse(localStorage.getItem("pending_registros") || "[]");

  for (let p of pendientes) {
    await saveOrUpdateReport({
      id: p.id || null,
      tipo: p.tipo,
      subtipo: p.subtipo,
      data: p.data,
      estado: p.estado
    });
  }

  localStorage.removeItem("pending_registros");
};
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheck = (key, value) => {
    setForm({
      ...form,
      checklist: { ...form.checklist, [key]: value },
    });
  };

 const handleSubmit = async () => {
  if (!form.estadoFinal) return alert("Selecciona resultado");

  let firma = null;
  if (!sigRef.current.isEmpty()) {
    firma = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
  }

  const estadoFinal =
    form.estadoFinal === "APROBADO" ? "completado" : "borrador";

  const finalData = {
    ...form,
    tipoLicencia: licencia,
    firmaInspector: firma,
  };

  try {
    const result = await saveOrUpdateReport({
      id: null,
      tipo: "liberacion",
      subtipo: "vehiculo",
      data: finalData,
      estado: estadoFinal
    });

    alert("Guardado correctamente");
    navigate("/liberacion");

  } catch (error) {
    console.error(error);

    // 🔥 fallback offline (SIN duplicar)
    let pendientes = JSON.parse(localStorage.getItem("pending_registros") || "[]");

    pendientes.push({
      tipo: "liberacion",
      subtipo: "vehiculo",
      estado: estadoFinal,
      data: finalData
    });

    localStorage.setItem("pending_registros", JSON.stringify(pendientes));

    alert("Guardado offline");
    navigate("/liberacion");
  }
};
  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-[794px] mx-auto bg-white p-6 shadow border">

        {/* HEADER */}
        <div className="border p-4 mb-4">
          <div className="flex items-center">
            <img src="/astap-logo.jpg" className="w-14 mr-4" />
            <div className="flex-1 text-center">
              <h1 className="font-bold text-sm">
                FORMATO PARA INSPECCIÓN CAMIONETAS
              </h1>
              <p className="text-xs">Vehículo liviano menor a 4500kg</p>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="border text-xs mb-4">

          {[
            ["Fecha Inspección:", "fecha", "Lugar Inspección:", "lugar", "Fecha Caducidad:", "cad"],
            ["Nombre Conductor:", "conductor", "Tipo Licencia:", "lic", "Fecha Caducidad:", "cad2"],
            ["Empr. Contratista:", "cliente", "Placas:", "placa", "Marca:", "marca"],
            ["GDP/MANT:", "gdp", "Tipo Vehículo:", "vehiculo", "Color:", "color"],
            ["Curso Manejo Def:", "curso", "Año:", "anio", "Fecha Caducidad:", "cad3"],
            ["Matrícula:", "matricula", "Año:", "anio2", "Fecha Caducidad:", "cad4"],
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr] min-h-[32px]">

              <div className="border bg-gray-100 px-2 flex items-center">{row[0]}</div>
              <div className="border"><AutoTextarea name={row[1]} onChange={handleChange} /></div>

              <div className="border bg-gray-100 px-2 flex items-center">{row[2]}</div>

              <div className="border flex items-center justify-center">
                {row[1] === "conductor" ? (
                  <div className="flex w-full">
                    {["B","C","D","E"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLicencia(l)}
                        className={`flex-1 border text-xs ${
                          licencia === l ? "bg-blue-600 text-white" : ""
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                ) : (
                  <AutoTextarea name={row[3]} onChange={handleChange} />
                )}
              </div>

              <div className="border bg-gray-100 px-2 flex items-center">{row[4]}</div>
              <div className="border"><AutoTextarea name={row[5]} onChange={handleChange} /></div>

            </div>
          ))}

        </div>

        {/* CHECKLIST */}
        {Object.entries(checklist).map(([section, items]) => (
          <div key={section}>
            <h2 className="bg-blue-600 text-white px-2 py-1">{section}</h2>

            {items.map((item, index) => {
              const key = `${section}-${index}`;
              return (
                <div key={key} className="flex justify-between border p-2">
                  <span>{index + 1}. {item}</span>

                  <div className="flex gap-2">
                    {["C","NC","NA"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleCheck(key, opt)}
                        className={`px-2 border ${
                          form.checklist[key] === opt ? "bg-blue-600 text-white" : ""
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
          className="border w-full p-2 mt-4 resize-none"
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
        />

        {/* RESULTADO */}
        <div className="flex justify-center gap-4 mt-4">
          {["APROBADO","NO APROBADO"].map(opt => (
            <button
              key={opt}
              onClick={() => setForm({ ...form, estadoFinal: opt })}
              className={`px-4 py-2 border ${
                form.estadoFinal === opt ? "blue-600 text-white" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* FIRMA */}
        <div className="mt-6">
          <p className="text-sm font-semibold">Firma del Inspector</p>

          <div className="border bg-white">
            <SignatureCanvas ref={sigRef} canvasProps={{ className: "w-full h-[120px]" }} />
          </div>

          <button onClick={() => sigRef.current.clear()} className="text-xs text-red-600">
            Limpiar
          </button>

          <input
            type="text"
            placeholder="Nombre del inspector"
            className="border w-full p-2 mt-2"
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
          />
        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-6">
          <button onClick={() => navigate("/liberacion")} className="border px-4 py-2">
            Volver
          </button>

          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2">
            Guardar informe
          </button>
        </div>

      </div>
    </div>
  );
}
