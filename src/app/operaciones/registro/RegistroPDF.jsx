import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { signatureImageStyle } from "@/utils/signature";

export default function RegistroPDF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("area", "operaciones")
        .eq("tipo", "registro")
        .single();

      if (error || !data) {
        console.error("Error cargando registro:", error);
        return;
      }

      setRegistro(data);
    };

    load();
  }, [id]);

  if (!registro) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró el registro.</p>
        <button
          onClick={() => navigate("/operaciones/registro")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const data = registro.data || {};
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.herramientas)
    ? data.herramientas
    : [];

  const primerItem = items[0] || {};

const pedido =
  data.pedidoDemanda ||
  data.pedido ||
  primerItem.pedido ||
  primerItem.pedidoDemanda ||
  "";

const tecnicoSalida =
  data.tecnicoSalida ||
  data.tecnicoNombre ||
  primerItem.tecnicoSalida ||
  primerItem.responsableSalida ||
  "";

const fechaSalida =
  data.fechaSalida ||
  primerItem.fechaSalida ||
  "";

const tecnicoIngreso =
  data.tecnicoIngreso ||
  primerItem.tecnicoIngreso ||
  primerItem.responsableIngreso ||
  "";

const fechaIngreso =
  data.fechaIngreso ||
  primerItem.fechaIngreso ||
  "";

const observacionesSalida =
  data.observacionesSalida ||
  primerItem.observacionesSalida ||
  primerItem.observacionSalida ||
  "";

const observacionesIngreso =
  data.observacionesIngreso ||
  primerItem.observacionesIngreso ||
  primerItem.observacionIngreso ||
  "";
  
  const firmas = data.firmas || {};

  const imagenSalida =
  data.imagenSalidaUrl ||
  data.fotoSalida ||
  data.imagenSalida ||
  data.items?.find((i) => i.imagenSalidaUrl)?.imagenSalidaUrl ||
  data.items?.find((i) => i.imagenSalida)?.imagenSalida ||
  data.items?.find((i) => i.fotoSalida)?.fotoSalida ||
  "";

