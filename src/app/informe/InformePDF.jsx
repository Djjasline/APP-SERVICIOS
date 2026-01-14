import { useParams, useNavigate } from "react-router-dom";

/*
  VISTA PDF – INFORME GENERAL DE SERVICIOS
  - SOLO LECTURA
  - FORMATO FIJO
  - IMPRIMIBLE / DESCARGABLE
*/

export default function InformePDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reports = JSON.parse(localStorage.getItem("serviceReports")) || [];
  const report = reports.find(r => String(r.id) === id);

  if (!report) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Informe no encontrado</h2>
        <button onClick={() => navigate("/informe")}>Volver</button>
      </div>
    );
  }

  const { data, createdAt } = report;

  return (
    <div className="pdf-container">
      {/* ================= ENCABEZADO ================= */}
      <table className="pdf-table">
        <tbody>
          <tr>
            <td rowSpan="3" style={{ width: 90, textAlign: "center" }}>
              <img src="/astap-logo.jpg" style={{ maxWidth: 80 }} />
            </td>
            <td colSpan="4" className="pdf-title">
              INFORME TÉCNICO DE SERVICIO
            </td>
            <td className="pdf-small">
              Fecha versión: 26-11-25<br />
              Versión: 01
            </td>
          </tr>
          <tr>
            <td className="pdf-label">REFERENCIA DE CONTRATO</td>
            <td colSpan="5">{data.referenciaContrato}</td>
          </tr>
          <tr>
            <td className="pdf-label">DESCRIPCIÓN</td>
            <td colSpan="5">{data.descripcion}</td>
          </tr>
        </tbody>
      </table>

      {/* ================= DATOS DEL CLIENTE ================= */}
      <table className="pdf-table">
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
              <td colSpan="5">{value || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ACTIVIDADES ================= */}
      <table className="pdf-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ÍTEM</th>
            <th>DESCRIPCIÓN DE ACTIVIDADES</th>
            <th style={{ width: 220 }}>IMAGEN</th>
          </tr>
        </thead>
        <tbody>
          {data.actividades.map((a, i) => (
            <>
              <tr key={`t-${i}`}>
                <td>{i + 1}</td>
                <td>{a.titulo}</td>
                <td rowSpan="2" style={{ textAlign: "center" }}>
                  {a.imagen && (
                    <img
                      src={a.imagen}
                      style={{ maxWidth: 200, maxHeight: 150 }}
                    />
                  )}
                </td>
              </tr>
              <tr key={`d-${i}`}>
                <td>{i + 1}.1</td>
                <td>{a.detalle}</td>
              </tr>
            </>
          ))}
        </tbody>
      </table>

      {/* ================= CONCLUSIONES ================= */}
      <table className="pdf-table">
        <thead>
          <tr>
            <th>CONCLUSIONES</th>
          </tr>
        </thead>
        <tbody>
          {data.conclusiones?.map((c, i) => (
            <tr key={i}>
              <td>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= RECOMENDACIONES ================= */}
      <table className="pdf-table">
        <thead>
          <tr>
            <th>RECOMENDACIONES</th>
          </tr>
        </thead>
        <tbody>
          {data.recomendaciones?.map((r, i) => (
            <tr key={i}>
              <td>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <table className="pdf-table">
        <tbody>
          {[
            ["NOTA", data.equipo?.nota],
            ["MARCA", data.equipo?.marca],
            ["MODELO", data.equipo?.modelo],
            ["N° SERIE", data.equipo?.serie],
            ["AÑO MODELO", data.equipo?.anio],
            ["VIN / CHASIS", data.equipo?.vin],
            ["PLACA", data.equipo?.placa],
            ["HORAS MÓDULO", data.equipo?.horasModulo],
            ["HORAS CHASIS", data.equipo?.horasChasis],
            ["KILOMETRAJE", data.equipo?.kilometraje],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td className="pdf-label">{label}</td>
              <td colSpan="5">{value || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= FIRMAS ================= */}
      <table className="pdf-table">
        <thead>
          <tr>
            <th>FIRMA TÉCNICO</th>
            <th>FIRMA CLIENTE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: "center", height: 160 }}>
              {data.firmas?.tecnico && (
                <img src={data.firmas.tecnico} style={{ maxHeight: 140 }} />
              )}
            </td>
            <td style={{ textAlign: "center" }}>
              {data.firmas?.cliente && (
                <img src={data.firmas.cliente} style={{ maxHeight: 140 }} />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= BOTONES (NO PDF) ================= */}
      <div className="no-print" style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/informe")}>Volver</button>
        <button onClick={() => window.print()}>Imprimir / Guardar PDF</button>
      </div>
    </div>
  );
}
