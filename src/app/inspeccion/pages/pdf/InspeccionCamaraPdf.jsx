import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@utils/inspectionStorage";

export default function InspeccionCamaraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();

  const inspection = getInspectionById("camara", id);

  if (!inspection?.data) {
    return (
      <div className="p-6">
        <p>No se encontró la inspección.</p>
        <button onClick={() => navigate(-1)} className="mt-4 border px-4 py-2">
          Volver
        </button>
      </div>
    );
  }

  const data = inspection.data;

  return (
    <div className="max-w-6xl mx-auto p-6 text-sm bg-white space-y-6">

      {/* ================= ENCABEZADO ================= */}
      <table className="w-full border-collapse border">
        <tbody>
          <tr>
            <td rowSpan={4} className="w-32 border p-2 text-center">
              <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
            </td>
            <td colSpan={2} className="border font-bold text-center">
              HOJA DE INSPECCIÓN CÁMARA CCTV
            </td>
            <td className="border p-2 text-xs">
              Fecha versión: <strong>01-01-26</strong><br />
              Versión: <strong>01</strong>
            </td>
          </tr>

          {[
            ["REFERENCIA DE CONTRATO", data.referenciaContrato],
            ["DESCRIPCIÓN", data.descripcion],
            ["COD. INF.", data.codInf],
          ].map(([label, value]) => (
            <tr key={label}>
              <td className="border p-2 font-semibold">{label}</td>
              <td colSpan={3} className="border p-2">
                {value || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DATOS SERVICIO ================= */}
      <table className="w-full border-collapse border">
        <tbody>
          {[
            ["Cliente", data.cliente],
            ["Ubicación", data.ubicacion],
            ["Técnico ASTAP", data.tecnicoAstap],
            ["Responsable cliente", data.responsableCliente],
            ["Fecha inspección", data.fechaInspeccion],
          ].map(([label, value]) => (
            <tr key={label}>
              <td className="border p-2 font-semibold w-64">{label}</td>
              <td className="border p-2">{value || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border p-4 space-y-3">
        <h3 className="font-bold">ESTADO DEL EQUIPO</h3>

        <div className="relative border">
          <img src="/estado equipo camara.png" className="w-full" />
          {data.estadoEquipoPuntos?.map((pt) => (
            <div
              key={pt.id}
              className="absolute bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs"
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

        {data.estadoEquipoPuntos?.length > 0 ? (
          data.estadoEquipoPuntos.map((pt) => (
            <div key={pt.id}>
              <strong>{pt.id})</strong> {pt.nota || "—"}
            </div>
          ))
        ) : (
          <p className="italic text-gray-500">
            No se registraron observaciones del estado del equipo.
          </p>
        )}
      </section>

      {/* ================= EVALUACIÓN DE SISTEMAS ================= */}
      <section className="border p-4">
        <h3 className="font-bold mb-2">
          EVALUACIÓN DE COMPONENTES / SISTEMAS
        </h3>

        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-1">Ítem</th>
              <th className="border p-1">Estado</th>
              <th className="border p-1">Observación</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.items || {}).length > 0 ? (
              Object.entries(data.items).map(([codigo, item]) => (
                <tr key={codigo}>
                  <td className="border p-1">{codigo}</td>
                  <td className="border p-1">{item.estado || "—"}</td>
                  <td className="border p-1">{item.observacion || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border p-2 text-center italic">
                  No se registraron ítems de evaluación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <section className="border p-4">
        <h3 className="font-bold text-center mb-2">
          DESCRIPCIÓN DEL EQUIPO
        </h3>

        <table className="w-full border-collapse border">
          <tbody>
            {[
              ["Marca", data.marca],
              ["Modelo", data.modelo],
              ["Serie módulo", data.serieModulo],
              ["Serie carrete", data.serieCarrete],
              ["Serie cabezal", data.serieCabezal],
              ["Año modelo", data.anioModelo],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="border p-2 font-semibold w-64">{label}</td>
                <td className="border p-2">{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= FIRMAS ================= */}
      <table className="w-full border-collapse border">
        <tbody>
          <tr>
            <td className="border p-4 text-center">
              <strong>Firma Técnico</strong><br />
              {data.firmas?.tecnico && (
                <img src={data.firmas.tecnico} className="h-32 mx-auto" />
              )}
            </td>
            <td className="border p-4 text-center">
              <strong>Firma Cliente</strong><br />
              {data.firmas?.cliente && (
                <img src={data.firmas.cliente} className="h-32 mx-auto" />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= BOTÓN ================= */}
      <div className="no-print text-right">
        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
