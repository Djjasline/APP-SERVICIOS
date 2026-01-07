import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ServiceReportPreview() {
  const { state } = useLocation();
  const report = state?.data;

  if (!report) return <p>No hay datos</p>;

  const generatePDF = async () => {
    const element = document.getElementById("pdf-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("informe-servicio.pdf");
  };

  return (
    <div className="p-6">
      <button
        className="mb-4 px-6 py-2 bg-black text-white rounded"
        onClick={generatePDF}
      >
        Descargar PDF
      </button>

      <div id="pdf-content">
        {/* AQUÍ reutilizas EXACTAMENTE el mismo layout del formulario */}
        {/* (puedes copiar el JSX del formulario pero sin inputs) */}
      </div>
    </div>
  );
}
