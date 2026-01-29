import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInspectionById } from "@utils/inspectionStorage";

/* =============================
   PDF – INSPECCIÓN BARREDORA
============================= */
export default function InspeccionBarredoraPdf() {
  const { id } = useParams();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const saved = getInspectionById("barredora", id);
    if (saved?.data) {
      setInspection(saved.data);
    }
  }, [id]);

  if (!inspection) return null;

  const {
    referenciaContrato,
    descripcion,
    codInf,

    cliente,
    direccion,
    contacto,
    telefono,
    correo,
    tecnicoResponsable,
    telefonoTecnico,
    correoTecnico,
    fechaServicio,

    estadoEquipoPuntos = [],
    items = {},

    nota,
    marca,
    modelo,
    serie,
    anioModelo,
    vin,
    placa,
    horasModulo,
    horasChasis,
    kilometraje,

    firmas = {},
  } = inspection;

  return (
    <div className="p-6 text-xs font-sans">
      {/* ================= ENCABEZADO ================= */}
      <table className="w-full border mb-4">
        <tbody>
          <tr>
            <td rowSpan={3} className="border p-2 w-32 text-center">
              <img src="/astap-logo.jpg" className="h-16 mx-auto" />
            </td>
            <td colSpan={2} className="border text-center font-bold">
              HOJA DE INSPECCIÓN BARREDORA
            </td>
            <td className="border p-2">
              <div>Versión: 01</div>
              <div>Fecha: 01-01-26</div>
            </td>
          </tr>
          <tr>
            <td className="border p-1 font-semibold">REFERENCIA</td>
            <td colSpan={2} className="border p-1">{referenciaContrato}</td>
          </tr>
          <tr>
            <td className="border p-1 font-semibold">DESCRIPCIÓN</td>
            <td colSpan={2} className="border p-1">{descripcion}</td>
          </tr>
        </tbody>
      </table>

      {/* ================= DATOS SERVICIO ================= */}
      <table className="w-full border mb-4">
        <tbody>
          {[
            ["Cliente", cliente],
            ["Dirección", direccion],
            ["Contacto", contacto],
            ["Teléfono", telefono],
            ["Correo", correo],
            ["Técnico", tecnicoResponsable],
            ["Fecha servicio", fechaServicio],
          ].map(([l, v]) => (
            <tr key={l}>
              <td className="border p-1 font-semibold w-40">{l}</td>
              <td className="border p-1">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <h3 className="font-bold mb-1">ESTADO DEL EQUIPO</h3>
      <div className="relative border mb-3">
        <img src="/estado equipo barredora.png" className="w-full" />
        {estadoEquipoPuntos.map((pt) => (
          <div
            key={pt.id}
            className="absolute bg-red-600 text-white w-5 h-5 text-[10px] flex items-center justify-center rounded-full"
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

      {estadoEquipoPuntos.map((pt) => (
        <div key={pt.id} className="mb-1">
          <strong>{pt.id})</strong> {pt.nota}
        </div>
      ))}

      {/* ================= PRUEBAS PREVIAS ================= */}
      <h3 className="font-bold mt-4 mb-1">
        PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO
      </h3>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Ítem</th>
            <th className="border p-1">Estado</th>
            <th className="border p-1">Observación</th>
          </tr>
        </thead>
        <tbody>
          {["1.1", "1.2", "1.3"].map((codigo) => (
            <tr key={codigo}>
              <td className="border p-1">{codigo}</td>
              <td className="border p-1">{items[codigo]?.estado}</td>
              <td className="border p-1">{items[codigo]?.observacion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TABLAS A–E ================= */}
      <h3 className="font-bold mb-1">EVALUACIÓN DE SISTEMAS</h3>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Ítem</th>
            <th className="border p-1">Estado</th>
            <th className="border p-1">Observación</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(items).map(([codigo, item]) => (
            codigo.startsWith("A.") ||
            codigo.startsWith("B.") ||
            codigo.startsWith("C.") ||
            codigo.startsWith("D.") ||
            codigo.startsWith("E.") ? (
              <tr key={codigo}>
                <td className="border p-1">{codigo}</td>
                <td className="border p-1">{item.estado}</td>
                <td className="border p-1">{item.observacion}</td>
              </tr>
            ) : null
          ))}
        </tbody>
      </table>

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <h3 className="font-bold mb-1">DESCRIPCIÓN DEL EQUIPO</h3>

      <table className="w-full border mb-4">
        <tbody>
          {[
            ["Nota", nota],
            ["Marca", marca],
            ["Modelo", modelo],
            ["Serie", serie],
            ["Año modelo", anioModelo],
            ["VIN", vin],
            ["Placa", placa],
            ["Horas módulo", horasModulo],
            ["Horas chasis", horasChasis],
            ["Kilometraje", kilometraje],
          ].map(([l, v]) => (
            <tr key={l}>
              <td className="border p-1 font-semibold w-40">{l}</td>
              <td className="border p-1">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= FIRMAS ================= */}
      <table className="w-full border">
        <tbody>
          <tr>
            <td className="border p-2 text-center">
              <img src={firmas.tecnico} className="h-24 mx-auto" />
              <div>Firma Técnico</div>
            </td>
            <td className="border p-2 text-center">
              <img src={firmas.cliente} className="h-24 mx-auto" />
              <div>Firma Cliente</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
