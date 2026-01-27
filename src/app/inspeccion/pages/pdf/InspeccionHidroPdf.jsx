import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   DEFINICIONES (MISMAS DEL FORM)
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

const secciones = [
  {
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite en la caja de transferencia"],
      ["A.5", "Manómetro de filtro hidráulico"],
      ["A.6", "Filtro hidráulico retorno"],
      ["A.7", "Filtros de succión tanque"],
      ["A.8", "Cilindros hidráulicos"],
      ["A.9", "Tapones de drenaje"],
      ["A.10", "Bancos hidráulicos"],
    ],
  },
  {
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros malla agua"],
      ["B.2", "Empaques filtros"],
      ["B.3", "Fugas de agua"],
      ["B.4", "Válvula alivio pistola"],
      ["B.5", "Tanque aluminio"],
      ["B.6", "Medidor nivel"],
      ["B.7", "Tapón expansión"],
      ["B.8", "Drenaje bomba"],
      ["B.9", "Válvulas check"],
      ["B.10", "Manómetros presión"],
    ],
  },
  {
    titulo: "C) SISTEMA ELÉCTRICO / ELECTRÓNICO",
    items: [
      ["C.1", "Funciones tablero frontal"],
      ["C.2", "Tablero cabina"],
      ["C.3", "Control remoto"],
      ["C.4", "Electroválvulas"],
      ["C.5", "Humedad componentes"],
      ["C.6", "Luces externas"],
    ],
  },
  {
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Sellos del tanque"],
      ["D.2", "Interior del tanque"],
      ["D.3", "Microfiltro"],
      ["D.4", "Tapón drenaje"],
      ["D.5", "Mangueras"],
      ["D.6", "Seguros compuerta"],
      ["D.7", "Sistema desfogue"],
      ["D.8", "Válvulas alivio"],
      ["D.9", "Operación soplador"],
    ],
  },
];

export default function InspeccionHidroPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  /* =============================
     CARGAR INSPECCIÓN
  ============================= */
  useEffect(() => {
    const stored = getInspectionById("hidro", id);

    if (!stored || stored.estado !== "completada") {
      navigate("/inspeccion");
      return;
    }

    setData(stored.data);
  }, [id, navigate]);

  if (!data) return null;

  const item = (codigo) => data.items?.[codigo] || {};

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 space-y-6">

        {/* ================= ENCABEZADO ================= */}
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td rowSpan={4} className="w-32 text-center border">
                <img src="/astap-logo.jpg" className="mx-auto h-16" />
              </td>
              <td colSpan={2} className="border font-bold text-center">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
              <td className="border text-xs p-2">
                <div>Fecha versión: 01-01-26</div>
                <div>Versión: 01</div>
              </td>
            </tr>
            <tr>
              <td className="border font-semibold">REFERENCIA</td>
              <td colSpan={2} className="border">{data.referenciaContrato || ""}</td>
            </tr>
            <tr>
              <td className="border font-semibold">DESCRIPCIÓN</td>
              <td colSpan={2} className="border">{data.descripcion || ""}</td>
            </tr>
            <tr>
              <td className="border font-semibold">COD. INF.</td>
              <td colSpan={2} className="border">{data.codInf || ""}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="w-full border text-sm">
          <tbody>
            {[
              ["CLIENTE", data.cliente],
              ["DIRECCIÓN", data.direccion],
              ["CONTACTO", data.contacto],
              ["TELÉFONO", data.telefono],
              ["CORREO", data.correo],
              ["FECHA SERVICIO", data.fechaServicio],
            ].map(([l, v]) => (
              <tr key={l}>
                <td className="border font-semibold w-48">{l}</td>
                <td className="border">{v || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="font-semibold">ESTADO DEL EQUIPO</h3>
        <div className="relative border p-2">
          <img src="/estado-equipo.png" className="w-full" />
          {data.estadoEquipoPuntos?.map((p) => (
            <div
              key={p.id}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {p.id}
            </div>
          ))}
        </div>

        {data.estadoEquipoPuntos?.map((p) => (
          <div key={p.id} className="text-sm">
            <strong>{p.id})</strong> {p.nota || ""}
          </div>
        ))}

        {/* ================= CHECKLIST ================= */}
        <h3 className="font-semibold">1. PRUEBAS PREVIAS</h3>
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border">Ítem</th>
              <th className="border">Detalle</th>
              <th className="border">Estado</th>
              <th className="border">Observación</th>
            </tr>
          </thead>
          <tbody>
            {pruebasPrevias.map(([c, t]) => (
              <tr key={c}>
                <td className="border">{c}</td>
                <td className="border">{t}</td>
                <td className="border">{item(c).estado || "—"}</td>
                <td className="border">{item(c).observacion || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= SECCIONES ================= */}
        {secciones.map((sec) => (
          <div key={sec.titulo}>
            <h3 className="font-semibold mt-4">{sec.titulo}</h3>
            <table className="w-full border text-sm">
              <thead>
                <tr>
                  <th className="border">Ítem</th>
                  <th className="border">Detalle</th>
                  <th className="border">Estado</th>
                  <th className="border">Observación</th>
                </tr>
              </thead>
              <tbody>
                {sec.items.map(([c, t]) => (
                  <tr key={c}>
                    <td className="border">{c}</td>
                    <td className="border">{t}</td>
                    <td className="border">{item(c).estado || "—"}</td>
                    <td className="border">{item(c).observacion || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* ================= DESCRIPCIÓN EQUIPO ================= */}
        <h3 className="font-semibold">DESCRIPCIÓN DEL EQUIPO</h3>
        <table className="w-full border text-sm">
          <tbody>
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
            ].map(([l, v]) => (
              <tr key={l}>
                <td className="border font-semibold w-48">{l}</td>
                <td className="border">{v || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="w-full border text-sm mt-4">
          <thead>
            <tr>
              <th className="border">FIRMA TÉCNICO</th>
              <th className="border">FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border text-center h-32">
                {data.firmas?.tecnico && (
                  <img src={data.firmas.tecnico} className="mx-auto max-h-28" />
                )}
              </td>
              <td className="border text-center h-32">
                {data.firmas?.cliente && (
                  <img src={data.firmas.cliente} className="mx-auto max-h-28" />
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
