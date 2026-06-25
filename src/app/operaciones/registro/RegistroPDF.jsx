import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

export default function RegistroPDF({ allowDownload = true, backPath = "/operaciones/registro" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLight } = useTheme();
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
      <div className={`p-6 text-center ${isLight ? "text-slate-700" : "text-white"}`}>
        <p>No se encontro el registro.</p>
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
  const firmas = data.firmas || {};

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

  const fechaSalida = data.fechaSalida || primerItem.fechaSalida || "";

  const tecnicoIngreso =
    data.tecnicoIngreso ||
    primerItem.tecnicoIngreso ||
    primerItem.responsableIngreso ||
    "";

  const fechaIngreso = data.fechaIngreso || primerItem.fechaIngreso || "";

  const statusLabel = registro.estado === "completado" ? "Registro cerrado" : "En campo";

  const SectionTitle = ({ children }) => (
    <h3 className="mt-5 border border-[#1e3a5f] bg-[#1e3a5f] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
      {children}
    </h3>
  );

  const InfoTable = ({ rows }) => (
    <table className="w-full border-collapse text-xs text-black">
      <tbody>
        {rows.map(([label, value], index) => (
          <tr key={`${label}-${index}`}>
            <td className="w-44 border border-slate-700 bg-slate-100 px-2 py-1.5 font-semibold">
              {label}
            </td>
            <td className="border border-slate-700 bg-white px-2 py-1.5 whitespace-pre-wrap">
              {value || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const ImageBox = ({ title, src }) => (
    <div className="mt-3">
      <div className="mb-1 text-xs font-semibold text-black">{title}</div>
      {src ? (
        <img
          src={src}
          alt={title}
          className="max-h-64 w-full border border-slate-300 object-contain"
        />
      ) : (
        <div className="flex h-36 items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
          Sin imagen
        </div>
      )}
    </div>
  );

  const getSalidaImage = (item) => item.imagenSalidaUrl || item.imagenSalida || item.fotoSalida || "";
  const getIngresoImage = (item) => item.imagenIngresoUrl || item.imagenIngreso || item.fotoIngreso || "";

  return (
    <div className={`min-h-screen p-4 ${isLight ? "bg-gray-100" : "bg-slate-950"}`}>
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

          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          ${!allowDownload ? `.pdf-page { display: none !important; } .readonly-print-warning { display: block !important; }` : ""}
        }
      `}</style>

      {!allowDownload && (
        <div className="readonly-print-warning hidden p-8 text-center text-black">
          Vista solo lectura. Este usuario no tiene permiso de descarga o impresión.
        </div>
      )}

      <div className="pdf-page mx-auto max-w-[900px] border bg-white p-6 text-sm text-black shadow">
        <table className="mb-4 w-full border-collapse border border-slate-700">
          <tbody>
            <tr>
              <td className="w-32 border border-slate-700 p-3 text-center">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  className="mx-auto max-h-16 object-contain"
                />
              </td>
              <td className="border border-slate-700 p-3 text-center">
                <div className="text-lg font-bold uppercase">
                  Registro de salida e ingreso de herramientas
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Control operativo de entrega, retorno y estado de herramientas/equipos
                </div>
              </td>
              <td className="w-48 border border-slate-700 p-2 text-xs">
                <div>Area: Operaciones</div>
                <div>Tipo: Registro</div>
                <div>Estado: {statusLabel}</div>
                <div>Fecha: {new Date(registro.updated_at || registro.created_at).toLocaleString()}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <SectionTitle>Datos generales</SectionTitle>
        <InfoTable
          rows={[
            ["Pedido / Demanda", pedido],
            ["Tecnico salida", tecnicoSalida],
            ["Fecha salida", fechaSalida],
            ["Tecnico ingreso", tecnicoIngreso],
            ["Fecha ingreso", fechaIngreso],
          ]}
        />

        <SectionTitle>Herramientas / equipos</SectionTitle>

        {items.length === 0 ? (
          <div className="border border-slate-700 p-4 text-center text-xs text-slate-500">
            Sin herramientas o equipos registrados
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item, index) => {
              const ingresoCompleto = !!getIngresoImage(item);

              return (
                <section key={item.id || index} className="avoid-break border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-700 bg-slate-100 px-3 py-2">
                    <h4 className="text-sm font-bold uppercase">
                      Herramienta {index + 1}
                    </h4>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ingresoCompleto ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {ingresoCompleto ? "Ingreso completo" : "Pendiente de ingreso"}
                    </span>
                  </div>

                  <div className="p-3">
                    <InfoTable
                      rows={[
                        ["Detalle", item.detalle],
                        ["Cantidad", item.cantidad],
                        ["Nro. pedido", item.pedido],
                      ]}
                    />

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="border border-slate-300 p-3">
                        <h5 className="mb-2 bg-slate-100 px-2 py-1 text-xs font-bold uppercase">
                          Salida
                        </h5>
                        <InfoTable
                          rows={[
                            ["Estado salida", item.estadoSalida],
                            ["Tecnico salida", item.tecnicoSalida],
                            ["Fecha salida", item.fechaSalida],
                            ["Observaciones", item.observacionesSalida || item.observacionSalida],
                          ]}
                        />
                        <ImageBox title="Foto antes" src={getSalidaImage(item)} />
                      </div>

                      <div className="border border-slate-300 p-3">
                        <h5 className="mb-2 bg-slate-100 px-2 py-1 text-xs font-bold uppercase">
                          Ingreso
                        </h5>
                        <InfoTable
                          rows={[
                            ["Estado ingreso", item.estadoIngreso],
                            ["Tecnico ingreso", item.tecnicoIngreso],
                            ["Fecha ingreso", item.fechaIngreso],
                            ["Observaciones", item.observacionesIngreso || item.observacionIngreso],
                          ]}
                        />
                        <ImageBox title="Foto despues" src={getIngresoImage(item)} />
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <SectionTitle>Firmas</SectionTitle>
        <table className="w-full border-collapse border border-slate-700 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-700 p-2">Responsable</th>
              <th className="border border-slate-700 p-2">Aprobador / Recepcion</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="h-36 border border-slate-700 p-2 text-center align-middle">
                {firmas.responsable ? (
                  <img
                    src={firmas.responsable}
                    alt="Firma responsable"
                    className="mx-auto max-h-28 object-contain"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center">-</div>
                )}

                <div className="mt-2 border-t pt-2 text-xs font-semibold">
                  Firma Responsable
                </div>
              </td>

              <td className="h-36 border border-slate-700 p-2 text-center align-middle">
                {firmas.aprobador ? (
                  <img
                    src={firmas.aprobador}
                    alt="Firma aprobador"
                    className="mx-auto max-h-28 object-contain"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center">-</div>
                )}

                <div className="mt-2 border-t pt-2 text-xs font-semibold">
                  Firma Aprobador / Recepcion
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="no-print mt-6 flex justify-between">
          <button
            onClick={() => navigate(backPath)}
            className={`rounded border px-4 py-2 ${isLight ? "text-slate-700 hover:bg-slate-100" : "bg-white text-slate-900 hover:bg-slate-100"}`}
          >
            Volver
          </button>

          {allowDownload ? (
            <button
              onClick={() => window.print()}
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Descargar PDF
            </button>
          ) : (
            <span className="rounded bg-blue-50 px-4 py-2 text-sm text-blue-700">
              Vista solo lectura
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
