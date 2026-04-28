import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pdfRef = useRef(null);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    const loadReport = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error cargando preview:", error);
        navigate("/service-report-history");
        return;
      }

      setReport(data);
      setLoading(false);
    };

    if (id) loadReport();
  }, [id, navigate]);

  /* ================= PDF ================= */
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

    /* 🔥 NOMBRE PRO */
    const cliente = report.data?.cliente || "CLIENTE";
    const pedido = report.data?.pedidoDemanda || "PEDIDO";
    const codigo = report.data?.codInf || "COD";

    const fileName = `${cliente}_${pedido}_${codigo}_ASTAP.pdf`;

    pdf.save(fileName);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando informe...
      </div>
    );
  }

  if (!report) return null;

  const d = report.data || {};

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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

        {/* ================= PREVIEW ================= */}
        <div ref={pdfRef} className="bg-white p-6 shadow space-y-6">
          <ReportHeader data={d} />

          {/* CLIENTE */}
          <table className="pdf-table">
            <tbody>
              {[
                ["CLIENTE", d.cliente],
                ["DIRECCIÓN", d.direccion],
                ["CONTACTO", d.contacto],
                ["TELÉFONO", d.telefono],
                ["CORREO", d.correo],
                ["TÉCNICO", d.tecnicoNombre],
                ["TELÉFONO TÉCNICO", d.tecnicoTelefono],
                ["CORREO TÉCNICO", d.tecnicoCorreo],
                ["FECHA", d.fechaServicio],
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
                <th>#</th>
                <th>ACTIVIDAD</th>
                <th>IMAGEN</th>
              </tr>
            </thead>
            <tbody>
              {(d.actividades || []).map((a, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{a.titulo}</strong>
                    <div>{a.detalle}</div>
                  </td>
                  <td>
                    {a.imagen && (
                      <img
                        src={a.imagen} // 🔥 ya no createObjectURL
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
              {(d.conclusiones || []).map((c, i) => (
                <tr key={i}>
                  <td>{c}</td>
                  <td>{d.recomendaciones?.[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EQUIPO */}
          <table className="pdf-table">
            <thead>
              <tr>
                <th colSpan="2">EQUIPO</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.equipo || {}).map(([k, v]) => (
                <tr key={k}>
                  <td className="pdf-label">{k.toUpperCase()}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
