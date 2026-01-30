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
      <section className="border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE INSPECCIÓN CÁMARA
              </td>
              <td className="p-2">
                <div>Fecha versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>

            {[
              ["REFERENCIA DE CONTRATO", data.referenciaContrato],
              ["DESCRIPCIÓN", data.descripcion],
              ["COD. INF.", data.codInf],
            ].map(([label, value]) => (
              <tr key={label} className="border-b">
                <td className="border-r p-2 font-semibold">{label}</td>
                <td colSpan={3} className="p-2">
                  {value || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= DATOS SERVICIO ================= */}
      <section className="border rounded p-4 grid grid-cols-2 gap-2">
        {[
          ["Cliente", data.cliente],
          ["Ubicación", data.ubicacion],
          ["Técnico ASTAP", data.tecnicoAstap],
          ["Responsable cliente", data.responsableCliente],
          ["Fecha inspección", data.fechaInspeccion],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{label}:</strong> {value || "-"}
          </div>
        ))}
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Estado del equipo</h2>

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

        {data.estadoEquipoPuntos?.map((pt) => (
          <div key={pt.id}>
            <strong>{pt.id})</strong> {pt.nota || "-"}
          </div>
        ))}
      </section>

      {/* ================= TABLAS ================= */}
      {Object.entries(data.items || {}).length > 0 && (
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">
            Evaluación de componentes / sistemas
          </h2>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.items).map(([codigo, item]) => (
                <tr key={codigo}>
                  <td className="border px-2">{codigo}</td>
                  <td className="border px-2">{item.estado || "-"}</td>
                  <td className="border px-2">{item.observacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">
          DESCRIPCIÓN DEL EQUIPO
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["Marca", data.marca],
            ["Modelo", data.modelo],
            ["Serie módulo", data.serieModulo],
            ["Serie carrete", data.serieCarrete],
            ["Serie cabezal", data.serieCabezal],
            ["Año modelo", data.anioModelo],
          ].map(([label, value]) => (
            <div key={label}>
              <strong>{label}:</strong> {value || "-"}
            </div>
          ))}
        </div>
      </section>

      {/* ================= FIRMAS ================= */}
      <section className="border rounded p-4 grid grid-cols-2 gap-6 text-center">
        <div>
          <strong>Firma Técnico</strong>
          {data.firmas?.tecnico && (
            <img src={data.firmas.tecnico} className="mx-auto h-32 border" />
          )}
        </div>
        <div>
          <strong>Firma Cliente</strong>
          {data.firmas?.cliente && (
            <img src={data.firmas.cliente} className="mx-auto h-32 border" />
          )}
        </div>
      </section>

      <div className="text-right">
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
