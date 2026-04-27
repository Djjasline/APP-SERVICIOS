import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function InformePDF() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data, error } = await supabase
          .from("registros")
          .select("*")
          .eq("id", id)
          .eq("tipo", "informe")
          .eq("subtipo", "general")
          .single();

        if (error || !data) {
          console.error("Error cargando informe:", error);
          return;
        }

        setReport({
          id: data.id,
          estado: data.estado,
          data: data.data,
        });
      } catch (err) {
        console.error("Error:", err);
      }
    };

    loadReport();
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

  if ((report.estado || "").toLowerCase() !== "completado") {
    return (
      <div className="p-6 text-center">
        <p>Este informe no está completado.</p>
        <button
          onClick={() => navigate("/informe")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const estadoEquipoImagenes = data?.estadoEquipo?.imagenes || [];

  return (
    <div>

      {/* ================= BOTONES ================= */}
      <div className="no-print flex justify-between mt-6 px-4">
        <button
          onClick={() => navigate("/informe")}
          className="border px-6 py-2 rounded"
        >
          Volver
        </button>

        <button
          onClick={() => {
            const nombre = `ASTAP_${data.cliente || "cliente"}_${data.pedidoDemanda || "pedido"}_${data.codInf || "inf"}`
              .replace(/\s+/g, "_");

            document.title = nombre;
            window.print();
          }}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Descargar PDF
        </button>
      </div>

      {/* ================= PDF ================= */}
      <div className="print-area">
        <div className="pdf-container max-w-6xl mx-auto bg-white p-4 md:p-6">

          {/* HEADER */}
          <table className="pdf-table w-full">
            <tbody>
              <tr>
                <td rowSpan={5} style={{ width: 140, textAlign: "center" }}>
                  <img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 70 }} />
                </td>

                <td colSpan={2} className="pdf-title">
                  INFORME GENERAL DE SERVICIOS
                </td>

                <td style={{ width: 180 }}>
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>

              <tr>
                <td className="pdf-label">REFERENCIA CONTRATO</td>
                <td colSpan={2}>{data.referenciaContrato || "—"}</td>
              </tr>

              <tr>
                <td className="pdf-label">PEDIDO / DEMANDA</td>
                <td colSpan={2}>{data.pedidoDemanda || "—"}</td>
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

          {/* CLIENTE */}
          <table className="pdf-table w-full mt-4">
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
                  <td>{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EQUIPO */}
          <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>
          <table className="pdf-table w-full">
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
                  <td>{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ESTADO EQUIPO */}
          <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

          {estadoEquipoImagenes.map((img, i) => (
            <div key={i} className="mt-4">
              <img src={img.url} alt="" />
            </div>
          ))}

          {/* SALTO */}
          <div className="page-break" />

          {/* ACTIVIDADES */}
          <h3 className="pdf-title mt-4">ACTIVIDADES REALIZADAS</h3>
          <table className="pdf-table w-full">
            <tbody>
              {data.actividades?.map((a, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{a.titulo}</td>
                  <td>{a.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>

{/* ================= CONCLUSIONES Y RECOMENDACIONES ================= */}
<div className="no-break">
  <table className="pdf-table w-full mt-4">
    <thead>
      <tr>
        <th colSpan={2}>CONCLUSIONES</th>
        <th colSpan={2}>RECOMENDACIONES</th>
      </tr>
    </thead>

    <tbody>
      {(data.conclusiones || []).map((c, i) => (
        <tr key={i}>
          {/* NUMERO CONCLUSIÓN */}
          <td style={{ width: 30, textAlign: "center" }}>
            {i + 1}
          </td>

          {/* TEXTO CONCLUSIÓN */}
          <td style={{ whiteSpace: "pre-wrap" }}>
            {c || "—"}
          </td>

          {/* NUMERO RECOMENDACIÓN */}
          <td style={{ width: 30, textAlign: "center" }}>
            {i + 1}
          </td>

          {/* TEXTO RECOMENDACIÓN */}
          <td style={{ whiteSpace: "pre-wrap" }}>
            {data.recomendaciones?.[i] || "—"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
          
          {/* FIRMAS */}
          <table className="pdf-table w-full mt-4">
            <tbody>
              <tr>
                <td>
                  {data.firmas?.tecnico && <img src={data.firmas.tecnico} />}
                  <div>{data.tecnicoNombre}</div>
                </td>
                <td>
                  {data.firmas?.cliente && <img src={data.firmas.cliente} />}
                  <div>{data.cliente}</div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
