import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

export default function MantenimientoHidroPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const data = getInspectionById("mantenimiento-hidro", id);
    if (data) setRegistro(data);
  }, [id]);

  if (!registro) {
    return <div className="p-6">Cargando mantenimiento…</div>;
  }

  const { data } = registro;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto">

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td rowSpan={5} style={{ width: 140, textAlign: "center" }}>
                <img src="/astap-logo.jpg" style={{ maxHeight: 70 }} />
              </td>
              <td colSpan={2} className="pdf-title">
                HOJA DE MANTENIMIENTO HIDROSUCCIONADOR
              </td>
              <td>
                <strong>Fecha versión:</strong> 25-11-2025<br />
                <strong>Versión:</strong> 01
              </td>
            </tr>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td colSpan={2}>{data.referenciaContrato || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td colSpan={2}>{data.descripcion || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">COD. INF.</td>
              <td colSpan={2}>{data.codInf || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="pdf-table mt-4">
          <tbody>
            {[
              ["CLIENTE", data.cliente],
              ["DIRECCIÓN", data.direccion],
              ["CONTACTO", data.contacto],
              ["TELÉFONO", data.telefono],
              ["CORREO", data.correo],
              ["TÉCNICO RESPONSABLE", data.tecnicoResponsable],
              ["TELÉFONO TÉCNICO", data.telefonoTecnico],
              ["CORREO TÉCNICO", data.correoTecnico],
              ["FECHA DE SERVICIO", data.fechaServicio],
            ].map(([l, v], i) => (
              <tr key={i}>
                <td className="pdf-label">{l}</td>
                <td>{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td colSpan={2} style={{ position: "relative" }}>
                <img src="/estado-equipo.png" style={{ width: "100%" }} />
                {data.estadoEquipoPuntos?.map((pt) => (
                  <div
                    key={pt.id}
                    style={{
                      position: "absolute",
                      left: `${pt.x}%`,
                      top: `${pt.y}%`,
                      transform: "translate(-50%, -50%)",
                      background: "red",
                      color: "white",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pt.id}
                  </div>
                ))}
              </td>
            </tr>

            {data.estadoEquipoPuntos?.length ? (
              data.estadoEquipoPuntos.map((pt) => (
                <tr key={pt.id}>
                  <td className="pdf-label">{pt.id}</td>
                  <td>{pt.nota || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  — Sin observaciones —
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td className="pdf-label">NOTA</td>
              <td>{data.nota || "—"}</td>
            </tr>
            {[
              ["MARCA", data.marca],
              ["MODELO", data.modelo],
              ["SERIE", data.serie],
              ["AÑO MODELO", data.anioModelo],
              ["VIN / CHASIS", data.vin],
              ["PLACA", data.placa],
              ["HORAS MÓDULO", data.horasModulo],
              ["HORAS CHASIS", data.horasChasis],
              ["KILOMETRAJE", data.kilometraje],
            ].map(([l, v], i) => (
              <tr key={i}>
                <td className="pdf-label">{l}</td>
                <td>{v || "—"}</td>
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
                {data.firmas?.tecnico && (
                  <img src={data.firmas.tecnico} style={{ maxHeight: 100 }} />
                )}
              </td>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.cliente && (
                  <img src={data.firmas.cliente} style={{ maxHeight: 100 }} />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/mantenimiento")}
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
