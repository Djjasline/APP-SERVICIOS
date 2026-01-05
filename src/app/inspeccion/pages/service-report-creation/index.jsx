import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

/* ============================= */
/* STORAGE */
/* ============================= */
const STORAGE_KEY = "serviceReport_history";

/* ============================= */
/* COMPONENTE PRINCIPAL */
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
    fecha: "26-11-25",
  };

  /* ============================= */
  /* MODELO BASE */
  /* ============================= */
  const emptyReport = {
    id: crypto.randomUUID(),
    estado: "borrador",
    cliente: {},
    actividades: [
      { item: "1", titulo: "", detalle: "", imagen: null },
    ],
    conclusiones: "",
    firmas: { tecnico: null, cliente: null },
  };

  const [report, setReport] = useState(emptyReport);
  const [history, setHistory] = useState([]);

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  /* ============================= */
  /* HISTORIAL */
  /* ============================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

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
  const updateCliente = (field, value) => {
    setReport((p) => ({
      ...p,
      cliente: { ...p.cliente, [field]: value },
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
  /* PDF */
  /* ============================= */
  const generarPDF = async () => {
    await new Promise((r) => requestAnimationFrame(r));
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

      {/* ================= HISTORIAL ================= */}
      <div className="bg-white border p-3 text-sm">
        <strong>Historial</strong>
        <ul className="mt-2 space-y-1">
          {history.map((h) => (
            <li
              key={h.id}
              className="flex justify-between cursor-pointer hover:bg-slate-100 p-1"
              onClick={() => setReport(h)}
            >
              <span>{h.cliente?.nombreCliente || "Sin cliente"}</span>
              <span className="text-xs">{h.estado}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= DOCUMENTO PDF ================= */}
      <div
        id="pdf-content"
        className="max-w-6xl mx-auto bg-white p-4 space-y-6 text-xs"
      >
        {/* HEADER */}
        <ReportHeader {...headerConfig} />

        {/* ================= DATOS GENERALES ================= */}
        <div className="border border-black">
          {[
            ["REFERENCIA DE CONTRATO", "referencia"],
            ["DESCRIPCIÓN", "descripcion"],
            ["Cod. INF.", "codigoInf"],
            ["UBICACIÓN", "ubicacion"],
            ["TÉCNICO RESPONSABLE", "tecnico"],
            ["CLIENTE", "nombreCliente"],
            ["RESPONSABLE CLIENTE", "responsableCliente"],
          ].map(([label, field]) => (
            <div
              key={field}
              className="grid grid-cols-12 border-b border-black"
            >
              <div className="col-span-3 border-r border-black p-2 font-semibold">
                {label}
              </div>
              <div className="col-span-9 p-1">
                <input
                  className="w-full outline-none"
                  value={report.cliente[field] || ""}
                  onChange={(e) =>
                    updateCliente(field, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* ================= ACTIVIDADES ================= */}
        <div className="border border-black">
          <div className="grid grid-cols-12 font-semibold border-b border-black text-center">
            <div className="col-span-1 border-r p-2">ÍTEM</div>
            <div className="col-span-7 border-r p-2">
              DESCRIPCIÓN DE ACTIVIDADES
            </div>
            <div className="col-span-4 p-2">
              EVIDENCIA FOTOGRÁFICA
            </div>
          </div>

          {report.actividades.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-12 border-b border-black"
            >
              <div className="col-span-1 border-r p-2 text-center">
                {a.item}
              </div>

              <div className="col-span-7 border-r p-2">
                <input
                  className="w-full outline-none font-semibold mb-1"
                  placeholder="Título"
                  value={a.titulo}
                  onChange={(e) =>
                    updateActividad(i, "titulo", e.target.value)
                  }
                />
                <textarea
                  className="w-full outline-none resize-none"
                  rows={4}
                  placeholder="Detalle"
                  value={a.detalle}
                  onChange={(e) =>
                    updateActividad(i, "detalle", e.target.value)
                  }
                />
              </div>

              <div className="col-span-4 p-2 text-center">
                {a.imagen ? (
                  <img
                    src={a.imagen}
                    alt="Evidencia"
                    className="max-h-40 mx-auto"
                  />
                ) : (
                  <label className="cursor-pointer underline">
                    Agregar imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImage(i, e.target.files[0])
                      }
                    />
                  </label>
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

        {/* ================= CONCLUSIONES ================= */}
        <div className="border border-black p-2">
          <strong>CONCLUSIONES</strong>
          <textarea
            className="w-full outline-none resize-none"
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

        {/* ================= FIRMAS ================= */}
        <div className="border border-black p-4 grid grid-cols-2 gap-6">
          <div>
            <SignatureCanvas
              ref={sigTecnicoRef}
              canvasProps={{ className: "border-b w-full h-32" }}
              onEnd={() =>
                saveSignature("tecnico", sigTecnicoRef)
              }
            />
            <p className="text-center mt-2">Firma Técnico</p>
          </div>

          <div>
            <SignatureCanvas
              ref={sigClienteRef}
              canvasProps={{ className: "border-b w-full h-32" }}
              onEnd={() =>
                saveSignature("cliente", sigClienteRef)
              }
            />
            <p className="text-center mt-2">Firma Cliente</p>
          </div>
        </div>
      </div>

      {/* ================= BOTONES ================= */}
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
