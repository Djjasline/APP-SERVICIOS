import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   CHECKLIST BARREDORA
============================= */
const secciones = [
  {
    titulo: "A) SISTEMA DE BARRIDO",
    items: [
      ["A.1", "Cepillo central"],
      ["A.2", "Cepillos laterales"],
      ["A.3", "Sistema de elevación"],
      ["A.4", "Tolva de residuos"],
      ["A.5", "Sistema de aspiración"],
    ],
  },
  {
    titulo: "B) SISTEMA HIDRÁULICO",
    items: [
      ["B.1", "Fugas hidráulicas"],
      ["B.2", "Nivel de aceite hidráulico"],
      ["B.3", "Mangueras y acoples"],
    ],
  },
  {
    titulo: "C) SISTEMA ELÉCTRICO",
    items: [
      ["C.1", "Tablero de control"],
      ["C.2", "Sensores"],
      ["C.3", "Luces y señalización"],
    ],
  },
];

export default function InspeccionBarredoraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const found = getInspectionById("barredora", id);
    if (found) setInspection(found);
  }, [id]);

  if (!inspection) {
    return <div className="p-6">Cargando inspección…</div>;
  }

  const { data } = inspection;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto">

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td rowSpan={3} style={{ width: 140, textAlign: "center" }}>
                <img src="/astap-logo.jpg" style={{ maxHeight: 70 }} />
              </td>
              <td colSpan={2} className="pdf-title">
                HOJA DE INSPECCIÓN BARREDORA
              </td>
            </tr>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td>{data.referenciaContrato || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">COD. INF.</td>
              <td>{data.codInf || "—"}</td>
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
              ["FECHA DE SERVICIO", data.fechaServicio],
            ].map(([l, v], i) => (
              <tr key={i}>
                <td className="pdf-label">{l}</td>
                <td>{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= CHECKLIST ================= */}
        {secciones.map((sec) => (
          <div key={sec.titulo}>
            <h3 className="pdf-title mt-4">{sec.titulo}</h3>

            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {sec.items.map(([codigo, texto]) => {
                  const item = data.items?.[codigo] || {};
                  return (
                    <tr key={codigo}>
                      <td>{codigo}</td>
                      <td>{texto}</td>
                      <td>{item.estado || "—"}</td>
                      <td>{item.observacion || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

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
                  <img
                    src={data.firmas.tecnico}
                    style={{
                      maxHeight: "100px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
              </td>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.cliente && (
                  <img
                    src={data.firmas.cliente}
                    style={{
                      maxHeight: "100px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
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
