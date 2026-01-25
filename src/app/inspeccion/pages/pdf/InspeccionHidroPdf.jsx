import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =====================================================
   PDF INSPECCIÓN HIDROSUCCIONADOR
   - SOLO LECTURA
   - HTML REAL
   - VISTA PREVIA + DESCARGA
===================================================== */

export default function InspeccionHidroPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);

  /* =============================
     CARGAR INSPECCIÓN
  ============================= */
  useEffect(() => {
    const stored = getInspectionById("hidro", id);

    if (!stored || !stored.data) {
      alert("No se encontró la inspección.");
      navigate("/inspeccion");
      return;
    }

    setData(stored.data);

    // 👇 clave: esperamos a que React renderice TODO
    setTimeout(() => {
      setReady(true);
    }, 500);
  }, [id, navigate]);

  /* =============================
     GENERAR PDF
  ============================= */
  const generatePdf = async (preview = true) => {
    if (!ready) {
      alert("El PDF aún se está preparando, intenta de nuevo.");
      return;
    }

    const element = document.getElementById("pdf-hidro");

    if (!element) {
      alert("No se encontró el contenido del PDF.");
      return;
    }

    const options = {
      margin: 5,
      filename: `ASTAP_INSPECCION_HIDRO_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    const worker = html2pdf().set(options).from(element);

    if (preview) {
      const url = await worker.outputPdf("bloburl");
      window.open(url, "_blank");
    } else {
      await worker.save();
    }
  };

  if (!data) return null;

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* ================= BOTONES ================= */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => generatePdf(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          👁 Ver PDF
        </button>

        <button
          onClick={() => generatePdf(false)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ⬇ Descargar PDF
        </button>

       <button
  type="button"
  onClick={() => navigate(`/inspeccion/hidro/${id}/pdf`)}
  className="px-4 py-2 bg-green-600 text-white rounded"
>
  Ver PDF
</button>

      </div>

      {/* ================= CONTENIDO PDF ================= */}
      <div
        id="pdf-hidro"
        className="bg-white p-6 text-sm text-black"
      >
        {/* ===== ENCABEZADO ===== */}
        <table className="w-full border-collapse border mb-4">
          <tbody>
            <tr>
              <td className="border p-2 text-center w-32">
                <img
                  src="/astap-logo.jpg"
                  className="mx-auto h-16"
                />
              </td>
              <td className="border p-2 text-center font-bold text-lg">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
              <td className="border p-2 text-xs">
                Fecha versión: 01-01-26
                <br />
                Versión: 01
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== DATOS GENERALES ===== */}
        <table className="w-full border mb-4">
          <tbody>
            {[
              ["Cliente", data.cliente],
              ["Dirección", data.direccion],
              ["Contacto", data.contacto],
              ["Teléfono", data.telefono],
              ["Correo", data.correo],
              ["Técnico", data.tecnicoResponsable],
              ["Fecha servicio", data.fechaServicio],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="border p-2 font-semibold w-48">
                  {label}
                </td>
                <td className="border p-2">
                  {value || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== ESTADO DEL EQUIPO ===== */}
        <h3 className="font-semibold mb-2">
          Estado del equipo
        </h3>

        <div className="relative border mb-3">
          <img
            src="/estado-equipo.png"
            className="w-full"
          />

          {data.estadoEquipoPuntos?.map((pt) => (
            <div
              key={pt.id}
              className="absolute bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {data.estadoEquipoPuntos?.map((pt) => (
          <div key={pt.id} className="text-xs mb-1">
            <strong>{pt.id})</strong>{" "}
            {pt.nota || "—"}
          </div>
        ))}

        {/* ===== CHECKLIST ===== */}
        <h3 className="font-semibold mt-4 mb-2">
          Evaluación de sistemas
        </h3>

        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1">Ítem</th>
              <th className="border p-1">Estado</th>
              <th className="border p-1">Observación</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.items || {}).map(
              ([codigo, item]) => (
                <tr key={codigo}>
                  <td className="border p-1">
                    {codigo}
                  </td>
                  <td className="border p-1">
                    {item.estado || "—"}
                  </td>
                  <td className="border p-1">
                    {item.observacion || "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* ===== DESCRIPCIÓN EQUIPO ===== */}
        <h3 className="font-semibold mt-4 mb-2">
          Descripción del equipo
        </h3>

        <table className="w-full border">
          <tbody>
            {[
              ["Marca", data.marca],
              ["Modelo", data.modelo],
              ["Serie", data.serie],
              ["Año", data.anioModelo],
              ["VIN", data.vin],
              ["Placa", data.placa],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="border p-2 font-semibold w-48">
                  {label}
                </td>
                <td className="border p-2">
                  {value || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== FIRMAS ===== */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-center">
          <div>
            <p className="font-semibold mb-2">
              Firma técnico
            </p>
            {data.firmas?.tecnico ? (
              <img
                src={data.firmas.tecnico}
                className="mx-auto h-24 border"
              />
            ) : (
              <div className="h-24 border flex items-center justify-center">
                —
              </div>
            )}
          </div>

          <div>
            <p className="font-semibold mb-2">
              Firma cliente
            </p>
            {data.firmas?.cliente ? (
              <img
                src={data.firmas.cliente}
                className="mx-auto h-24 border"
              />
            ) : (
              <div className="h-24 border flex items-center justify-center">
                —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
