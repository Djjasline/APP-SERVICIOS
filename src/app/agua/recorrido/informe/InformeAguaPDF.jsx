// ──────────────────────────────────────────────────────
//  InformeAguaPDF.jsx
//  Vista previa PDF — Informe de Avance EPMAPS
// ──────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { generarPDFInformeAgua } from "./generarPDFInformeAgua";
import { cloneInformeAguaSchema } from "./informeAguaSchema";

const mergeDeep = (base, value) => {
  if (Array.isArray(base)) return Array.isArray(value) ? value : [...base];
  if (!base || typeof base !== "object") return value ?? base;

  const source = value && typeof value === "object" ? value : {};
  const merged = { ...source };

  Object.keys(base).forEach((k) => {
    merged[k] = mergeDeep(base[k], source[k]);
  });

  return merged;
};

export default function InformeAguaPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("tipo", "informe")
        .eq("subtipo", "avance_epmaps")
        .single();

      if (error || !data) {
        console.error("Error cargando informe de agua recorrido:", error);
        setRegistro(null);
        setLoading(false);
        return;
      }

      const merged = mergeDeep(cloneInformeAguaSchema(), data.data || {});

      setRegistro({
        id: data.id,
        estado: data.estado,
        data: merged,
      });

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando vista previa...
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No se encontró el informe.</p>

        <button
          type="button"
          onClick={() => navigate("/agua/recorrido/informe")}
          className="btn-volver-orange mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const d = registro.data;
  const actividades = Array.isArray(d.actividades) ? d.actividades : [];

  const handleDownload = async () => {
    try {
      await generarPDFInformeAgua(d);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el PDF.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      <div className="max-w-[900px] mx-auto bg-white rounded-xl shadow p-5 md:p-6 space-y-5">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Vista previa PDF — Informe de Avance
            </h1>
            <p className="text-sm text-gray-500">
              Cloro Gas EPMAPS
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/agua/recorrido/informe")}
              className="btn-volver-orange"
            >
              ← Volver
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Descargar PDF
            </button>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-[#1a2942] text-white px-4 py-2 text-sm font-semibold uppercase">
            Encabezado del informe
          </div>

          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="border-r p-2 font-semibold bg-gray-50 w-48">
                  Período / Semana
                </td>
                <td className="p-2">{d.periodo || "—"}</td>
              </tr>

              <tr className="border-b">
                <td className="border-r p-2 font-semibold bg-gray-50">
                  Contrato
                </td>
                <td className="p-2">{d.contrato || "—"}</td>
              </tr>

              <tr className="border-b">
                <td className="border-r p-2 font-semibold bg-gray-50">
                  Pedido N°
                </td>
                <td className="p-2">{d.pedido || "—"}</td>
              </tr>

              <tr className="border-b">
                <td className="border-r p-2 font-semibold bg-gray-50">
                  Supervisor
                </td>
                <td className="p-2">{d.supervisor || "—"}</td>
              </tr>

              <tr>
                <td className="border-r p-2 font-semibold bg-gray-50">
                  Administrador
                </td>
                <td className="p-2">{d.administrador || "—"}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ACTIVIDADES */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-[#1a2942] text-white px-4 py-2 text-sm font-semibold uppercase">
            Actividades — Órdenes de Trabajo
          </div>

          {actividades.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">
              Sin actividades registradas.
            </div>
          ) : (
            <div className="divide-y">
              {actividades.map((act, idx) => (
                <div key={act.id || idx} className="p-4 space-y-3">
                  <div className="font-semibold text-blue-800 text-sm">
                    Actividad {idx + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p>
                      <strong>N° Orden:</strong> {act.ordenNumero || "—"}
                    </p>
                    <p>
                      <strong>Lugar:</strong> {act.lugar || "—"}
                    </p>
                    <p>
                      <strong>Unidad Operativa:</strong>{" "}
                      {act.unidadOperativa || "—"}
                    </p>
                    <p>
                      <strong>Fecha ejecución:</strong>{" "}
                      {act.fechaEjecucion || "—"}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {act.sistemaHabilitado ? "Habilitado" : "Inhabilitado"}
                    </p>
                    {!act.sistemaHabilitado && (
                      <p>
                        <strong>Motivo:</strong>{" "}
                        {act.observacionSistema || "—"}
                      </p>
                    )}
                  </div>

                  <div className="text-sm">
                    <strong>Actividades realizadas:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        ["comprobacionOperativa", "Comprobación operativa"],
                        ["mantenimientoHidraulico", "Mant. hidráulico / vacío"],
                        ["mantenimientoElectrico", "Mant. eléctrico"],
                        ["limpiezaGeneral", "Limpieza general"],
                        ["registroDocumentacion", "Registro y documentación"],
                      ]
                        .filter(([key]) => act[key])
                        .map(([key, label]) => (
                          <span
                            key={key}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold"
                          >
                            {label}
                          </span>
                        ))}
                    </div>
                  </div>

                  {act.observacionesAdicionales && (
                    <div className="text-sm whitespace-pre-wrap">
                      <strong>Observaciones:</strong>{" "}
                      {act.observacionesAdicionales}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <p>
                      <strong>Peso cilindros:</strong>{" "}
                      {act.pesoCilindros || "—"}
                    </p>
                    <p>
                      <strong>Cloro residual:</strong>{" "}
                      {act.cloroResidual || "—"}
                    </p>
                    <p>
                      <strong>Dosis Cl:</strong> {act.dosisCl || "—"}
                    </p>
                    {act.mantenimientoElectrico && (
                      <>
                        <p>
                          <strong>Voltaje:</strong> {act.voltaje || "—"}
                        </p>
                        <p>
                          <strong>Corriente:</strong> {act.corriente || "—"}
                        </p>
                      </>
                    )}
                  </div>

                  {Array.isArray(act.fotografias) &&
                    act.fotografias.length > 0 && (
                      <div>
                        <strong className="text-sm">Fotografías:</strong>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {act.fotografias.map((foto, i) => (
                            <div
                              key={i}
                              className="border rounded overflow-hidden bg-gray-50"
                            >
                              <img
                                src={foto.url}
                                alt={`Foto ${i + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              {foto.descripcion && (
                                <div className="p-2 text-xs text-gray-600">
                                  {foto.descripcion}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NOTA FINAL */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-[#1a2942] text-white px-4 py-2 text-sm font-semibold uppercase">
            Nota final tecnica
          </div>
          <div className="p-4 text-sm whitespace-pre-wrap">
            {d.notaFinal || "—"}
          </div>
        </section>

        {/* FIRMAS */}
        <section className="border rounded-lg overflow-hidden">
          <div className="bg-[#1a2942] text-white px-4 py-2 text-sm font-semibold uppercase">
            Firmas
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="border rounded p-3 text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Técnico de campo
              </div>
              {d.firmas?.tecnico ? (
                <img
                  src={d.firmas.tecnico}
                  alt="Firma técnico"
                  className="h-20 object-contain mx-auto"
                />
              ) : (
                <div className="h-20 flex items-center justify-center text-sm text-gray-400">
                  Sin firma
                </div>
              )}
            </div>

            <div className="border rounded p-3 text-center">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Supervisor de contrato
              </div>
              {d.firmas?.supervisor ? (
                <img
                  src={d.firmas.supervisor}
                  alt="Firma supervisor"
                  className="h-20 object-contain mx-auto"
                />
              ) : (
                <div className="h-20 flex items-center justify-center text-sm text-gray-400">
                  Sin firma
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
