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
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
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

  return (
    <div className="p-6 bg-white text-xs">
      <div className="max-w-6xl mx-auto">

        {/* BOTONES SOLO EN PANTALLA */}
        <div className="flex justify-between mb-4 print:hidden">
          <button onClick={() => navigate(-1)} className="border px-3 py-1 rounded">
            ← Volver
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-3 py-1 rounded">
            Imprimir
          </button>
        </div>

        {/* ================= ENCABEZADO (IGUAL AL FORMULARIO) ================= */}
        <table className="w-full border border-collapse">
          <tbody>
            <tr>
              <td rowSpan={4} className="border p-2 w-32 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-16" />
              </td>
              <td colSpan={3} className="border p-2 text-center font-bold">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">REFERENCIA DE CONTRATO</td>
              <td colSpan={2} className="border p-1">
                {data.referenciaContrato || ""}
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">DESCRIPCIÓN</td>
              <td colSpan={2} className="border p-1">
                {data.descripcion || ""}
              </td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">COD. INF.</td>
              <td colSpan={2} className="border p-1">
                {data.codInf || ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS DE SERVICIO ================= */}
        <table className="w-full border border-collapse mt-2">
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
                  <img src="/estado-equipo.png" className="w-full" />
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

        {/* ================= PRUEBAS Y EVALUACIÓN (SCHEMA-DRIVEN) ================= */}
        {SECCIONES.map(({ key, titulo, schema }) => (
          <table key={key} className="w-full border border-collapse mt-4">
            <thead>
              <tr>
                <th colSpan={4} className="border p-1 text-center font-bold">
                  {titulo}
                </th>
              </tr>
              <tr>
                <th className="border p-1 w-16">Ítem</th>
                <th className="border p-1">Detalle</th>
                <th className="border p-1 w-16">SI / NO</th>
                <th className="border p-1">Observación</th>
              </tr>
            </thead>
            <tbody>
              {schema.map((item, i) => {
                const respuesta = data.inspeccion?.[key]?.[i] || {};
                return (
                  <tr key={item.codigo}>
                    <td className="border p-1">{item.codigo}</td>
                    <td className="border p-1">{item.descripcion}</td>
                    <td className="border p-1 text-center">
                      {respuesta.estado || ""}
                    </td>
                    <td className="border p-1">
                      {respuesta.observacion || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <table className="w-full border border-collapse mt-4">
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
              ["AÑO MODELO", data.equipo?.anioModelo],
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
        {data.firmas?.tecnico && (
          <img
            src={
              typeof data.firmas.tecnico === "string"
                ? data.firmas.tecnico
                : data.firmas.tecnico.imagen
            }
            className="mx-auto max-h-24"
          />
        )}
      </td>
      <td className="border p-2 text-center">
        {data.firmas?.cliente && (
          <img
            src={
              typeof data.firmas.cliente === "string"
                ? data.firmas.cliente
                : data.firmas.cliente.imagen
            }
            className="mx-auto max-h-24"
          />
        )}
      </td>
    </tr>
  </tbody>
</table>
}
