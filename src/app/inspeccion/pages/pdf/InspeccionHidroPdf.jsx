import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   PRUEBAS PREVIAS
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES
============================= */
const secciones = [
  {
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras - acoples - bancos)"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite en la caja de transferencia"],
      ["A.5", "Manómetro de filtro hidráulico de retorno"],
      ["A.6", "Filtro hidráulico de retorno, presenta fugas o daños"],
      ["A.7", "Filtros de succión del tanque hidráulico"],
      ["A.8", "Cilindros hidráulicos, presentan fugas o daños"],
      ["A.9", "Tapones de drenaje de lubricantes"],
      ["A.10", "Bancos hidráulicos, presentan fugas o daños"],
    ],
  },
  {
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros malla de agua 2” y 3”"],
      ["B.2", "Empaques de tapa de filtros de agua"],
      ["B.3", "Fugas de agua (mangueras / acoples)"],
      ["B.4", "Válvula de alivio de la pistola"],
      ["B.5", "Golpes o fugas en tanque de aluminio"],
      ["B.6", "Medidor de nivel del tanque"],
      ["B.7", "Tapón de expansión del tanque"],
      ["B.8", "Drenaje de la bomba Rodder"],
      ["B.9", "Válvulas check internas"],
      ["B.10", "Manómetros de presión"],
      ["B.11", "Carrete de manguera de agua"],
      ["B.12", "Soporte del carrete"],
      ["B.13", "Codo giratorio del carrete"],
      ["B.14", "Sistema de trinquete y seguros"],
      ["B.15", "Válvula de alivio de bomba de agua"],
      ["B.16", "Válvulas de 1”"],
      ["B.17", "Válvulas de 3/4”"],
      ["B.18", "Válvulas de 1/2”"],
      ["B.19", "Boquillas"],
    ],
  },
  {
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Funciones del tablero frontal"],
      ["C.2", "Tablero de control en cabina"],
      ["C.3", "Control remoto"],
      ["C.4", "Electroválvulas"],
      ["C.5", "Humedad en componentes"],
      ["C.6", "Luces y accesorios externos"],
    ],
  },
  {
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Sellos del tanque de desperdicios"],
      ["D.2", "Interior del tanque de desechos"],
      ["D.3", "Microfiltro de succión"],
      ["D.4", "Tapón de drenaje del filtro de succión"],
      ["D.5", "Mangueras de succión"],
      ["D.6", "Seguros de compuerta"],
      ["D.7", "Sistema de desfogue"],
      ["D.8", "Válvulas de alivio Kunkle"],
      ["D.9", "Operación del soplador"],
    ],
  },
];

export default function InspeccionHidroPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const found = getInspectionById("hidro", id);
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
              <td rowSpan={5} style={{ width: 140, textAlign: "center" }}>
                <img src="/astap-logo.jpg" style={{ maxHeight: 70 }} />
              </td>
              <td colSpan={2} className="pdf-title">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
              <td>
                <strong>Fecha versión:</strong> 01-01-26<br />
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
                  src="/estado equipo hidro.png"
                  style={{ width: "100%" }}
                />
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

        {/* ================= PRUEBAS PREVIAS ================= */}
        <h3 className="pdf-title mt-4">
          1. PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO
        </h3>

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
