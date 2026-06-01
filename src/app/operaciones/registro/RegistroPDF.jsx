import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

  const firmas = data.firmas || {};

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
              ["Pedido / Demanda", data.pedidoDemanda],
              ["Técnico salida", data.tecnicoSalida || data.tecnicoNombre],
              ["Fecha salida", data.fechaSalida],
              ["Técnico ingreso", data.tecnicoIngreso],
              ["Fecha ingreso", data.fechaIngreso],
              ["Observaciones salida", data.observacionesSalida],
              ["Observaciones ingreso", data.observacionesIngreso],
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
              <th className="border p-2 w-10">#</th>
              <th className="border p-2">Descripción</th>
              <th className="border p-2 w-20">Cantidad</th>
              <th className="border p-2 w-28">Estado salida</th>
              <th className="border p-2 w-28">Estado ingreso</th>
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
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">
                    {item.descripcion ||
                      item.nombre ||
                      item.herramienta ||
                      item.equipo ||
                      "—"}
                  </td>
                  <td className="border p-2 text-center">
                    {item.cantidad || "—"}
                  </td>
                  <td className="border p-2 text-center">
                    {item.estadoSalida || item.estado || "—"}
                  </td>
                  <td className="border p-2 text-center">
                    {item.estadoIngreso || "—"}
                  </td>
                </tr>
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
            {data.imagenSalidaUrl ? (
              <img
                src={data.imagenSalidaUrl}
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
            {data.imagenIngresoUrl ? (
              <img
                src={data.imagenIngresoUrl}
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
              <td className="border p-2 h-36 text-center align-middle">
                {firmas.responsable ? (
                  <img
                    src={firmas.responsable}
                    alt="Firma responsable"
                    className="max-h-28 mx-auto object-contain"
                  />
                ) : (
                  "—"
                )}
              </td>

              <td className="border p-2 h-36 text-center align-middle">
                {firmas.aprobador ? (
                  <img
                    src={firmas.aprobador}
                    alt="Firma aprobador"
                    className="max-h-28 mx-auto object-contain"
                  />
                ) : (
                  "—"
                )}
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