const imagenIngreso =
  data.imagenIngresoUrl ||
  data.fotoIngreso ||
  data.imagenIngreso ||
  data.items?.find((i) => i.imagenIngresoUrl)?.imagenIngresoUrl ||
  data.items?.find((i) => i.imagenIngreso)?.imagenIngreso ||
  data.items?.find((i) => i.fotoIngreso)?.fotoIngreso ||
  "";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .pdf-page {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="pdf-page max-w-[900px] mx-auto bg-white p-6 shadow border text-sm text-black">
        {/* ENCABEZADO */}
        <table className="w-full border-collapse border mb-4">
          <tbody>
            <tr>
              <td className="border p-3 w-32 text-center">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  className="mx-auto max-h-16 object-contain"
                />
              </td>
              <td className="border p-3 text-center font-bold text-lg">
                REGISTRO DE HERRAMIENTAS Y EQUIPOS
              </td>
              <td className="border p-2 w-44 text-xs">
                <div>Área: Operaciones</div>
                <div>Tipo: Registro</div>
                <div>Estado: {registro.estado || "—"}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* DATOS GENERALES */}
        <h3 className="font-bold text-sm bg-gray-100 border px-2 py-1">
          DATOS GENERALES
        </h3>

        <table className="w-full border-collapse border mb-4 text-xs">
          <tbody>
            {[
  ["Pedido / Demanda", pedido],
  ["Técnico salida", tecnicoSalida],
  ["Fecha salida", fechaSalida],
  ["Técnico ingreso", tecnicoIngreso],
  ["Fecha ingreso", fechaIngreso],
].map(([label, value], i) => (
              <tr key={i}>
                <td className="border p-2 font-semibold bg-gray-50 w-48">
                  {label}
                </td>
                <td className="border p-2 whitespace-pre-wrap">
                  {value || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ITEMS */}
        <h3 className="font-bold text-sm bg-gray-100 border px-2 py-1">
          HERRAMIENTAS / EQUIPOS
        </h3>

        <table className="w-full border-collapse border mb-4 text-xs">
         <thead>
  <tr className="bg-gray-100">
    <th className="border p-2">#</th>
    <th className="border p-2">Herramienta / Detalle</th>
    <th className="border p-2">Cantidad</th>
    <th className="border p-2">Estado Salida</th>
    <th className="border p-2">Estado Ingreso</th>
  </tr>
</thead>
         <tbody>
  {items.length === 0 ? (
    <tr>
      <td colSpan={5} className="border p-4 text-center text-gray-500">
        Sin herramientas o equipos registrados
      </td>
    </tr>
  ) : (
    items.map((item, index) => (
     <>
        <tr>
  <td className="border p-2 text-center">{index + 1}</td>

  <td className="border p-2">
    {item.detalle || "—"}
  </td>

  <td className="border p-2 text-center">
    {item.cantidad || "—"}
  </td>

  <td className="border p-2">
    {item.estadoSalida || "—"}
  </td>

  <td className="border p-2">
    {item.estadoIngreso || "—"}
  </td>
</tr>

<tr>
  <td colSpan={5} className="border p-2 bg-gray-50">
    <strong>Observaciones salida:</strong>
    <br />
    {item.observacionesSalida || "—"}

    <br />
    <br />

    <strong>Observaciones ingreso:</strong>
    <br />
    {item.observacionesIngreso || "—"}
  </td>
</tr>
     </>
    ))
  )}
</tbody>
        </table>

        {/* IMÁGENES */}
        <h3 className="font-bold text-sm bg-gray-100 border px-2 py-1">
          REGISTRO FOTOGRÁFICO
        </h3>

        <div className="grid grid-cols-2 gap-4 border p-3 mb-4">
          <div>
            <div className="font-semibold text-xs mb-2">Imagen salida</div>
            {imagenSalida ? (
  <img
    src={imagenSalida}
                alt="Imagen salida"
                className="w-full max-h-72 object-contain border"
              />
            ) : (
              <div className="border h-40 flex items-center justify-center text-gray-400 text-xs">
                Sin imagen de salida
              </div>
            )}
          </div>

          <div>
            <div className="font-semibold text-xs mb-2">Imagen ingreso</div>
            {imagenIngreso ? (
  <img
    src={imagenIngreso}
                alt="Imagen ingreso"
                className="w-full max-h-72 object-contain border"
              />
            ) : (
              <div className="border h-40 flex items-center justify-center text-gray-400 text-xs">
                Sin imagen de ingreso
              </div>
            )}
          </div>
        </div>

       {/* FIRMAS */}
<h3 className="font-bold text-sm bg-gray-100 border px-2 py-1">
  FIRMAS
</h3>

<table className="w-full border-collapse border text-xs">
  <thead>
    <tr className="bg-gray-100">
      <th className="border p-2">Responsable</th>
      <th className="border p-2">Aprobador / Recepción</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      {/* RESPONSABLE */}
      <td className="border p-2 h-36 text-center align-middle">
        {firmas.responsable ? (
          <img
            src={firmas.responsable}
            alt="Firma responsable"
            style={{ ...signatureImageStyle, margin: "0 auto" }}
          />
        ) : (
          <div className="h-28 flex items-center justify-center">
            —
          </div>
        )}

        <div className="mt-2 border-t pt-2 text-xs font-semibold">
          Firma Responsable
        </div>
      </td>

      {/* APROBADOR */}
      <td className="border p-2 h-36 text-center align-middle">
        {firmas.aprobador ? (
          <img
            src={firmas.aprobador}
            alt="Firma aprobador"
            style={{ ...signatureImageStyle, margin: "0 auto" }}
          />
        ) : (
          <div className="h-28 flex items-center justify-center">
            —
          </div>
        )}

        <div className="mt-2 border-t pt-2 text-xs font-semibold">
          Firma Aprobador / Recepción
        </div>
      </td>
    </tr>
  </tbody>
</table>

        {/* BOTONES */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/operaciones/registro")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
