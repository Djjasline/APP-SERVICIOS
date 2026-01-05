import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

/* ============================= */
/* STORAGE KEY */
/* ============================= */
const STORAGE_KEY = "serviceReport_full";

/* ============================= */
/* COMPONENTE */
/* ============================= */
export default function ServiceReportCreation() {
  const navigate = useNavigate();

  const headerData = {
    fechaVersion: "26-11-25",
    version: "01",
  };

  /* ============================= */
  /* ESTADO ÚNICO */
/* ============================= */
  const [data, setData] = useState({
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
  });

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  /* ============================= */
  /* LOAD / SAVE */
/* ============================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  /* ============================= */
  /* HANDLERS */
/* ============================= */
  const updateField = (section, field, value) => {
    setData((p) => ({
      ...p,
      [section]: { ...p[section], [field]: value },
    }));
  };

  const updateActividad = (i, field, value) => {
    const next = [...data.actividades];
    next[i][field] = value;
    setData((p) => ({ ...p, actividades: next }));
  };

  const addActividad = () => {
    setData((p) => ({
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

  const saveSignature = (tipo, ref) => {
    if (!ref.current) return;
    setData((p) => ({
      ...p,
      firmas: {
        ...p.firmas,
        [tipo]: ref.current
          .getTrimmedCanvas()
          .toDataURL("image/png"),
      },
    }));
  };

  const clearSignature = (tipo, ref) => {
    if (!ref.current) return;
    ref.current.clear();
    setData((p) => ({
      ...p,
      firmas: { ...p.firmas, [tipo]: null },
    }));
  };

  /* ============================= */
  /* PDF REAL */
/* ============================= */
  const generarPDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .set({
        margin: 10,
        filename: `Informe_Tecnico_${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(element)
      .save();
  };

  /* ============================= */
  /* RENDER */
/* ============================= */
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div
        id="pdf-content"
        className="max-w-6xl mx-auto bg-white p-4 space-y-6 text-sm"
      >
        <ReportHeader data={headerData} />

        {/* CLIENTE */}
        <div className="border border-black">
          {Object.entries(data.cliente).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-6 border-b border-black"
            >
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
                  spellCheck
                />
              </div>
            </div>
          ))}
        </div>

        {/* EQUIPO */}
        <div className="border border-black">
          {Object.entries(data.equipo).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-6 border-b border-black"
            >
              <div className="col-span-1 p-2 font-semibold border-r border-black">
                {k}
              </div>
              <div className="col-span-5 p-1">
                <input
                  className="w-full outline-none"
                  value={v}
                  onChange={(e) =>
                    updateField("equipo", k, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVIDADES */}
        <div className="border border-black">
          <div className="grid grid-cols-12 border-b border-black font-semibold">
            <div className="col-span-1 p-2 border-r border-black">
              Ítem
            </div>
            <div className="col-span-5 p-2 border-r border-black">
              Actividad
            </div>
            <div className="col-span-6 p-2">
              Imagen
            </div>
          </div>

          {data.actividades.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-12 border-b border-black"
            >
              <div className="col-span-1 p-2 border-r border-black">
                {a.item}
              </div>

              <div className="col-span-5 p-2 border-r border-black">
                <input
                  className="w-full outline-none font-semibold"
                  placeholder="Título"
                  value={a.titulo}
                  onChange={(e) =>
                    updateActividad(i, "titulo", e.target.value)
                  }
                  spellCheck
                />
                <textarea
                  className="w-full outline-none mt-1"
                  rows={3}
                  placeholder="Detalle"
                  value={a.detalle}
                  onChange={(e) =>
                    updateActividad(i, "detalle", e.target.value)
                  }
                  spellCheck
                />
              </div>

              <div className="col-span-6 p-2 text-center">
                <input type="file" accept="image/*" />
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
          <p className="font-semibold">Conclusiones</p>
          <textarea
            className="w-full outline-none"
            rows={4}
            value={data.conclusiones}
            onChange={(e) =>
              setData((p) => ({
                ...p,
                conclusiones: e.target.value,
              }))
            }
            spellCheck
          />
        </div>

        {/* FIRMAS */}
        <div className="border border-black p-4 grid grid-cols-2 gap-6">
          <div>
            <SignatureCanvas
              ref={sigTecnicoRef}
              canvasProps={{
                className:
                  "border-b border-black w-full h-32",
              }}
              onEnd={() =>
                saveSignature("tecnico", sigTecnicoRef)
              }
            />
            <p className="text-center mt-2">
              Firma del técnico
            </p>
          </div>

          <div>
            <SignatureCanvas
              ref={sigClienteRef}
              canvasProps={{
                className:
                  "border-b border-black w-full h-32",
              }}
              onEnd={() =>
                saveSignature("cliente", sigClienteRef)
              }
            />
            <p className="text-center mt-2">
              Firma del cliente
            </p>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3">
          <button
            className="border px-4 py-2"
            onClick={() => navigate("/")}
          >
            Volver
          </button>
          <button className="border px-4 py-2">
            Guardar
          </button>
          <button className="bg-green-600 text-white px-4 py-2">
            Finalizar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2"
            onClick={generarPDF}
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
