import html2pdf from "html2pdf.js";

/**
 * Botones para:
 * - Ver PDF (vista previa)
 * - Descargar PDF
 *
 * REGLA DE ORO:
 * El PDF se genera SIEMPRE desde el HTML real del formulario
 * contenido en el div #pdf-inspeccion-hidro
 */
export default function PdfInspeccionButtons() {
  const generatePdf = (preview = true) => {
    const element = document.getElementById("pdf-inspeccion-hidro");

    if (!element) {
      alert("No se encontró el formulario para generar el PDF.");
      return;
    }

    const options = {
      margin: [8, 8, 10, 8], // arriba, izquierda, abajo, derecha
      filename: "ASTAP_INSPECCION_HIDRO.pdf",
      image: {
        type: "jpeg",
        quality: 0.98,
      },
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
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    const worker = html2pdf().set(options).from(element);

    if (preview) {
      // 👁️ Vista previa en nueva pestaña
      worker.outputPdf("bloburl").then((url) => {
        window.open(url, "_blank");
      });
    } else {
      // ⬇️ Descarga directa
      worker.save();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        gap: "8px",
        zIndex: 9999,
      }}
    >
      {/* 👁 BOTÓN CLAVE PARA AUTO-PDF */}
      <button
        type="button"
        data-pdf-preview="true"
        onClick={() => generatePdf(true)}
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        👁 Ver PDF
      </button>

      <button
        type="button"
        onClick={() => generatePdf(false)}
        style={{
          background: "#16a34a",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        ⬇ Descargar PDF
      </button>
    </div>
  );
}
