import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

/* ============================= */
/* STORAGE */
/* ============================= */
const STORAGE_KEY = "serviceReport_history";

/* ============================= */
/* COMPONENTE */
/* ============================= */
export default function ServiceReportCreation() {
  const navigate = useNavigate();

  /* ============================= */
  /* HEADER CONFIG */
  /* ============================= */
  const headerConfig = {
    titulo: "Informe General de Servicios",
    codigo: "AST-SRV-001",
    version: "01",
    fecha: new Date().toISOString().slice(0, 10),
  };

  /* ============================= */
  /* MODELO BASE */
  /* ============================= */
  const emptyReport = {
    id: crypto.randomUUID(),
    estado: "borrador",
    fechaCreacion: new Date().toISOString(),
    cliente: {
      cliente: "",
      direccion: "",
      contacto: "",
      telefono: "",
      correo: "",
      fechaServicio: "",
    },
    equipo: {
      tipo: "",
      marca: "",
      modelo: "",
      serie: "",
      placa: "",
      anio: "",
      kilometraje: "",
      horas: "",
      vin: "",
    },
    actividades: [
      { item: "1", titulo: "", detalle: "", imagen: null },
    ],
    conclusiones: "",
    firmas: {
      tecnico: null,
      cliente: null,
    },
  };

  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(emptyReport);

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  /* ============================= */
  /* LOAD HISTORIAL */
  /* ============================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  /* ============================= */
  /* SAVE HISTORIAL */
  /* ============================= */
  const saveToHistory = (estado) => {
    const updated = { ...report, estado };
    const next = [
      updated,
      ...history.filter((r) => r.id !== updated.id),
    ];
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setReport(updated);
  };

  /* ============================= */
  /* HELPERS */
  /* ============================= */
  const updateField = (section, field, value) => {
    setReport((p) => ({
      ...p,
      [section]: { ...p[section], [field]: value },
    }));
  };

  const updateActividad = (i, field, value) => {
    const next = [...report.actividades];
    next[i][field] = value;
    setReport((p) => ({ ...p, actividades: next }));
  };

  const addActividad = () => {
    setReport((p) => ({
      ...p,
      actividades: [
        ...p.actividades,
        {
          item: `${p.actividades.length + 1}`,
          titulo: "",
          detalle: "",
          imagen: null,
        },
      ],
    }));
  };

  const handleImage = (i, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateActividad(i, "imagen", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveSignature = (tipo, ref) => {
    if (!ref.current) return;
    setReport((p) => ({
      ...p,
      firmas: {
        ...p.firmas,
        [tipo]: ref.current
          .getTrimmedCanvas()
          .toDataURL("image/png"),
      },
    }));
  };

  /* ============================= */
  /* PDF REAL */
  /* ============================= */
  const generarPDF = async () => {
    const element = document.getElementById("pdf-content");
    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf().set({
      margin: 0,
      filename: `Informe_${report.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4" },
    }).from(element).save();
  };

  /* ============================= */
  /* RENDER */
  /* ============================= */
  return (
    <div className="min-h-screen bg-slate-100 p-4 space-y-4">

      {/* HISTORIAL */}
      <div className="bg-white border p-3 text-sm">
        <strong>Historial de informes</strong>
        <ul className="mt-2 space-y-1">
          {history.map((h) => (
            <li
              key={h.id}
              className="flex justify-between cursor-pointer hover:bg-slate-100 p-1"
              onClick={() => setReport(h)}
            >
              <span>{h.cliente.cliente || "Sin cliente"}</span>
              <span className="text-xs">{h.estado}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DOCUMENTO */}
      <div
        id="pdf-content"
        className="max-w-6xl mx-auto bg-white p-4 space-y-6 text-sm"
      >
        <ReportHeader {...headerConfig} />

        {/* DATOS CLIENTE */}
        <div className="border border-black">
          {Object.entries(report.cliente).map(([k, v]) => (
            <div key={k} className="grid grid-cols-6 border-b border-black">
              <div className="col-span-1 p-2 font-semibold border-r border-black">
                {k}
              </div>
              <div className="col-span-5 p-1">
                <input
                  className="w-full outline-none"
                  value={v}
                  onChange={(e) =>
                    updateField("cliente", k, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVIDADES */}
        <div className="border border-black">
          <div className="grid grid-cols-12 font-semibold border-b border-black">
            <div className="col-span-1 p-2 border-r">Ítem</div>
            <div className="col-span-5 p-2 border-r">Actividad</div>
            <div className="col-span-6 p-2">Imagen</div>
          </div>

          {report.actividades.map((a, i) => (
            <div key={i} className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 p-2 border-r">{a.item}</div>

              <div className="col-span-5 p-2 border-r">
                <input
                  className="w-full font-semibold outline-none"
                  placeholder="Título"
                  value={a.titulo}
                  onChange={(e) =>
                    updateActividad(i, "titulo", e.target.value)
                  }
                />
                <textarea
                  className="w-full outline-none mt-1"
                  rows={3}
                  placeholder="Detalle"
                  value={a.detalle}
                  onChange={(e) =>
                    updateActividad(i, "detalle", e.target.value)
                  }
                />
              </div>

              <div className="col-span-6 p-2 text-center">
                {a.imagen ? (
                  <img
                    src={a.imagen}
                    alt="actividad"
                    className="max-h-40 mx-auto"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImage(i, e.target.files[0])
                    }
                  />
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addActividad}
            className="m-2 px-3 py-1 border"
          >
            + Agregar actividad
          </button>
        </div>

        {/* CONCLUSIONES */}
        <div className="border border-black p-2">
          <strong>Conclusiones</strong>
          <textarea
            className="w-full outline-none"
            rows={4}
            value={report.conclusiones}
            onChange={(e) =>
              setReport((p) => ({
                ...p,
                conclusiones: e.target.value,
              }))
            }
          />
        </div>

        {/* FIRMAS */}
        <div className="border border-black p-4 grid grid-cols-2 gap-6">
          <div>
            <SignatureCanvas
              ref={sigTecnicoRef}
              canvasProps={{ className: "border-b w-full h-32" }}
              onEnd={() =>
                saveSignature("tecnico", sigTecnicoRef)
              }
            />
            <p className="text-center mt-2">Firma técnico</p>
          </div>

          <div>
            <SignatureCanvas
              ref={sigClienteRef}
              canvasProps={{ className: "border-b w-full h-32" }}
              onEnd={() =>
                saveSignature("cliente", sigClienteRef)
              }
            />
            <p className="text-center mt-2">Firma cliente</p>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate("/")}>Volver</button>
        <button onClick={() => saveToHistory("borrador")}>
          Guardar
        </button>
        <button
          className="bg-green-600 text-white px-3"
          onClick={() => saveToHistory("finalizado")}
        >
          Finalizar
        </button>
        <button
          className="bg-blue-600 text-white px-3"
          onClick={generarPDF}
        >
          PDF
        </button>
      </div>
    </div>
  );
}
