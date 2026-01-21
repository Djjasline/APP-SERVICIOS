import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "../schemas/inspeccionHidroSchema";

const TYPE = "hidro";

const SECCIONES = [
  {
    key: "preServicio",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
    schema: preServicio,
  },
  {
    key: "sistemaHidraulicoAceite",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    schema: sistemaHidraulicoAceite,
  },
  {
    key: "sistemaHidraulicoAgua",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    schema: sistemaHidraulicoAgua,
  },
  {
    key: "sistemaElectrico",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    schema: sistemaElectrico,
  },
  {
    key: "sistemaSuccion",
    titulo: "D) SISTEMA DE SUCCIÓN",
    schema: sistemaSuccion,
  },
];

export default function InspeccionPdf() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const firmaTecnico =
    typeof data.firmas?.tecnico === "string"
      ? data.firmas.tecnico
      : data.firmas?.tecnico?.imagen;

  const firmaCliente =
    typeof data.firmas?.cliente === "string"
      ? data.firmas.cliente
      : data.firmas?.cliente?.imagen;

  return (
    <div className="p-6 bg-white text-xs">
      <div className="max-w-6xl mx-auto">

        {/* ================= ENCABEZADO ================= */}
        <table className="w-full border border-collapse text-xs">
          <tbody>
            <tr>
              <td rowSpan={4} className="border p-2 w-36 text-center">
                <img
                  src="/astap-logo.jpg"
                  className="mx-auto max-h-16"
                  alt="ASTAP"
                />
              </td>
              <td colSpan={2} className="border p-2 text-center font-bold">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold w-56">
                REFERENCIA DE CONTRATO
              </td>
              <td className="border p-1">
                {data.referenciaContrato || ""}
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">
                DESCRIPCIÓN
              </td>
              <td className="border p-1">
                {data.descripcion || ""}
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">
                COD. INF.
              </td>
              <td className="border p-1">
                {data.codInf || ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS DEL SERVICIO ================= */}
        <table className="w-full border border-collapse text-xs mt-2">
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
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="border p-1 font-semibold w-56">
                  {label}
                </td>
                <td className="border p-1">
                  {value || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <table className="w-full border border-collapse mt-3">
          <tbody>
            <tr>
              <td className="border p-1 text-center font-bold">
                ESTADO DEL EQUIPO
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <div className="relative">
                  <img
                    src="/estado-equipo.png"
                    className="w-full"
                    alt="Estado del equipo"
                  />
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

        {/* ================= OBSERVACIONES ESTADO ================= */}
        {puntos.length > 0 && (
          <table className="w-full border border-collapse mt-1">
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

        {/* ================= CHECKLIST ================= */}
        {SECCIONES.map(({ key, titulo, schema }) => (
          <table
            key={key}
            className="w-full border border-collapse mt-4"
          >
            <thead>
              <tr>
                <th colSpan={4} className="border p-1 text-center font-bold">
                  {titulo}
                </th>
              </tr>
              <tr>
                <th className="border p-1 w-16">Ítem</th>
                <th className="border p-1">Detalle</th>
                <th className="border p-1 w-20">SI / NO</th>
                <th className="border p-1">Observación</th>
              </tr>
            </thead>
            <tbody>
             {schema.map((item) => {
  const r =
    data.inspeccion?.[key]?.find(
      (x) => x.codigo === item.codigo
    ) || {};

                return (
                  <tr key={item.codigo}>
                    <td className="border p-1">{item.codigo}</td>
                    <td className="border p-1">{item.descripcion}</td>
                    <td className="border p-1 text-center">
                      {r.estado || ""}
                    </td>
                    <td className="border p-1">
                      {r.observacion || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <table className="w-full border border-collapse mt-4 text-xs">
          <tbody>
            <tr>
              <td colSpan={2} className="border p-1 text-center font-bold">
                DESCRIPCIÓN DEL EQUIPO
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold w-56">NOTA</td>
              <td className="border p-1">{data.nota || ""}</td>
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
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="border p-1 font-semibold w-56">
                  {label}
                </td>
                <td className="border p-1">{value || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="w-full border border-collapse mt-4">
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
                {firmaTecnico && (
                  <img src={firmaTecnico} className="mx-auto max-h-24" />
                )}
              </td>
              <td className="border p-2 text-center">
                {firmaCliente && (
                  <img src={firmaCliente} className="mx-auto max-h-24" />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES (ABAJO) ================= */}
        <div className="flex justify-between mt-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded text-sm"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Descargar PDF
          </button>
        </div>

      </div>
    </div>
  );
}
