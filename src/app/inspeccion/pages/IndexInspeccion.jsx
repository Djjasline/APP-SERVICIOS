import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function IndexInspeccion() {
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const pdfRef = useRef(null);

  const generarPDF = async () => {
    const elemento = pdfRef.current;
    if (!elemento) return;

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("inspeccion.pdf");
  };

  return (
    <div className="p-6 space-y-4">
      {/* HISTÓRICO */}
      <div className="border rounded-lg p-4 flex justify-between items-center">
        <div>
          <p className="font-semibold">Sin cliente</p>
          <span className="text-green-600 text-sm">completada</span>
        </div>

        <div className="flex gap-2">
          {/* BOTÓN PDF */}
          <button
            onClick={() => setMostrarPreview(true)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            PDF
          </button>

          {/* BOTÓN ABRIR */}
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Abrir
          </button>
        </div>
      </div>

      {/* MODAL PREVIEW */}
      {mostrarPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold">Vista previa del PDF</h2>

            {/* CONTENIDO A EXPORTAR */}
            <div
              ref={pdfRef}
              className="border p-4 rounded text-sm space-y-2"
            >
              <h3 className="text-center font-bold text-lg">
                Inspección Hidrosuccionador
              </h3>
              <p>
                <strong>Cliente:</strong> Sin cliente
              </p>
              <p>
                <strong>Estado:</strong> Completada
              </p>
              <p>
                <strong>Fecha:</strong> {new Date().toLocaleDateString()}
              </p>

              <hr />

              <p>Detalle de inspección generado desde la aplicación.</p>
            </div>

            {/* BOTONES MODAL */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarPreview(false)}
                className="px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Cerrar
              </button>

              <button
                onClick={generarPDF}
                className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
