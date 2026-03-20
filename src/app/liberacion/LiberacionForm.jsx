import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";

const checklist = {
  "Sistema Mecánico": [
    "Frenos sin fugas (Liqueos)",
    "Llantas: Delanteras / Traseras ",
    "Llanta emergencia ",
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

  // 🔄 SYNC AUTOMÁTICO
  useEffect(() => {
    const syncPendientes = async () => {
      const pendientes = JSON.parse(localStorage.getItem("pending_registros") || "[]");

      if (pendientes.length === 0) return;

      for (let registro of pendientes) {
        const { error } = await supabase.from("registros").insert([registro]);
        if (error) return;
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

  // 🔥 PDF PRO
  const generarPDF = (data, id) => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 10;

    doc.setFontSize(11);
    doc.text("FORMATO PARA INSPECCIÓN CAMIONETAS", 105, y, { align: "center" });

    y += 5;
    doc.setFontSize(8);
    doc.text("Vehículo liviano menor a 4500kg", 105, y, { align: "center" });

    y += 10;

    const drawRow = (l1, v1, l2, v2) => {
      doc.rect(10, y, 40, 6);
      doc.text(l1, 11, y + 4);

      doc.rect(50, y, 50, 6);
      doc.text(v1 || "", 51, y + 4);

      doc.rect(100, y, 40, 6);
      doc.text(l2, 101, y + 4);

      doc.rect(140, y, 60, 6);
      doc.text(v2 || "", 141, y + 4);

      y += 6;
    };

    drawRow("Cliente", data.cliente, "Conductor", data.conductor);
    drawRow("Placa", data.placa, "Vehículo", data.vehiculo);
    drawRow("Inspector", data.inspector, "Estado", data.estadoFinal);

    y += 5;

    doc.setFillColor(0, 102, 204);
    doc.rect(10, y, 190, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Condiciones Generales del Vehículo", 12, y + 4);
    doc.setTextColor(0, 0, 0);

    y += 8;

    Object.entries(data.checklist).forEach(([key, value]) => {
      doc.rect(10, y, 130, 5);
      doc.text(key, 11, y + 3.5);

      ["C", "NC", "NA"].forEach((col, i) => {
        const x = 140 + i * 20;
        doc.rect(x, y, 20, 5);

        if (value === col) {
          doc.setFillColor(
            col === "C" ? 0 : col === "NC" ? 255 : 150,
            col === "C" ? 102 : col === "NC" ? 0 : 150,
            col === "C" ? 204 : col === "NC" ? 0 : 150
          );
          doc.rect(x, y, 20, 5, "F");
          doc.setTextColor(255, 255, 255);
          doc.text(col, x + 7, y + 3.5);
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text(col, x + 7, y + 3.5);
        }
      });

      y += 5;
    });

    y += 5;

    doc.text("Observaciones:", 10, y);
    y += 4;

    const obs = doc.splitTextToSize(data.observaciones || "", 180);
    doc.text(obs, 10, y);

    y += obs.length * 4 + 5;

    if (data.firmaInspector) {
      doc.text("Firma Inspector:", 10, y);
      y += 3;
      doc.addImage(data.firmaInspector, "PNG", 10, y, 60, 25);
    }

    const fileName = `Liberacion_${data.placa || "sin_placa"}.pdf`;

    // DESCARGA
    doc.save(fileName);

    // GUARDAR LOCAL
    const pdfBase64 = doc.output("datauristring");
    const stored = JSON.parse(localStorage.getItem("pdf_liberaciones") || "{}");
    stored[id] = pdfBase64;
    localStorage.setItem("pdf_liberaciones", JSON.stringify(stored));
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

    // 🔥 GENERAR PDF
    generarPDF({ ...form, firmaInspector: firma }, inserted.id);

    alert("Liberación guardada correctamente");
    setLoading(false);
    navigate("/liberacion");
  };

  let contador = 1;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-[794px] mx-auto bg-white p-6 shadow-lg border">

        {/* TODO TU JSX ORIGINAL SIN CAMBIOS */}

        {/* BOTONES */}
        <div className="flex justify-between mt-6">

          <button
            onClick={() => navigate("/liberacion")}
            className="px-5 py-2 rounded border text-gray-700 hover:bg-gray-100 transition"
          >
            Volver
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded bg-blue-600 text-white font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            Guardar informe
          </button>

        </div>

      </div>
    </div>
  );
}
