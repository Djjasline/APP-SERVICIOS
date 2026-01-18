import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  const [previewPDF, setPreviewPDF] = useState(false);
  const pdfRef = useRef(null);

  const generarPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save("inspeccion-hidrosuccionador.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inspección y valoración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ================= HIDROSUCCIONADOR ================= */}
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Hidrosuccionador</h2>
            <p className="text-sm text-gray-600">
              Inspección del equipo hidrosuccionador.
            </p>
          </div>

          {/* NUEVA INSPECCIÓN → historial (como estaba antes) */}
          <button
            onClick={() => navigate("hidro/0")}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            + Nueva inspección
          </button>

          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
              todas
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              borrador
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              completada
            </button>
          </div>

          <div className="text-sm text-gray-600">Histórico</div>

          {/* ITEM HISTÓRICO (ejemplo existente) */}
          <div className="flex justify-between items-center border rounded p-2">
            <span>Sin cliente</span>

            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xs">completada</span>

              {/* PDF */}
              <button
                onClick={() => setPreviewPDF(true)}
                className="bg-red-600 text-white px-2 py-0.5 rounded text-xs"
              >
                PDF
              </button>

              {/* ABRIR → hoja existente */}
              <button
                onClick={() => navigate(`hidro/${id}`)}
                className="text-blue-600 text-xs"
              >
                Abrir
              </button>
            </div>
          </div>
        </div>

        {/* ================= BARREDORA ================= */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">Barredora</h2>
          <p className="text-sm text-gray-600">
            Inspección y valoración de barredoras.
          </p>

          <button
            onClick={() => navigate("barredora/1")}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            + Nueva inspección
          </button>

          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
              todas
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              borrador
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              completada
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Histórico
            <br />
            No hay inspecciones aún.
          </div>
        </div>

        {/* ================= CÁMARA ================= */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">
            Cámara (VCAM / Metrotech)
          </h2>
          <p className="text-sm text-gray-600">
            Inspección con sistema de cámara.
          </p>

          <button
            onClick={() => navigate("camara/1")}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            + Nueva inspección
          </button>

          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
              todas
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              borrador
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              completada
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Histórico
            <br />
            No hay inspecciones aún.
          </div>
        </div>
      </div>

      {/* ================= MODAL PDF ================= */}
      {previewPDF && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-5 w-[90%] max-w-xl space-y-4">
            <h3 className="text-lg font-semibold">Vista previa PDF</h3>

            <div
              ref={pdfRef}
              className="border rounded p-4 text-sm space-y-2"
            >
              <h4 className="text-center font-bold">
                Inspección Hidrosuccionador
              </h4>
              <p><b>Cliente:</b> Sin cliente</p>
              <p><b>Estado:</b> Completada</p>
              <p><b>Fecha:</b> {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPreviewPDF(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cerrar
              </button>
              <button
                onClick={generarPDF}
                className="bg-green-600 text-white px-3 py-1 rounded"
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
