import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reportId = params.get("id");

  const pdfRef = useRef(null);
  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  // ===============================
  // ESTADO COMPLETO DEL INFORME
  // ===============================
  const [data, setData] = useState({
    referenciaContrato: "",
    descripcionContrato: "",
    codigoInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    actividades: [
      { titulo: "", detalle: "", imagen: null }
    ],

    conclusiones: [""],
    recomendaciones: [""],

    equipo: {
      marca: "",
      modelo: "",
      serie: "",
      año: "",
      vin: "",
      placa: "",
      horasModulo: "",
      horasChasis: "",
      kilometraje: "",
    },

    firmas: {
      tecnico: null,
      cliente: null,
    },

    responsables: {
      astap: { nombre: "", cargo: "", telefono: "", correo: "" },
      cliente: { nombre: "", cargo: "", telefono: "", correo: "" },
    },
  });

  // ===============================
  // CARGAR DESDE HISTORIAL
  // ===============================
  useEffect(() => {
    if (!reportId) return;
    const all = JSON.parse(localStorage.getItem("serviceReports") || "[]");
    const found = all.find(r => r.id === reportId);
    if (found) setData(found.data);
  }, [reportId]);

  // ===============================
  // UPDATE PROFUNDO
  // ===============================
  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  // ===============================
  // GUARDAR INFORME
  // ===============================
  const saveReport = (estado = "borrador") => {
    const report = {
      id: reportId || Date.now().toString(),
      estado,
      fecha: new Date().toISOString(),
      data,
    };

    const all = JSON.parse(localStorage.getItem("serviceReports") || "[]");
    const filtered = all.filter(r => r.id !== report.id);
    filtered.push(report);
    localStorage.setItem("serviceReports", JSON.stringify(filtered));

    alert("Informe guardado");
    return report.id;
  };

  // ===============================
  // PDF
  // ===============================
  const generatePDF = async () => {
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(img, "PNG", 0, 0, 210, 297);
    pdf.save(`Informe-${Date.now()}.pdf`);
  };

  // ===============================
  // FIRMAS
  // ===============================
  const saveFirma = (tipo, ref) => {
    if (!ref.current) return;
    update(["firmas", tipo], ref.current.toDataURL());
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded space-y-6" ref={pdfRef}>

        <ReportHeader />

        {/* CLIENTE */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["FECHA DE SERVICIO", "fechaServicio"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="pdf-label">{label}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data[key]}
                    onChange={e => update([key], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIVIDADES */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>ÍTEM</th>
              <th>DESCRIPCIÓN DE ACTIVIDADES</th>
              <th>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input
                    className="pdf-input"
                    placeholder="Título"
                    value={a.titulo}
                    onChange={e => update(["actividades", i, "titulo"], e.target.value)}
                  />
                  <textarea
                    className="pdf-textarea"
                    placeholder="Detalle"
                    value={a.detalle}
                    onChange={e => update(["actividades", i, "detalle"], e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="file"
                    onChange={e =>
                      update(
                        ["actividades", i, "imagen"],
                        e.target.files[0]
                          ? URL.createObjectURL(e.target.files[0])
                          : null
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CONCLUSIONES */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>CONCLUSIONES</th>
              <th>RECOMENDACIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.conclusiones.map((_, i) => (
              <tr key={i}>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.conclusiones[i]}
                    onChange={e => update(["conclusiones", i], e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.recomendaciones[i]}
                    onChange={e => update(["recomendaciones", i], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DESCRIPCIÓN DEL EQUIPO */}
        <table className="pdf-table">
          <thead>
            <tr><th colSpan={2}>DESCRIPCIÓN DEL EQUIPO</th></tr>
          </thead>
          <tbody>
            {Object.entries(data.equipo).map(([k]) => (
              <tr key={k}>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.equipo[k]}
                    onChange={e => update(["equipo", k], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FIRMAS */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SignatureCanvas ref={sigTecnicoRef} />
                <button onClick={() => saveFirma("tecnico", sigTecnicoRef)}>Guardar</button>
              </td>
              <td>
                <SignatureCanvas ref={sigClienteRef} />
                <button onClick={() => saveFirma("cliente", sigClienteRef)}>Guardar</button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* BOTONES */}
        <div className="flex gap-4">
          <button onClick={() => saveReport("borrador")} className="border px-4 py-2">
            Guardar
          </button>
          <button
            onClick={() => {
              saveReport("final");
              generatePDF();
            }}
            className="bg-black text-white px-4 py-2"
          >
            Guardar y PDF
          </button>
          <button onClick={() => navigate("/report-history-management")}>
            Historial
          </button>
        </div>

      </div>
    </div>
  );
}
