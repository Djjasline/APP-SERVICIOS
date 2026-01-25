import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

export default function InspeccionHidroPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  /* =============================
     CARGAR INSPECCIÓN
  ============================== */
  useEffect(() => {
    const stored = getInspectionById("hidro", id);

    // 🔒 SOLO COMPLETADAS
    if (!stored || stored.estado !== "completada") {
      navigate("/inspeccion");
      return;
    }

    setInspection(stored.data);
  }, [id, navigate]);

  if (!inspection) {
    return <div className="p-6">Cargando…</div>;
  }

  const {
    cliente = "",
    direccion = "",
    contacto = "",
    telefono = "",
    correo = "",
    tecnicoResponsable = "",
    telefonoTecnico = "",
    correoTecnico = "",
    fechaServicio = "",
    estadoEquipoPuntos = [],
    items = {},
    nota = "",
    marca = "",
    modelo = "",
    serie = "",
    anioModelo = "",
    vin = "",
    placa = "",
    horasModulo = "",
    horasChasis = "",
    kilometraje = "",
    firmas = {},
  } = inspection;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white p-6">

        {/* ================= ENCABEZADO ================= */}
        <table className="w-full border-collapse border text-sm mb-4">
          <tbody>
            <tr>
              <td rowSpan={4} className="border w-32 text-center p-2">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  style={{ maxHeight: 70, margin: "0 auto" }}
                />
              </td>
              <td colSpan={2} className="border text-center font-bold">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
              <td className="border p-2">
                <div>Fecha versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            <tr>
              <td className="border font-semibold p-2">CLIENTE</td>
              <td colSpan={2} className="border p-2">{cliente}</td>
            </tr>
            <tr>
              <td className="border font-semibold p-2">DIRECCIÓN</td>
              <td colSpan={2} className="border p-2">{direccion}</td>
            </tr>
            <tr>
              <td className="border font-semibold p-2">FECHA SERVICIO</td>
              <td colSpan={2} className="border p-2">{fechaServicio}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="font-semibold mb-2">ESTADO DEL EQUIPO</h3>

        <div className="relative border mb-2">
          <img src="/estado-equipo.png" className="w-full" />
          {estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              style={{
                position: "absolute",
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: "translate(-50%, -50%)",
                background: "red",
                color: "#fff",
                width: 20,
                height: 20,
                borderRadius: "50%",
                fontSize: 12,
                textAlign: "center",
                lineHeight: "20px",
              }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {estadoEquipoPuntos.map((pt) => (
          <p key={pt.id} className="text-sm">
            <strong>{pt.id})</strong> {pt.nota || "—"}
          </p>
        ))}

        {/* ================= DESCRIPCIÓN EQUIPO ================= */}
        <h3 className="font-semibold mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="w-full border text-sm border-collapse">
          <tbody>
            {[
              ["NOTA", nota],
              ["MARCA", marca],
              ["MODELO", modelo],
              ["SERIE", serie],
              ["AÑO MODELO", anioModelo],
              ["VIN", vin],
              ["PLACA", placa],
              ["HORAS MÓDULO", horasModulo],
              ["HORAS CHASIS", horasChasis],
              ["KILOMETRAJE", kilometraje],
            ].map(([l, v], i) => (
              <tr key={i}>
                <td className="border font-semibold p-2">{l}</td>
                <td className="border p-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="w-full border-collapse border text-sm mt-6">
          <thead>
            <tr>
              <th className="border p-2">FIRMA TÉCNICO ASTAP</th>
              <th className="border p-2">FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border text-center p-4">
                {firmas.tecnico && (
                  <img src={firmas.tecnico} style={{ maxHeight: 120 }} />
                )}
              </td>
              <td className="border text-center p-4">
                {firmas.cliente && (
                  <img src={firmas.cliente} style={{ maxHeight: 120 }} />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/inspeccion")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
