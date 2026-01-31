import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   PRUEBAS PREVIAS
============================= */
const pruebasPrevias = [
  ["1.1", "Encendido general del equipo"],
  ["1.2", "Funcionamiento del monitor"],
  ["1.3", "Funcionamiento del cabezal"],
];

/* =============================
   SECCIONES – CÁMARA
============================= */
const secciones = [
  {
    titulo: "A) SISTEMA DE CÁMARA",
    items: [
      ["A.1", "Estado del cabezal"],
      ["A.2", "Estado del cable"],
      ["A.3", "Estado del carrete"],
      ["A.4", "Funcionamiento del contador de metros"],
    ],
  },
  {
    titulo: "B) SISTEMA ELÉCTRICO",
    items: [
      ["B.1", "Fuente de poder"],
      ["B.2", "Conectores"],
      ["B.3", "Iluminación del cabezal"],
    ],
  },
];

export default function InspeccionCamaraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const found = getInspectionById("camara", id);
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
      <td rowSpan={4} style={{ width: 140, textAlign: "center" }}>
        <img src="/astap-logo.jpg" style={{ maxHeight: 70 }} />
      </td>

      <td className="pdf-title">
        HOJA DE INSPECCIÓN CÁMARA
      </td>

      <td rowSpan={4} style={{ width: 180, fontSize: 10 }}>
        <div>Fecha versión: <strong>01-01-26</strong></div>
        <div>Versión: <strong>01</strong></div>
      </td>
    </tr>

    <tr>
      <td>
        <table className="pdf-table" style={{ border: "none" }}>
          <tbody>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td>{data.referenciaContrato || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td>{data.descripcion || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">COD. INF.</td>
              <td>{data.codInf || "—"}</td>
            </tr>
          </tbody>
        </table>
      </td>
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

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td colSpan={2} style={{ position: "relative" }}>
                <img src="/estado equipo camara.png" style={{ width: "100%" }} />
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
            {data.estadoEquipoPuntos?.map((pt) => (
              <tr key={pt.id}>
                <td className="pdf-label">{pt.id}</td>
                <td>{pt.nota || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= PRUEBAS PREVIAS ================= */}
        <h3 className="pdf-title mt-4">1. PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO</h3>

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
            {pruebasPrevias.map(([codigo, texto]) => {
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

        {/* ================= SECCIONES ================= */}
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
          <button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
            Volver
          </button>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-4 py-2 rounded">
            Descargar PDF
          </button>
        </div>

      </div>
    </div>
  );
}
