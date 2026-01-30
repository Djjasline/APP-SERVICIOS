import { useParams } from "react-router-dom";
import { getInspectionById } from "@utils/inspectionStorage";

export default function InspeccionBarredoraPDF() {
  const { id } = useParams();
  const saved = getInspectionById("barredora", id);

  if (!saved?.data) {
    return <p>No hay datos para mostrar</p>;
  }

  const data = saved.data;

  return (
    <div className="p-6 text-xs">
      {/* ================= ENCABEZADO ================= */}
      <table className="w-full border-collapse border mb-4">
        <tbody>
          <tr>
            <td rowSpan={3} className="border p-2 w-32 text-center">
              <img src="/astap-logo.jpg" className="mx-auto h-16" />
            </td>
            <td className="border p-2 font-bold text-center">
              HOJA DE INSPECCIÓN BARREDORA
            </td>
            <td className="border p-2">
              Fecha versión: 01-01-26<br />
              Versión: 01
            </td>
          </tr>
          <tr>
            <td className="border p-2">REFERENCIA DE CONTRATO</td>
            <td className="border p-2">{data.referenciaContrato}</td>
          </tr>
          <tr>
            <td className="border p-2">DESCRIPCIÓN</td>
            <td className="border p-2">{data.descripcion}</td>
          </tr>
        </tbody>
      </table>

      {/* ================= DATOS DE SERVICIO ================= */}
      <table className="w-full border-collapse border mb-4">
        <tbody>
          {[
            ["Cliente", data.cliente],
            ["Dirección", data.direccion],
            ["Contacto", data.contacto],
            ["Teléfono", data.telefono],
            ["Correo", data.correo],
            ["Técnico responsable", data.tecnicoResponsable],
            ["Fecha de servicio", data.fechaServicio],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td className="border p-2 font-semibold w-48">{label}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <h3 className="font-bold mb-2">ESTADO DEL EQUIPO</h3>
      <div className="border p-2 mb-4">
        <img src="/estado equipo barredora.png" className="w-full mb-2" />
        {data.estadoEquipoPuntos?.map((pt) => (
          <div key={pt.id}>
            <strong>{pt.id})</strong> {pt.nota}
          </div>
        ))}
      </div>

      {/* ================= TABLAS DE INSPECCIÓN ================= */}
      <h3 className="font-bold mb-2">EVALUACIÓN DE SISTEMAS</h3>
      <table className="w-full border-collapse border mb-4">
        <thead>
          <tr>
            <th className="border p-1">Ítem</th>
            <th className="border p-1">Detalle</th>
            <th className="border p-1">Estado</th>
            <th className="border p-1">Observación</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.items || {}).map(([codigo, item]) => (
            <tr key={codigo}>
              <td className="border p-1">{codigo}</td>
              <td className="border p-1">{item.detalle || ""}</td>
              <td className="border p-1">{item.estado}</td>
              <td className="border p-1">{item.observacion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <h3 className="font-bold mb-2">DESCRIPCIÓN DEL EQUIPO</h3>
      <table className="w-full border-collapse border mb-4">
        <tbody>
          {[
            ["Marca", data.marca],
            ["Modelo", data.modelo],
            ["Serie", data.serie],
            ["Año modelo", data.anioModelo],
            ["VIN", data.vin],
            ["Placa", data.placa],
            ["Horas módulo", data.horasModulo],
            ["Horas chasis", data.horasChasis],
            ["Kilometraje", data.kilometraje],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td className="border p-2 font-semibold w-48">{label}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= FIRMAS ================= */}
      <table className="w-full border-collapse border">
        <tbody>
          <tr>
            <td className="border p-4 text-center">
              <strong>Firma Técnico</strong><br />
              {data.firmas?.tecnico && (
                <img src={data.firmas.tecnico} className="h-24 mx-auto" />
              )}
            </td>
            <td className="border p-4 text-center">
              <strong>Firma Cliente</strong><br />
              {data.firmas?.cliente && (
                <img src={data.firmas.cliente} className="h-24 mx-auto" />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
