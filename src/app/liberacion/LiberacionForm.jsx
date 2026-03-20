import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";

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

export default function LiberacionForm() {
  const navigate = useNavigate();
  const sigRef = useRef();
  const [loading, setLoading] = useState(false);

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

  // 🔄 SYNC
  useEffect(() => {
    const syncPendientes = async () => {
      const pendientes = JSON.parse(localStorage.getItem("pending_registros") || "[]");

      if (pendientes.length === 0) return;

      for (let registro of pendientes) {
        await supabase.from("registros").insert([registro]);
      }

      localStorage.removeItem("pending_registros");
    };

    window.addEventListener("online", syncPendientes);
    return () => window.removeEventListener("online", syncPendientes);
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

  // 🔥 PDF
  const generarPDF = (data, id) => {
    const doc = new jsPDF();
    doc.text("FORMATO PARA INSPECCIÓN CAMIONETAS", 20, 20);
    doc.text(`Cliente: ${data.cliente}`, 20, 30);
    doc.text(`Conductor: ${data.conductor}`, 20, 40);
    doc.text(`Estado: ${data.estadoFinal}`, 20, 50);

    if (data.firmaInspector) {
      doc.addImage(data.firmaInspector, "PNG", 20, 60, 60, 25);
    }

    doc.save(`Liberacion_${id}.pdf`);
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.estadoFinal) {
      alert("Selecciona resultado final");
      return;
    }

    setLoading(true);

    let firma = null;
    if (sigRef.current && !sigRef.current.isEmpty()) {
      firma = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    }

    const payload = {
      tipo: "liberacion",
      subtipo: "vehiculo",
      estado: form.estadoFinal === "APROBADO" ? "completado" : "borrador",
      data: { ...form, firmaInspector: firma },
    };

    const { data: inserted, error } = await supabase
      .from("registros")
      .insert([payload])
      .select()
      .single();

    if (error) {
      const pendientes = JSON.parse(localStorage.getItem("pending_registros") || "[]");
      pendientes.push(payload);
      localStorage.setItem("pending_registros", JSON.stringify(pendientes));

      alert("Guardado sin conexión");
      setLoading(false);
      navigate("/liberacion");
      return;
    }

    generarPDF({ ...form, firmaInspector: firma }, inserted.id);

    alert("Guardado correctamente");
    setLoading(false);
    navigate("/liberacion");
  };

  let contador = 1;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-[794px] mx-auto bg-white p-6 shadow-lg border">

        {/* HEADER CORRECTO */}
        <div className="border border-gray-400 p-4 mb-4">
          <div className="flex items-center">
            <img src="/astap-logo.jpg" className="w-14 mr-4" />
            <div className="flex-1 text-center">
              <h1 className="font-bold text-sm">
                FORMATO PARA INSPECCIÓN CAMIONETAS
              </h1>
              <p className="text-xs">
                Vehículo liviano menor a 4500kg
              </p>
            </div>
            <div className="w-14"></div>
          </div>
        </div>

        {/* DATOS */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <input name="cliente" placeholder="Cliente" onChange={handleChange} className="border p-2"/>
          <input name="conductor" placeholder="Conductor" onChange={handleChange} className="border p-2"/>
          <input name="placa" placeholder="Placa" onChange={handleChange} className="border p-2"/>
          <input name="vehiculo" placeholder="Vehículo" onChange={handleChange} className="border p-2"/>
        </div>

        {/* CHECKLIST */}
        {Object.entries(checklist).map(([section, items]) => (
          <div key={section}>
            <h2 className="bg-blue-600 text-white px-2 py-1">{section}</h2>

            {items.map((item, index) => {
              const key = `${section}-${index}`;
              const numero = contador++;

              return (
                <div key={key} className="flex justify-between border p-2">
                  <span>{numero}. {item}</span>

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
          className="border w-full p-2 mt-4"
          onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
        />

        {/* RESULTADO */}
        <div className="flex justify-center gap-4 mt-4">
          {["APROBADO", "NO APROBADO"].map((opt) => (
            <button
              key={opt}
              onClick={() => setForm({ ...form, estadoFinal: opt })}
              className={`px-4 py-2 border ${
                form.estadoFinal === opt ? "bg-blue-600 text-white" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* FIRMA CORRECTA */}
        <div className="mt-6">

          <p className="text-sm font-semibold mb-1">
            Firma del Inspector
          </p>

          <div className="border bg-white">
            <SignatureCanvas
              penColor="black"
              canvasProps={{ className: "w-full h-[120px]" }}
              ref={sigRef}
            />
          </div>

          <button
            type="button"
            onClick={() => sigRef.current.clear()}
            className="text-xs text-red-600 mt-1"
          >
            Limpiar
          </button>

          <div className="mt-3 border-t pt-1 text-center text-sm">
            {form.inspector || "Nombre del inspector"}
          </div>

          <input
            type="text"
            placeholder="Nombre del inspector"
            className="border w-full p-2 mt-2"
            onChange={(e) =>
              setForm({ ...form, inspector: e.target.value })
            }
          />

        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-6">

          <button
            onClick={() => navigate("/liberacion")}
            className="px-5 py-2 rounded border text-gray-700 hover:bg-gray-100"
          >
            Volver
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded bg-blue-600 text-white ${
              loading ? "opacity-50" : "hover:bg-blue-700"
            }`}
          >
            Guardar informe
          </button>

        </div>

      </div>
    </div>
  );
}
