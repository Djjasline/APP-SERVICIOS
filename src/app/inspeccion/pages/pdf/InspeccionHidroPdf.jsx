import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function InformePDF() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [report, setReport] = useState(null);

  /* ===========================
     CARGAR INFORME
  =========================== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const found = stored.find((r) => String(r.id) === String(id));

    if (found) {
      setReport(found);
    }
  }, [id]);

  if (!report) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró el informe.</p>
        <button
          onClick={() => navigate("/informe")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const { data } = report;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto">

{/* ================= ENCABEZADO ================= */}
<table className="pdf-table">
  <tbody>
    <tr>
      <td
        rowSpan={4}
        style={{ width: 140, textAlign: "center" }}
      >
        <img
          src="/astap-logo.jpg"
          alt="ASTAP"
          style={{ maxHeight: 70, margin: "0 auto" }}
        />
      </td>

      <td colSpan={2} className="pdf-title">
        INFORME GENERAL DE SERVICIOS
      </td>

      <td style={{ width: 180, fontSize: 12 }}>
        <div>Fecha versión: <strong>01-01-26</strong></div>
        <div>Versión: <strong>01</strong></div>
      </td>
    </tr>

    <tr>
      <td className="pdf-label">REFERENCIA CONTRATO</td>
      <td colSpan={2}>{data.referenciaContrato}</td>
    </tr>

    <tr>
      <td className="pdf-label">DESCRIPCIÓN</td>
      <td colSpan={2}>{data.descripcion}</td>
    </tr>

    <tr>
      <td className="pdf-label">COD. INF.</td>
      <td colSpan={2}>{data.codInf}</td>
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
              ["TÉCNICO RESPONSABLE", data.tecnicoNombre],
              ["TELÉFONO TÉCNICO", data.tecnicoTelefono],
              ["CORREO TÉCNICO", data.tecnicoCorreo],
              ["FECHA DE SERVICIO", data.fechaServicio],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td className="pdf-label">{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ACTIVIDADES ================= */}
        <h3 className="pdf-title mt-4">ACTIVIDADES REALIZADAS</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ width: 220 }}>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
                <td>
                  <strong>{a.titulo}</strong>
                  <div style={{ whiteSpace: "pre-wrap" }}>{a.detalle}</div>
                </td>
                <td className="text-center">
                  {a.imagen && (
                    <img
                      src={a.imagen}
                      alt="actividad"
                      style={{ maxWidth: 180 }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= CONCLUSIONES Y RECOMENDACIONES ================= */}
        <table className="pdf-table mt-4">
          <thead>
            <tr>
              <th colSpan={2}>CONCLUSIONES</th>
              <th colSpan={2}>RECOMENDACIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.conclusiones.map((c, i) => (
              <tr key={i}>
                <td style={{ width: 30, textAlign: "center" }}>{i + 1}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>{c}</td>
                <td style={{ width: 30, textAlign: "center" }}>{i + 1}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>
                  {data.recomendaciones[i]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            {[
              ["NOTA", data.equipo.nota],
              ["MARCA", data.equipo.marca],
              ["MODELO", data.equipo.modelo],
              ["N° SERIE", data.equipo.serie],
              ["AÑO MODELO", data.equipo.anio],
              ["VIN / CHASIS", data.equipo.vin],
              ["PLACA", data.equipo.placa],
              ["HORAS MÓDULO", data.equipo.horasModulo],
              ["HORAS CHASIS", data.equipo.horasChasis],
              ["KILOMETRAJE", data.equipo.kilometraje],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td className="pdf-label">{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table mt-4">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 140, textAlign: "center" }}>
                {data.firmas.tecnico && (
                  <img
                    src={data.firmas.tecnico}
                    alt="firma tecnico"
                    style={{ maxHeight: 120 }}
                  />
                )}
              </td>
              <td style={{ height: 140, textAlign: "center" }}>
                {data.firmas.cliente && (
                  <img
                    src={data.firmas.cliente}
                    alt="firma cliente"
                    style={{ maxHeight: 120 }}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
