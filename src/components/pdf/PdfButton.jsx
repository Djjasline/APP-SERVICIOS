import html2pdf from "html2pdf.js";

export default function PdfButton({ targetId, filename }) {
  const generatePdf = () => {
    const element = document.getElementById(targetId);

    const opt = {
      margin: 5,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <button
      type="button"
      onClick={generatePdf}
      className="px-3 py-2 text-sm rounded border hover:bg-slate-100"
    >
      📄 Descargar PDF
    </button>
  );
}
