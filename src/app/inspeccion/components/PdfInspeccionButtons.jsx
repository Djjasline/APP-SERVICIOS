import html2pdf from "html2pdf.js";

export default function PdfInspeccionButtons() {
  const generatePdf = () => {
    const element = document.getElementById("pdf-inspeccion-hidro");

    if (!element) {
      alert("No se encontró el formulario para generar el PDF.");
      return;
    }

    const options = {
      margin: 8,
      filename: `ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`,
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
    };

    html2pdf()
      .set(options)
      .from(element)
      .save(); // 👈 ESTA LÍNEA ES LA CLAVE
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
      }}
    >
      <button
        type="button"
        onClick={generatePdf}
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        📄 Generar PDF
      </button>
    </div>
  );
}
