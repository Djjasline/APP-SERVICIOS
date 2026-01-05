import html2pdf from "html2pdf.js";

export default function PdfButton({ targetId, filename }) {
  const generate = (preview = false) => {
    const element = document.getElementById(targetId);

    const opt = {
      margin: 5,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const worker = html2pdf().set(opt).from(element);

    if (preview) {
      worker.outputPdf("bloburl").then((url) => {
        window.open(url, "_blank");
      });
    } else {
      worker.save();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => generate(true)}
        className="px-3 py-2 text-sm rounded border hover:bg-slate-100"
      >
        👁️ Ver PDF
      </button>

      <button
        type="button"
        onClick={() => generate(false)}
        className="px-3 py-2 text-sm rounded border hover:bg-slate-100"
      >
        📄 Descargar PDF
      </button>
    </div>
  );
}
