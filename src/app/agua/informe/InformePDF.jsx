import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PdfConclusionRecommendationTable, PdfEquipmentImageFrame } from "@/components/pdf/PdfReportLayout";

const S = {
  tbl: { width: "100%", borderCollapse: "collapse", fontSize: 10 },
  cell: { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10 },
  th: { border: "1px solid #374151", padding: "4px 6px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10 },
};

export default function InformePDF({
  area = "agua",
  basePath = "/agua/informe",
  allowDownload = true,
}) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [report, setReport] = useState(null);

  /* ===========================
     CARGAR INFORME (SOLO SUPABASE)
  =========================== */
  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data, error } = await supabase
          .from("registros")
          .select("*")
          .eq("id", id)
          .eq("area", area)
          .eq("tipo", "informe")
          .single();

        if (error || !data) {
          console.error("Error cargando informe:", error);
          return;
        }

        const mapped = {
          id: data.id,
          estado: data.estado,
          data: data.data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setReport(mapped);
      } catch (err) {
        console.error("Error cargando informe:", err);
      }
    };

    loadReport();
  }, [id, area]);

  /* ===========================
     NO ENCONTRADO
  =========================== */
  if (!report) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró el informe.</p>
        <button
         onClick={() => navigate(basePath)}
         className="btn-volver-orange mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  /* ===========================
     VALIDACIÓN ESTADO
  =========================== */
  const estadoNormalizado = report?.estado || report?.data?.estado || "";

  if (estadoNormalizado.toLowerCase() !== "completado") {
    return (
      <div className="p-6 text-center">
        <p>Este informe no está completado.</p>
        <button
          onClick={() => navigate(basePath)}
          className="btn-volver-orange mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const { data } = report;
  const isBomba = data?.tipoInforme !== "valvula";
  const informeTitulo = isBomba ? "INFORME DE BOMBAS" : "INFORME DE VÁLVULAS";
  const informeDescripcion = isBomba
    ? "Informe para levantamiento de estado actual, instalación o inspección de bombas"
    : "Informe para levantamiento de estado actual, instalación o inspección de válvulas";
  const bombaItems = Array.isArray(data?.bombas) && data.bombas.length > 0
    ? data.bombas
    : [data?.bomba || {}];
  const valvulaItems = Array.isArray(data?.valvulas) && data.valvulas.length > 0
    ? data.valvulas
    : [data?.valvula || {}];
  const equipoNombre = (base, item, index) => item?.identificacion || `${base} ${index + 1}`;
  
const estadoEquipoImagenes = Array.isArray(data?.estadoEquipo?.imagenes)
  ? data.estadoEquipo.imagenes.map((img) =>
      typeof img === "string"
        ? { url: img, puntos: [] }
        : {
            id: img.id || "",
            url: img.url || img.imagen || "",
            puntos: Array.isArray(img.puntos) ? img.puntos : [],
          }
    ).filter((img) => img.url)
  : [];
  
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          ${!allowDownload ? `.print-area { display: none !important; } .readonly-print-warning { display: block !important; }` : ""}
        }
      `}</style>

      {!allowDownload && (
        <div className="readonly-print-warning hidden p-8 text-center text-black">
          Vista solo lectura. Este usuario no tiene permiso de descarga o impresión.
        </div>
      )}

     <div className="pdf-container print-area max-w-6xl mx-auto bg-white p-4 md:p-6 text-black">

        {/* ================= ENCABEZADO ================= */}
        <div className="no-break">
          <table className="pdf-table w-full">
            <tbody>
              <tr>
                <td
                  rowSpan={4}
                  style={{ width: 140, textAlign: "center", verticalAlign: "middle" }}
                >
                  <img
                    src="/astap-logo.jpg"
                    alt="ASTAP"
                    style={{ maxHeight: 70, margin: "0 auto" }}
                  />
                </td>

                <td colSpan={2} className="pdf-title">
                  <div>{informeTitulo}</div>
                  <div style={{ marginTop: 4, fontSize: 10, fontWeight: 400, lineHeight: 1.3, textTransform: "none" }}>
                    {informeDescripcion}
                  </div>
                </td>

                <td style={{ width: 180, fontSize: 12 }}>
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>

              <tr>
                <td className="pdf-label">REFERENCIA CONTRATO</td>
                <td colSpan={2}>{data.referenciaContrato || "—"}</td>
              </tr>

              <tr>
                <td className="pdf-label">DESCRIPCIÓN</td>
                <td colSpan={2}>{data.descripcion || "—"}</td>
              </tr>

              <tr>
                <td className="pdf-label">CÓDIGO DEL INFORME</td>
                <td colSpan={2}>{data.codInf || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= DATOS CLIENTE ================= */}
        <div className="no-break">
          <table className="pdf-table w-full mt-4">
            <tbody>
              {[
                ["CLIENTE", data.cliente],
                ["DIRECCIÓN", data.direccion],
                ["CONTACTO", data.contacto],
                ["TELÉFONO", data.telefono],
                ["CORREO", data.correo],
                ["TÉCNICO RESPONSABLE", data.tecnicoNombre],
                ["TELÉFONO TÉCNICO", data.tecnicoTelefono],
                ["CORREO TÉCNICO", data.tecnicoCorreo],
                ["FECHA DE SERVICIO", data.fechaServicio],
              ].map(([label, value], i) => (
                <tr key={i}>
                  <td className="pdf-label">{label}</td>
                  <td>{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <div className="no-break">
          <h3 className="pdf-title mt-4">
            DESCRIPCIÓN DEL EQUIPO - {data.tipoInforme === "valvula" ? "VÁLVULA" : "BOMBA"}
          </h3>

          {data.tipoInforme === "valvula" ? (
            valvulaItems.map((valvula, valvulaIndex) => (
              <div key={valvulaIndex} className="no-break">
                <h4 className="mt-3 mb-1 text-sm font-bold">
                  {equipoNombre("VÁLVULA", valvula, valvulaIndex)}
                </h4>
                <table className="pdf-table w-full">
                  <tbody>
                    {[
                      ["FLUIDO", valvula?.fluido],
                      ["MARCA", valvula?.marca],
                      ["MODELO / TIPO", valvula?.modeloTipo],
                      ["N° SERIE", valvula?.serie],
                      ["LUGAR DE PROCEDENCIA", valvula?.lugarProcedencia],
                      ["DIÁMETRO", valvula?.diametro],
                      ["PRESIÓN", valvula?.presion],
                      ["CONEXIÓN", valvula?.conexion],
                      ["NORMA DE BRIDADO", valvula?.normaBridado],
                      ["OPERACIÓN", valvula?.operacion],
                      ["OPERACIÓN ACTUADOR", valvula?.operacionActuador],
                      ["TIPO DE ACTUADOR", valvula?.tipoActuador],
                      ["VOLTAJE / FASE / FRECUENCIA", valvula?.voltajeFaseFrecuencia],
                      ["PROTOCOLO COMUNICACIÓN", valvula?.protocoloComunicacion],
                      ["DIST. ENTRE CARAS (F2F)", valvula?.distanciaEntreCaras],
                      ["LONGITUD CUERPO VÁLVULA", valvula?.longitudCuerpo],
                      ["ESPESOR CONTRA BRIDAS", valvula?.espesorContraBridas],
                      ["N° PERFORACIONES EN BRIDA", valvula?.numPerforaciones],
                      ["DIÁMETRO AGUJERO EN BRIDA", valvula?.diametroAgujero],
                      ["MATERIAL TORNILLERÍA", valvula?.materialTornilleria],
                    ].map(([label, value], i) => (
                      <tr key={i}>
                        <td className="pdf-label">{label}</td>
                        <td>{value || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            bombaItems.map((bomba, bombaIndex) => (
              <div key={bombaIndex} className="no-break">
                <h4 className="mt-3 mb-1 text-sm font-bold">
                  {equipoNombre("BOMBA", bomba, bombaIndex)}
                </h4>
                <table className="pdf-table w-full">
                  <tbody>
                    {[
                      ["FLUIDO", bomba?.fluido],
                      ["MARCA", bomba?.marca],
                      ["MODELO / TIPO", bomba?.modeloTipo],
                      ["N° SERIE", bomba?.serie],
                      ["LUGAR DE PROCEDENCIA", bomba?.lugarProcedencia],
                      ["Q (CAUDAL)", bomba?.caudal],
                      ["TDH (CABEZA)", bomba?.tdh],
                      ["VELOCIDAD DE GIRO", bomba?.velocidadGiro],
                      ["ORIENTACIÓN", bomba?.orientacion],
                      ["MARCA MOTOR", bomba?.marcaMotor],
                      ["MODELO / TIPO MOTOR", bomba?.modeloTipoMotor],
                      ["VOLTAJE / FASE / FRECUENCIA", bomba?.voltajeFaseFrecuencia],
                      ["S.F FACTOR DE SERVICIO", bomba?.factorServicio],
                      ["GRADO DE PROTECCIÓN", bomba?.gradoProteccion],
                      ["TIPO DE CONSTRUCCIÓN", bomba?.tipoConstruccionMotor],
                      ["ACCESORIO", bomba?.accesorio],
                      ["DIMENSIONES ACCESORIO (L/A/H)", bomba?.dimensionesAccesorio],
                      ["OBRA CIVIL", bomba?.obraCivil],
                      ["DIMENSIONES OBRA CIVIL (L/A/H)", bomba?.dimensionesObraCivil],
                    ].map(([label, value], i) => (
                      <tr key={i}>
                        <td className="pdf-label">{label}</td>
                        <td>{value || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        {/* ================= REGISTRO FOTOGRÁFICO DEL EQUIPO ================= */}
        <div className="no-break">
          <h3 className="pdf-title mt-4">REGISTRO FOTOGRÁFICO DEL EQUIPO</h3>

          {(data.tipoInforme === "valvula" ? valvulaItems : bombaItems).map((equipo, equipoIndex) => {
            const fotos = data.tipoInforme === "valvula"
              ? [
                  ["Foto placa válvula", equipo?.fotoPlacaValvula],
                  ["Foto placa actuador 1", equipo?.fotoPlacaActuador1],
                  ["Foto placa actuador 2", equipo?.fotoPlacaActuador2],
                  ...(equipo?.registroFotoDimensional || []).map((url, i) => [
                    `Registro dimensional ${i + 1}`,
                    url,
                  ]),
                ]
              : [
                  ["Foto placa bomba", equipo?.fotoPlacaBomba],
                  ["Foto placa motor", equipo?.fotoPlacaMotor],
                  ["Foto placa base metálica", equipo?.fotoPlacaBaseMetalica],
                  ["Foto base de concreto", equipo?.fotoBaseConcrete],
                ];

            const fotosValidas = fotos.filter(([, url]) => url);
            if (fotosValidas.length === 0) return null;

            return (
              <div key={equipoIndex} className="no-break">
                <h4 className="mt-3 mb-1 text-sm font-bold">
                  {equipoNombre(data.tipoInforme === "valvula" ? "VÁLVULA" : "BOMBA", equipo, equipoIndex)}
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {fotosValidas.map(([label, url], i) => (
                    <div key={i} className="border rounded p-2">
                      <div className="text-xs font-semibold mb-1">{label}</div>
                      <img
                        src={url}
                        alt={label}
                        style={{
                          width: "100%",
                          maxHeight: 260,
                          objectFit: "contain",
                          border: "1px solid #ccc",
                          borderRadius: 6,
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
       
        {/* ================= ESTADO DEL EQUIPO ================= */}
        <div className="no-break">
          <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

          {estadoEquipoImagenes.length === 0 ? (
            <table className="pdf-table w-full">
              <tbody>
                <tr>
                  <td style={{ textAlign: "center", color: "#888", padding: 20 }}>
                    Sin registros de estado del equipo
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="space-y-4">
              {estadoEquipoImagenes.map((img, imageIndex) => (
                <div key={img.id || imageIndex} className="no-break border rounded overflow-hidden" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <div className="px-3 py-2 border-b text-sm font-semibold bg-gray-50">
                    Imagen {imageIndex + 1}
                  </div>

                  <div className="p-3">
                    <PdfEquipmentImageFrame src={img.url} alt={`estado-equipo-${imageIndex + 1}`} points={img.puntos} />

                    <div className="mt-3">
                      {(img.puntos || []).length === 0 ? (
                        <div className="text-sm text-gray-500">
                          Sin puntos marcados
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {img.puntos.map((p, pointIndex) => (
                            <div
                              key={p.id || pointIndex}
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-start",
                              }}
                            >
                              <div style={{ minWidth: 24, fontWeight: 600 }}>
                                {pointIndex + 1})
                              </div>
                              <div style={{ whiteSpace: "pre-wrap" }}>
                                {p.observacion || "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= ACTIVIDADES ================= */}
        <div className="page-break"></div>

        <h3 className="pdf-title mt-4">ACTIVIDADES REALIZADAS Y HALLAZGOS</h3>
        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th style={{ width: 50 }}>ÍTEM</th>
              <th style={{ width: "35%" }}>ACTIVIDAD / HALLAZGO</th>
              <th style={{ width: "55%" }}>IMÁGENES</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades?.map((a, i) => (
              <tr key={i} className="no-break">
                <td className="text-center" style={{ verticalAlign: "top" }}>
                  {i + 1}
                </td>

                <td style={{ verticalAlign: "top" }}>
                  <strong>{a.titulo || "—"}</strong>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                    {a.detalle || "—"}
                  </div>
                </td>

                <td style={{ verticalAlign: "top" }}>
                  {a.imagenes?.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 10,
                      }}
                    >
                      {a.imagenes.map((img, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`actividad-${imgIndex}`}
                          style={{
                            width: "100%",
                            aspectRatio: "4 / 3",
                            objectFit: "cover",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            display: "block",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#888", textAlign: "center" }}>—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= CONCLUSION Y RECOMENDACION ================= */}
        <div className="no-break">
          <PdfConclusionRecommendationTable conclusiones={data.conclusiones} recomendaciones={data.recomendaciones} styles={S} />
        </div>

        {/* ================= FIRMAS ================= */}
        <div className="no-break">
          <table className="pdf-table w-full mt-4">
            <thead>
              <tr>
                <th>FIRMA TÉCNICO ASTAP</th>
                <th>FIRMA CLIENTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ height: 180, textAlign: "center", verticalAlign: "top" }}>
                  {data.firmas?.tecnico && (
                    <img
                      src={data.firmas.tecnico}
                      alt="firma tecnico"
                      style={{ maxHeight: 120, margin: "0 auto" }}
                    />
                  )}

                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>
                    {data.tecnicoNombre || "—"}
                  </div>
                </td>

                <td style={{ height: 180, textAlign: "center", verticalAlign: "top" }}>
                  {data.firmas?.cliente && (
                    <img
                      src={data.firmas.cliente}
                      alt="firma cliente"
                      style={{ maxHeight: 120, margin: "0 auto" }}
                    />
                  )}

                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>
                    {data.contacto || data.cliente || "—"}
                  </div>

                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    Cédula: {data.firmas?.clienteCedula || "—"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate(basePath)}
            className="btn-volver-orange px-6"
          >
            Volver
          </button>

          {allowDownload ? (
            <button
              onClick={() => {
                const nombre = `ASTAP_${(data.codInf || "").replace(/\s/g, "")}_${(data.cliente || "").replace(/\s/g, "_")}`;
                document.title = nombre;
                window.print();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded"
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
