import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function IndexInspeccion() {
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const pdfRef = useRef(null);

  const generarPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
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
    <div className="p-6 space-y-6">
      {/* ENCABEZADO */}
      <div>
        <h1 className="text-2xl font-semibold">Inspección y valoración</h1>
      </div>

      {/* TARJETA HISTÓRICO */}
      <div className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">
        <div>
          <p className="font-medium">Sin cliente</p>
          <span className="text-green-600 text-sm">completada</span>
        </div>

        <div className="flex gap-2">
          {/* BOTÓN PDF */}
          <button
            onClick={() => setMostrarPreview(true)}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            PDF
          </button>

          {/* BOTÓN ABRIR (NO SE TOCA) */}
          <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
            Abrir
          </button>
        </div>
      </div>

      {/* MODAL PREVIEW PDF */}
      {mostrarPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold">Vista previa del PDF</h2>

            {/* CONTENIDO A EXPORTAR */}
            <div
              ref={pdfRef}
              className="border rounded p-4 text-sm space-y-2 bg-white"
            >
              <h3 className="text-center text-lg font-bold">
                Informe de Inspección
              </h3>

              <p>
                <strong>Equipo:</strong> Hidrosuccionador
              </p>
              <p>
                <strong>Cliente:</strong> Sin cliente
              </p>
              <p>
                <strong>Estado:</strong> Completada
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date().toLocaleDateString()}
              </p>

              <hr />

              <p>
                Este documento corresponde a una inspección realizada desde la
                aplicación de servicios.
              </p>
            </div>

            {/* BOTONES MODAL */}
            <div className="flex justify-end gap-2 pt-2">
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
