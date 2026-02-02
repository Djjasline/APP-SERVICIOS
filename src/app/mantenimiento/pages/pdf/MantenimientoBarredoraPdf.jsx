import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* =============================
   SECCIONES – PDF MANTENIMIENTO BARREDORA
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Encendido general del equipo"],
      ["1.2", "Funcionamiento de controles y tablero"],
      ["1.3", "Revisión de alarmas o fallas"],
    ],
  },
  {
    id: "2",
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO",
    tipo: "cantidad",
    items: [
      ["2.1", "Filtro de combustible primario (trampa de agua)"],
      ["2.2", "Filtro de combustible secundario (bomba)"],
      ["2.3", "Aceite de motor 15W40 (4 GL)"],
      ["2.4", "Filtro de aceite de motor"],
      ["2.5", "Filtro de aire primario interno"],
      ["2.6", "Filtro de aire secundario exterior"],
      ["2.7", "Reemplazo de filtros de combustible"],
      ["2.8", "Comprobación tensión tensor de correa y desgaste de banda"],
      ["2.9", "Reemplazo de aceite de motor"],
      ["2.10", "Reemplazo filtro de aceite de motor"],
      ["2.11", "Mantenimiento por 250 Hrs"],
      ["2.12", "Mano de obra mantenimiento por 1000 Hrs motor"],
      ["2.13", "Inspección visual de bomba de agua"],
      ["2.14", "Verificación manguera respiradero cárter y válvula"],
      ["2.15", "Calibración de válvulas del motor"],
      ["2.16", "Cambio de empaque tapa de válvulas"],
      ["2.17", "Limpieza de inyectores por método de recirculación"],
      ["2.18", "Reemplazo de termostato"],
      ["2.19", "Cambio de refrigerante"],
      ["2.20", "Reemplazo de filtros de aire"],
      ["2.21", "Aceite hidráulico AW 68"],
      ["2.22", "Kit filtro hidráulico"],
      ["2.23", "Aceite sintético SHC 629 cubo de ruedas"],
      ["2.24", "Filtro de aire acondicionado"],
      ["2.25", "Refrigerante JD tanque 2 1/2 gal"],
      ["2.26", "Grasa JD multipropósito"],
      ["2.27", "Termostato"],
      ["2.28", "Empaque tapa de válvula"],
      ["2.29", "Junta del termostato"],
      ["2.30", "Elemento filtrante"],
      ["2.31", "Aditivo limpieza de inyectores"],
      ["2.32", "Set segmento cepillo lateral"],
      ["2.33", "Cepillo central"],
      ["2.34", "Caucho zapata lateral"],
      ["2.35", "Caucho zapata esquinera"],
      ["2.36", "Cadena banda transportadora"],
      ["2.37", "Piñón hidromotor banda transportadora"],
      ["2.38", "Piñón rodillo superior banda"],
      ["2.39", "Filtro de agua"],
      ["2.40", "Chumacera eje cepillo"],
      ["2.41", "Chumacera rodillo superior"],
      ["2.42", "Chumacera eje inferior banda"],
      ["2.43", "Banda transportadora"],
    ],
  },
  {
    id: "3",
    titulo:
      "3. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POST SERVICIO",
    tipo: "simple",
    items: [
      ["3.1", "Encendido general del equipo"],
      ["3.2", "Funcionamiento del sistema de barrido"],
      ["3.3", "Funcionamiento del sistema hidráulico"],
    ],
  },
];

export default function MantenimientoBarredoraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-barredora")) || [];
    const found = stored.find((r) => r.id === id);
    if (found) setRecord(found);
  }, [id]);

  if (!record) {
    return <div className="p-6">Cargando mantenimiento…</div>;
  }

  const { data } = record;

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
              <td colSpan={2} className="pdf-title">
                HOJA DE MANTENIMIENTO BARREDORA
              </td>
              <td>
                <strong>Fecha versión:</strong> 015-01-2026<br />
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

{/* ================= DATOS CLIENTE / TÉCNICO ================= */}
<table className="pdf-table mt-4">
  <tbody>
    {[
      ["CLIENTE", data.cliente],
      ["DIRECCIÓN", data.direccion],
      ["CONTACTO", data.contacto],
      ["TELÉFONO", data.telefono],
      ["CORREO", data.correo],
      ["TÉCNICO RESPONSABLE", data.tecnicoResponsable],
      ["TELÉFONO TÉCNICO", data.telefonoTecnico],
      ["CORREO TÉCNICO", data.correoTecnico],
      ["FECHA DE SERVICIO", data.fechaServicio],
    ].map(([label, value], i) => (
      <tr key={i}>
        <td className="pdf-label">{label}</td>
        <td>{value || "—"}</td>
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

        {/* ================= TABLAS ================= */}
        {secciones.map((sec) => (
          <div key={sec.id} className="mt-4">
            <h3 className="pdf-title">{sec.titulo}</h3>
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Detalle</th>
                  {sec.tipo === "cantidad" && <th>Cantidad</th>}
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
                      {sec.tipo === "cantidad" && (
                        <td>{item.cantidad || "—"}</td>
                      )}
                      <td>{item.estado || "—"}</td>
                      <td>{item.observacion || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* ================= DESCRIPCIÓN EQUIPO ================= */}
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
            onClick={() => navigate("/mantenimiento")}
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
