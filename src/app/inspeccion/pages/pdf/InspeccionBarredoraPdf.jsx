import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   UTILIDAD: APLANAR ITEMS A–B–C–D
   (MISMA IDEA QUE HIDRO)
============================= */
function flattenItems(items = {}) {
  const result = [];
  Object.values(items).forEach((grupo) => {
    if (typeof grupo === "object") {
      Object.entries(grupo).forEach(([codigo, item]) => {
        result.push({ codigo, ...item });
      });
    }
  });
  return result;
}

export default function InspeccionBarredoraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  /* =============================
     CARGA (IGUAL HIDRO)
  ============================= */
  useEffect(() => {
    const found = getInspectionById("barredora", id);
    if (found) setInspection(found);
  }, [id]);

  if (!inspection) {
    return <div className="p-6">Cargando inspección…</div>;
  }

  const { data } = inspection;
  const flatItems = flattenItems(data.items);

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
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td>{data.descripcion || "—"}</td>
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
                <img
                  src="/estado equipo barredora.png"
                  style={{ width: "100%" }}
                />

                {/* === PUNTOS ROJOS === */}
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

            {data.estadoEquipoPuntos?.length > 0 ? (
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

        {/* ================= EVALUACIÓN DE SISTEMAS ================= */}
        <h3 className="pdf-title mt-4">EVALUACIÓN DE SISTEMAS</h3>

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
            {flatItems.length > 0 ? (
              flatItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.codigo}</td>
                  <td>{item.detalle || "—"}</td>
                  <td>{item.estado || "—"}</td>
                  <td>{item.observacion || ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  — Sin ítems evaluados —
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            {[
              ["MARCA", data.marca],
              ["MODELO", data.modelo],
              ["SERIE", data.serie],
              ["AÑO MODELO", data.anioModelo],
              ["VIN", data.vin],
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
                    style={{ maxHeight: 100 }}
                  />
                )}
              </td>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.cliente && (
                  <img
                    src={data.firmas.cliente}
                    style={{ maxHeight: 100 }}
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
