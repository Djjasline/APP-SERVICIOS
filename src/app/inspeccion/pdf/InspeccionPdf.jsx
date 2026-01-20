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
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ================= ENCABEZADO ================= */}
        <table className="w-full border-collapse border">
          <tbody>
            <tr>
              <td rowSpan={4} className="border p-2 w-32 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-16" />
              </td>
              <td colSpan={2} className="border p-2 font-bold text-center">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">REFERENCIA DE CONTRATO</td>
              <td className="border p-1">{data.referenciaContrato || ""}</td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">COD. INF.</td>
              <td className="border p-1">{data.codInf || ""}</td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">DESCRIPCIÓN</td>
              <td className="border p-1">{data.descripcion || ""}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="w-full border-collapse border">
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
        {imagenEstado && (
          <section className="border p-4 space-y-2">
            <h2 className="font-bold text-center">ESTADO DEL EQUIPO</h2>

            <div className="relative border">
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
          </section>
        )}

        {/* ================= PRUEBAS Y EVALUACIONES ================= */}
        {Object.entries(data.inspeccion || {}).map(([key, lista]) => (
          <section key={key} className="border p-4">
            <h2 className="font-bold text-center mb-2">
              {TITULOS[key] || key}
            </h2>

            <table className="w-full border-collapse border">
              <thead>
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
          </section>
        ))}

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <section className="border p-4">
          <h2 className="font-bold text-center mb-2">
            DESCRIPCIÓN DEL EQUIPO
          </h2>

          <table className="w-full border-collapse border">
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
        </section>

        {/* ================= FIRMAS ================= */}
        <section className="grid grid-cols-2 gap-6 text-center border p-4">
          <div>
            <p className="font-semibold mb-1">FIRMA TÉCNICO</p>
            {data.firmas?.tecnico && (
              <img src={data.firmas.tecnico} className="mx-auto max-h-32" />
            )}
          </div>
          <div>
            <p className="font-semibold mb-1">FIRMA CLIENTE</p>
            {data.firmas?.cliente && (
              <img src={data.firmas.cliente} className="mx-auto max-h-32" />
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
