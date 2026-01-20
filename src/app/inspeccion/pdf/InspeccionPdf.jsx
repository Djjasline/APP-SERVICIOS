import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

const ESTADO_IMAGEN = {
  hidro: "/estado-equipo.png",
  barredora: "/estado equipo barredora.png",
  camara: "/estado equipo camara.png",
};

const TITULOS = {
  preServicio: "1. PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO",
  sistemaHidraulicoAceite: "A) SISTEMA HIDRÁULICO (ACEITES)",
  sistemaHidraulicoAgua: "B) SISTEMA HIDRÁULICO (AGUA)",
  sistemaElectrico: "C) SISTEMA ELÉCTRICO / ELECTRÓNICO",
  sistemaSuccion: "D) SISTEMA DE SUCCIÓN",
};

export default function InspeccionPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const TYPE = "hidro";

  const inspection = getInspectionById(TYPE, id);
  if (!inspection) {
    return (
      <div className="p-6">
        <p>No se encontró la inspección</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const data = inspection.data || {};
  const puntos = data.estadoEquipoPuntos || [];
  const imagenEstado = ESTADO_IMAGEN[data.tipoFormulario || TYPE];

  return (
    <div className="p-6 bg-white text-xs">
      <div className="max-w-6xl mx-auto">

        {/* BOTONES SOLO PANTALLA */}
        <div className="flex justify-between mb-4 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded text-sm"
          >
            ← Volver
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
          >
            Imprimir
          </button>
        </div>

        {/* ================= ENCABEZADO ================= */}
        <table className="w-full border-collapse border">
          <tbody>
            <tr>
              <td rowSpan={3} className="border p-2 w-32 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-16" />
              </td>
              <td colSpan={4} className="border p-2 font-bold text-center">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">REFERENCIA CONTRATO</td>
              <td className="border p-1">{data.referenciaContrato || ""}</td>
              <td className="border p-1 font-semibold">COD. INF.</td>
              <td className="border p-1">{data.codInf || ""}</td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">DESCRIPCIÓN</td>
              <td colSpan={3} className="border p-1">
                {data.descripcion || ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="w-full border-collapse border mt-2">
          <tbody>
            {[
              ["CLIENTE", data.cliente?.nombre],
              ["DIRECCIÓN", data.cliente?.direccion],
              ["CONTACTO", data.cliente?.contacto],
              ["TELÉFONO", data.cliente?.telefono],
              ["CORREO", data.cliente?.correo],
              ["FECHA DE SERVICIO", data.fechaServicio],
            ].map(([l, v]) => (
              <tr key={l}>
                <td className="border p-1 font-semibold w-40">{l}</td>
                <td className="border p-1">{v || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <table className="w-full border-collapse border mt-4">
          <tbody>
            <tr>
              <td className="border p-1 font-bold text-center">
                ESTADO DEL EQUIPO
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <div className="relative">
                  <img src={imagenEstado} className="w-full" />
                  {puntos.map((pt) => (
                    <div
                      key={pt.id}
                      className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
                      style={{
                        left: `${pt.x}%`,
                        top: `${pt.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {pt.id}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {puntos.length > 0 && (
          <table className="w-full border-collapse border mt-2">
            <thead>
              <tr>
                <th className="border p-1 w-12">#</th>
                <th className="border p-1">OBSERVACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {puntos.map((pt) => (
                <tr key={pt.id}>
                  <td className="border p-1 text-center">{pt.id}</td>
                  <td className="border p-1">{pt.nota || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ================= PRUEBAS / EVALUACIÓN ================= */}
        {Object.entries(data.inspeccion || {}).map(([key, lista]) => (
          <table key={key} className="w-full border-collapse border mt-4">
            <thead>
              <tr>
                <th colSpan={4} className="border p-1 text-center font-bold">
                  {TITULOS[key] || key}
                </th>
              </tr>
              <tr>
                <th className="border p-1 w-16">Ítem</th>
                <th className="border p-1">Detalle</th>
                <th className="border p-1 w-16">Estado</th>
                <th className="border p-1">Observación</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((it, i) => (
                <tr key={i}>
                  <td className="border p-1">{it.codigo || ""}</td>
                  <td className="border p-1">{it.detalle || it.texto || ""}</td>
                  <td className="border p-1 text-center">{it.estado || ""}</td>
                  <td className="border p-1">{it.observacion || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <table className="w-full border-collapse border mt-4">
          <thead>
            <tr>
              <th colSpan={2} className="border p-1 text-center font-bold">
                DESCRIPCIÓN DEL EQUIPO
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["MARCA", data.equipo?.marca],
              ["MODELO", data.equipo?.modelo],
              ["SERIE", data.equipo?.serie],
              ["AÑO", data.equipo?.anioModelo],
              ["VIN / CHASIS", data.equipo?.vin],
              ["PLACA", data.equipo?.placa],
              ["HORAS MÓDULO", data.equipo?.horasModulo],
              ["HORAS CHASIS", data.equipo?.horasChasis],
              ["KILOMETRAJE", data.equipo?.kilometraje],
            ].map(([l, v]) => (
              <tr key={l}>
                <td className="border p-1 font-semibold w-40">{l}</td>
                <td className="border p-1">{v || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="w-full border-collapse border mt-4">
          <tbody>
            <tr>
              <td className="border p-2 text-center font-semibold">
                FIRMA TÉCNICO
              </td>
              <td className="border p-2 text-center font-semibold">
                FIRMA CLIENTE
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">
                {data.firmas?.tecnico && (
                  <img src={data.firmas.tecnico} className="mx-auto max-h-24" />
                )}
              </td>
              <td className="border p-2 text-center">
                {data.firmas?.cliente && (
                  <img src={data.firmas.cliente} className="mx-auto max-h-24" />
                )}
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
