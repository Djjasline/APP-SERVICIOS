import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function InformePDF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const found = stored.find((r) => String(r.id) === String(id));
    if (found) {
      setReport(found);
    }
  }, [id]);

  if (!report) {
    return (
      <div className="p-6">
        <p>No se encontró el informe.</p>
        <button
          onClick={() => navigate("/informe")}
          className="border px-4 py-2 mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const { data } = report;

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* ================= ENCABEZADO ================= */}
      <table className="pdf-table">
        <tbody>
          <tr>
            <td rowSpan={3} style={{ width: 120, textAlign: "center" }}>
              <img src="/astap-logo.jpg" style={{ maxHeight: 60 }} />
            </td>
            <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
              INFORME TÉCNICO DE SERVICIO
            </td>
            <td style={{ width: 140 }}>
              Fecha versión: 01-01-26
              <br />
              Versión: 01
            </td>
          </tr>
          <tr>
            <td className="pdf-label">REFERENCIA DE CONTRATO</td>
            <td colSpan={2}>{data.referenciaContrato}</td>
          </tr>
          <tr>
            <td className="pdf-label">DESCRIPCIÓN</td>
            <td colSpan={2}>{data.descripcion}</td>
          </tr>
          <tr>
            <td className="pdf-label">COD. INF.</td>
            <td colSpan={3}>{data.codInf}</td>
          </tr>
        </tbody>
      </table>

      <br />

      {/* ================= DATOS CLIENTE ================= */}
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
              <td colSpan={3}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      {/* ================= ACTIVIDADES ================= */}
      <table className="pdf-table">
        <thead>
          <tr>
            <th style={{ width: 50 }}>ÍTEM</th>
            <th>DESCRIPCIÓN DE ACTIVIDADES</th>
            <th style={{ width: 200 }}>IMAGEN</th>
          </tr>
        </thead>
        <tbody>
          {data.actividades.map((a, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <strong>{a.titulo}</strong>
                <br />
                {a.detalle}
              </td>
              <td style={{ textAlign: "center" }}>
                {a.imagen && (
                  <img
                    src={a.imagen}
                    style={{ maxWidth: 180, maxHeight: 120 }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
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
              <td colSpan={3}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

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
            <td style={{ height: 120, textAlign: "center" }}>
              {data.firmas.tecnico && (
                <img src={data.firmas.tecnico} style={{ maxHeight: 100 }} />
              )}
            </td>
            <td style={{ height: 120, textAlign: "center" }}>
              {data.firmas.cliente && (
                <img src={data.firmas.cliente} style={{ maxHeight: 100 }} />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex justify-between print:hidden">
        <button
          onClick={() => navigate("/informe")}
          className="border px-4 py-2"
        >
          Volver
        </button>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  );
}
