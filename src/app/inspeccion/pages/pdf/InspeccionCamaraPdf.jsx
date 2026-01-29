import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@utils/inspectionStorage";

export default function InspeccionCamaraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const saved = getInspectionById("camara", id);
    if (saved?.data) {
      setInspection(saved.data);
    }
  }, [id]);

  if (!inspection) {
    return <div className="p-6">Cargando inspección…</div>;
  }

  const {
    referenciaContrato,
    descripcion,
    codInf,

    cliente,
    direccion,
    contacto,
    telefono,
    correo,
    tecnicoResponsable,
    telefonoTecnico,
    correoTecnico,
    fechaServicio,

    estadoEquipoPuntos = [],
    items = {},
    firmas = {},

    // descripción del equipo
    marca,
    modelo,
    serieModulo,
    serieCarrete,
    serieCabezal,
    anioModelo,
    nota,
  } = inspection;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto bg-white p-6">

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td rowSpan={4} style={{ width: 140, textAlign: "center" }}>
                <img src="/astap-logo.jpg" style={{ maxHeight: 70 }} />
              </td>
              <td colSpan={2} className="pdf-title">
                HOJA DE INSPECCIÓN CÁMARA
              </td>
              <td style={{ width: 180, fontSize: 12 }}>
                <div>Fecha versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            <tr>
              <td>REFERENCIA CONTRATO</td>
              <td colSpan={2}>{referenciaContrato}</td>
            </tr>
            <tr>
              <td>DESCRIPCIÓN</td>
              <td colSpan={2}>{descripcion}</td>
            </tr>
            <tr>
              <td>COD. INF.</td>
              <td colSpan={2}>{codInf}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS SERVICIO ================= */}
        <table className="pdf-table mt-4">
          <tbody>
            {[
              ["CLIENTE", cliente],
              ["DIRECCIÓN", direccion],
              ["CONTACTO", contacto],
              ["TELÉFONO", telefono],
              ["CORREO", correo],
              ["TÉCNICO", tecnicoResponsable],
              ["TEL. TÉCNICO", telefonoTecnico],
              ["CORREO TÉCNICO", correoTecnico],
              ["FECHA SERVICIO", fechaServicio],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td className="pdf-label">{label}</td>
                <td>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

        <div className="relative border rounded p-2">
          <img src="/estado equipo camara.png" className="w-full" />
          {estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
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

        {estadoEquipoPuntos.map((pt) => (
          <p key={pt.id} style={{ fontSize: 12 }}>
            <strong>{pt.id})</strong> {pt.nota}
          </p>
        ))}

        {/* ================= TABLAS ================= */}
        <h3 className="pdf-title mt-4">
          EVALUACIÓN DEL ESTADO DE LOS COMPONENTES
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
            {Object.entries(items).map(([codigo, obj]) => (
              <tr key={codigo}>
                <td>{codigo}</td>
                <td>{obj.estado}</td>
                <td>{obj.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            {[
              ["MARCA", marca],
              ["MODELO", modelo],
              ["SERIE MÓDULO", serieModulo],
              ["SERIE CARRETE", serieCarrete],
              ["SERIE CABEZAL", serieCabezal],
              ["AÑO MODELO", anioModelo],
              ["NOTA", nota],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td className="pdf-label">{label}</td>
                <td>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table mt-4">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 120, textAlign: "center" }}>
                {firmas.tecnico && (
                  <img src={firmas.tecnico} style={{ maxHeight: 100 }} />
                )}
              </td>
              <td style={{ height: 120, textAlign: "center" }}>
                {firmas.cliente && (
                  <img src={firmas.cliente} style={{ maxHeight: 100 }} />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/inspeccion")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

      </div>
    </div>
  );
}
