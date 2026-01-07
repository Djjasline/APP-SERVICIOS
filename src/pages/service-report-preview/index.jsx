// APP-SERVICIOS/src/pages/service-report-preview/index.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportPreview() {
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (!current) {
      navigate("/");
      return;
    }
    setReport(current);
  }, [navigate]);

  const generatePDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Reporte_Tecnico_Servicio.pdf");
  };

  if (!report) return null;

  const d = report.data;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* BOTONES */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/service-report-history")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={generatePDF}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

        {/* ================= PREVIEW PDF ================= */}
        <div
          ref={pdfRef}
          className="bg-white p-6 shadow space-y-6"
        >
          <ReportHeader data={d} />

          {/* DATOS CLIENTE */}
          <table className="pdf-table">
            <tbody>
              {[
                ["CLIENTE", d.cliente],
                ["DIRECCIÓN", d.direccion],
                ["CONTACTO", d.contacto],
                ["TELÉFONO", d.telefono],
                ["CORREO", d.correo],
                ["TÉCNICO RESPONSABLE", d.tecnicoNombre],
                ["TELÉFONO TÉCNICO", d.tecnicoTelefono],
                ["CORREO TÉCNICO", d.tecnicoCorreo],
                ["FECHA DE SERVICIO", d.fechaServicio],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="pdf-label">{label}</td>
                  <td>{value || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ACTIVIDADES */}
          <table className="pdf-table">
            <thead>
              <tr>
                <th>ARTÍCULO</th>
                <th>DESCRIPCIÓN DE ACTIVIDADES</th>
                <th>IMAGEN</th>
              </tr>
            </thead>
            <tbody>
              {d.actividades.map((a, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{a.titulo}</strong>
                    <div>{a.detalle}</div>
                  </td>
                  <td>
                    {a.imagen && (
                      <img
                        src={URL.createObjectURL(a.imagen)}
                        alt="actividad"
                        style={{ maxWidth: 120 }}
                      />
                    )}
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
              {d.conclusiones.map((c, i) => (
                <tr key={i}>
                  <td>{c}</td>
                  <td>{d.recomendaciones[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EQUIPO */}
          <table className="pdf-table">
            <thead>
              <tr>
                <th colSpan="2">DESCRIPCIÓN DEL EQUIPO</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.equipo).map(([k, v]) => (
                <tr key={k}>
                  <td className="pdf-label">{k.toUpperCase()}</td>
                  <td>{v}</td>
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
                <td style={{ height: 150 }} />
                <td style={{ height: 150 }} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
