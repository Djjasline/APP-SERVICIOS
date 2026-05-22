import { supabase } from "@/lib/supabase";
import { printPdf } from "@/utils/printPdf";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const S = {
  tbl: { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  cell: {
    border: "1px solid #374151",
    padding: "6px 8px",
    verticalAlign: "middle",
    fontSize: 11,
  },
  label: {
    border: "1px solid #374151",
    padding: "6px 8px",
    verticalAlign: "middle",
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: "#f3f4f6",
    width: "35%",
  },
  th: {
    border: "1px solid #374151",
    padding: "6px 8px",
    backgroundColor: "#1e3a5f",
    color: "#fff",
    fontWeight: 700,
    textAlign: "center",
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 800,
    textAlign: "center",
    textTransform: "uppercase",
    padding: "6px 8px",
    backgroundColor: "#1e3a5f",
    color: "#fff",
    margin: "14px 0 0 0",
    border: "1px solid #1e3a5f",
  },
};

const interior = [
  "GATA",
  "LLAVE CRUZ",
  "EXTINTOR",
  "LUZ CABINA",
  "RADIO",
  "TAPETES",
  "ENCENDEDOR",
  "AIRE",
  "ALARMA",
];

const motor = [
  "ACEITE",
  "REFRIGERANTE",
  "BATERIA",
  "TAPON ACEITE",
  "TAPA COMB",
  "RADIADOR",
];

const exterior = [
  "PLUMAS",
  "RETROVISOR",
  "PLACAS",
  "LLANTA",
  "TAPACUBOS",
  "LUCES",
];

export default function RecepcionPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("area", "operaciones")
        .eq("tipo", "recepcion")
        .eq("subtipo", "general")
        .single();

      if (error || !data) {
        console.error(error);
        return;
      }

      setReport({
        id: data.id,
        estado: data.estado,
        data: data.data,
        createdAt: data.created_at,
      });
    };

    load();
  }, [id]);

  if (!report) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró la recepción.</p>
        <button
          onClick={() => navigate("/operaciones/recepcion")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  if (report.estado !== "completado") {
    return (
      <div className="p-6 text-center">
        <p>Esta recepción aún no está completada.</p>
        <button
          onClick={() => navigate("/operaciones/recepcion")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const form = report.data?.formulario || {};
  const checks = report.data?.checks || {};
  const fuelLevel = report.data?.fuelLevel ?? 0.5;
  const equipo = form.equipo || {};

  const handlePrint = () => {
    const cliente = (form.cliente || "cliente").replace(/\s+/g, "-");
    const codigo = (form.codigo || "000").replace(/\s+/g, "");
    printPdf("pdf-content", `Recepcion_${cliente}_${codigo}_ASTAP`);
  };

  const CheckValue = ({ active }) => (
    <td
      style={{
        ...S.cell,
        textAlign: "center",
        backgroundColor: active ? "#dcfce7" : "#fff",
        fontWeight: active ? 700 : 400,
      }}
    >
      {active ? "✓" : ""}
    </td>
  );

  const renderCheckRow = (prefix, item) => {
    const value = checks[`${prefix}_${item}`];

    return (
      <tr key={`${prefix}_${item}`}>
        <td style={S.cell}>{item}</td>
        <CheckValue active={value === "SI"} />
        <CheckValue active={value === "NO"} />
      </tr>
    );
  };

  return (
    <div
      style={{
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
      <div
        id="pdf-content"
        style={{
          maxWidth: 794,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: 6,
        }}
      >
        {/* ENCABEZADO */}
        <table style={S.tbl}>
          <tbody>
            <tr>
              <td
                rowSpan={4}
                style={{
                  ...S.cell,
                  width: 130,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  style={{
                    maxHeight: 65,
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              </td>

              <td
                colSpan={2}
                style={{
                  ...S.cell,
                  textAlign: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  textTransform: "uppercase",
                }}
              >
                HOJA DE RECEPCIÓN
              </td>

              <td style={{ ...S.cell, width: 170 }}>
                <div>
                  Fecha versión: <strong>01-01-26</strong>
                </div>
                <div>
                  Versión: <strong>01</strong>
                </div>
              </td>
            </tr>

            {[
              ["REFERENCIA DE CONTRATO", form.referencia],
              ["DESCRIPCIÓN", form.descripcion],
              ["CÓDIGO", form.codigo],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={S.label}>{label}</td>
                <td colSpan={2} style={S.cell}>
                  {value || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DATOS */}
        <p style={S.sectionTitle}>DATOS DEL CLIENTE Y TÉCNICO</p>
        <table style={S.tbl}>
          <tbody>
            {[
              ["CLIENTE", form.cliente],
              ["DIRECCIÓN", form.direccion],
              ["CONTACTO", form.contacto],
              ["TELÉFONO", form.telefono],
              ["CORREO", form.correo],
              ["TÉCNICO RESPONSABLE", form.tecnico],
              ["TELÉFONO TÉCNICO", form.telefonoTecnico],
              ["CORREO TÉCNICO", form.correoTecnico],
              ["FECHA", form.fecha],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={S.label}>{label}</td>
                <td style={S.cell}>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EQUIPO */}
        <p style={S.sectionTitle}>DESCRIPCIÓN DEL EQUIPO</p>
        <table style={S.tbl}>
          <tbody>
            {[
              ["NOTA", equipo.nota],
              ["MARCA", equipo.marca],
              ["MODELO", equipo.modelo],
              ["N° SERIE", equipo.serie],
              ["AÑO MODELO", equipo.anio],
              ["VIN / CHASIS", equipo.vin],
              ["PLACA", equipo.placa],
              ["HORAS MÓDULO", equipo.horasModulo],
              ["HORAS CHASIS", equipo.horasChasis],
              ["KILOMETRAJE", equipo.kilometraje],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={S.label}>{label}</td>
                <td style={S.cell}>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CHECKS */}
        <p style={S.sectionTitle}>DOCUMENTOS Y ESTADO DEL VEHÍCULO</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>INTERIOR</th>
                <th style={S.th}>SI</th>
                <th style={S.th}>NO</th>
              </tr>
            </thead>
            <tbody>{interior.map((i) => renderCheckRow("int", i))}</tbody>
          </table>

          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>MOTOR</th>
                <th style={S.th}>SI</th>
                <th style={S.th}>NO</th>
              </tr>
            </thead>
            <tbody>{motor.map((i) => renderCheckRow("mot", i))}</tbody>
          </table>

          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>EXTERIOR</th>
                <th style={S.th}>SI</th>
                <th style={S.th}>NO</th>
              </tr>
            </thead>
            <tbody>{exterior.map((i) => renderCheckRow("ext", i))}</tbody>
          </table>
        </div>

        {/* COMBUSTIBLE */}
        <p style={S.sectionTitle}>COMBUSTIBLE</p>
        <table style={S.tbl}>
          <tbody>
            <tr>
              <td style={S.label}>NIVEL DE COMBUSTIBLE</td>
              <td style={S.cell}>{Math.round(fuelLevel * 100)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* BOTONES */}
      <div
        className="no-print"
        style={{
          maxWidth: 794,
          margin: "24px auto 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => navigate("/operaciones/recepcion")}
          className="border px-6 py-2 rounded"
        >
          Volver
        </button>

        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
