import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

export default function InspeccionPdf() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const inspection = getInspectionById(type, id);

  if (!inspection) {
    return (
      <div className="p-6">
        <p>No se encontró la inspección</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const { data } = inspection;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white max-w-6xl mx-auto p-6 shadow space-y-6">

        {/* BOTONES */}
        <div className="flex justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td rowSpan={4} className="w-32 text-center">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  className="mx-auto max-h-20"
                />
              </td>

              <td colSpan={2} className="text-center font-bold">
                HOJA DE INSPECCIÓN – {type.toUpperCase()}
              </td>

              <td className="text-xs">
                <div>Versión: 01</div>
                <div>Fecha versión: 01-01-26</div>
              </td>
            </tr>

            <tr>
              <td className="pdf-label">CLIENTE</td>
              <td colSpan={2}>{data.cliente || "—"}</td>
            </tr>

            <tr>
              <td className="pdf-label">CÓDIGO</td>
              <td colSpan={2}>{data.codInf || "—"}</td>
            </tr>

            <tr>
              <td className="pdf-label">FECHA</td>
              <td colSpan={2}>{data.fecha || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        {data.estadoEquipoPuntos?.length > 0 && (
          <section>
            <h3 className="font-semibold text-sm">
              ESTADO DEL EQUIPO
            </h3>

            <ul className="text-sm list-disc pl-6">
              {data.estadoEquipoPuntos.map((p) => (
                <li key={p.id}>
                  Punto {p.id}: {p.nota || "—"}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ================= CHECKLIST ================= */}
        <section>
          <h3 className="font-semibold text-sm">
            EVALUACIÓN DE SISTEMAS
          </h3>

          <table className="pdf-table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.items || {}).map(
                ([codigo, item]) => (
                  <tr key={codigo}>
                    <td>{codigo}</td>
                    <td>{item.estado || "—"}</td>
                    <td>{item.observacion || "—"}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </section>

        {/* ================= FIRMAS ================= */}
        <section className="grid grid-cols-2 gap-6 pt-6">
          <div className="text-center">
            <p className="font-semibold">FIRMA TÉCNICO</p>
            {data.firmas?.tecnico && (
              <img
                src={data.firmas.tecnico}
                alt="Firma técnico"
                className="mx-auto max-h-32"
              />
            )}
          </div>

          <div className="text-center">
            <p className="font-semibold">FIRMA CLIENTE</p>
            {data.firmas?.cliente && (
              <img
                src={data.firmas.cliente}
                alt="Firma cliente"
                className="mx-auto max-h-32"
              />
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
