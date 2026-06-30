import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
         className="border px-4 py-2 rounded mt-4"
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
          className="border px-4 py-2 rounded mt-4"
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
    ? "Informe para levantamiento, instalación o inspección de bombas"
    : "Informe para levantamiento, instalación o inspección de válvulas";
  
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
    <table className="pdf-table w-full">
      <tbody>
        {[
          ["FLUIDO", data.valvula?.fluido],
          ["MARCA", data.valvula?.marca],
          ["MODELO / TIPO", data.valvula?.modeloTipo],
          ["N° SERIE", data.valvula?.serie],
          ["LUGAR DE PROCEDENCIA", data.valvula?.lugarProcedencia],
          ["DIÁMETRO", data.valvula?.diametro],
          ["PRESIÓN", data.valvula?.presion],
          ["CONEXIÓN", data.valvula?.conexion],
          ["NORMA DE BRIDADO", data.valvula?.normaBridado],
          ["OPERACIÓN", data.valvula?.operacion],
          ["OPERACIÓN ACTUADOR", data.valvula?.operacionActuador],
          ["TIPO DE ACTUADOR", data.valvula?.tipoActuador],
          ["VOLTAJE / FASE / FRECUENCIA", data.valvula?.voltajeFaseFrecuencia],
          ["PROTOCOLO COMUNICACIÓN", data.valvula?.protocoloComunicacion],
          ["DIST. ENTRE CARAS (F2F)", data.valvula?.distanciaEntreCaras],
          ["LONGITUD CUERPO VÁLVULA", data.valvula?.longitudCuerpo],
          ["ESPESOR CONTRA BRIDAS", data.valvula?.espesorContraBridas],
          ["N° PERFORACIONES EN BRIDA", data.valvula?.numPerforaciones],
          ["DIÁMETRO AGUJERO EN BRIDA", data.valvula?.diametroAgujero],
          ["MATERIAL TORNILLERÍA", data.valvula?.materialTornilleria],
        ].map(([label, value], i) => (
          <tr key={i}>
            <td className="pdf-label">{label}</td>
            <td>{value || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <table className="pdf-table w-full">
      <tbody>
        {[
          ["FLUIDO", data.bomba?.fluido],
          ["MARCA", data.bomba?.marca],
          ["MODELO / TIPO", data.bomba?.modeloTipo],
          ["N° SERIE", data.bomba?.serie],
          ["LUGAR DE PROCEDENCIA", data.bomba?.lugarProcedencia],
          ["Q (CAUDAL)", data.bomba?.caudal],
          ["TDH (CABEZA)", data.bomba?.tdh],
          ["VELOCIDAD DE GIRO", data.bomba?.velocidadGiro],
          ["ORIENTACIÓN", data.bomba?.orientacion],
          ["MARCA MOTOR", data.bomba?.marcaMotor],
          ["MODELO / TIPO MOTOR", data.bomba?.modeloTipoMotor],
          ["VOLTAJE / FASE / FRECUENCIA", data.bomba?.voltajeFaseFrecuencia],
          ["S.F FACTOR DE SERVICIO", data.bomba?.factorServicio],
          ["GRADO DE PROTECCIÓN", data.bomba?.gradoProteccion],
          ["TIPO DE CONSTRUCCIÓN", data.bomba?.tipoConstruccionMotor],
          ["ACCESORIO", data.bomba?.accesorio],
          ["DIMENSIONES ACCESORIO (L/A/H)", data.bomba?.dimensionesAccesorio],
          ["OBRA CIVIL", data.bomba?.obraCivil],
          ["DIMENSIONES OBRA CIVIL (L/A/H)", data.bomba?.dimensionesObraCivil],
        ].map(([label, value], i) => (
          <tr key={i}>
            <td className="pdf-label">{label}</td>
            <td>{value || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

{/* ================= REGISTRO FOTOGRÁFICO DEL EQUIPO ================= */}
<div className="no-break">
  <h3 className="pdf-title mt-4">REGISTRO FOTOGRÁFICO DEL EQUIPO</h3>

  {data.tipoInforme === "valvula" ? (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 10,
      }}
    >
      {[
        ["Foto placa válvula", data.valvula?.fotoPlacaValvula],
        ["Foto placa actuador 1", data.valvula?.fotoPlacaActuador1],
        ["Foto placa actuador 2", data.valvula?.fotoPlacaActuador2],
        ...(data.valvula?.registroFotoDimensional || []).map((url, i) => [
          `Registro dimensional ${i + 1}`,
          url,
        ]),
      ]
        .filter(([, url]) => url)
        .map(([label, url], i) => (
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
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 10,
      }}
    >
      {[
        ["Foto placa bomba", data.bomba?.fotoPlacaBomba],
        ["Foto placa motor", data.bomba?.fotoPlacaMotor],
        ["Foto placa base metálica", data.bomba?.fotoPlacaBaseMetalica],
        ["Foto base de concreto", data.bomba?.fotoBaseConcrete],
      ]
        .filter(([, url]) => url)
        .map(([label, url], i) => (
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
  )}
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
                <div key={img.id || imageIndex} className="no-break border rounded overflow-hidden">
                  <div className="px-3 py-2 border-b text-sm font-semibold bg-gray-50">
                    Imagen {imageIndex + 1}
                  </div>

                  <div className="p-3">
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`estado-equipo-${imageIndex + 1}`}
                        style={{
                          width: "100%",
                          maxHeight: 420,
                          objectFit: "contain",
                          display: "block",
                          background: "#fff",
                        }}
                      />

                      {(img.puntos || []).map((p, pointIndex) => (
                        <div
                          key={p.id || pointIndex}
                          style={{
                            position: "absolute",
                            left: `${p.x * 100}%`,
                            top: `${p.y * 100}%`,
                            transform: "translate(-50%, -50%)",
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#dc2626",
                            border: "2px solid white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                          }}
                        />
                      ))}
                    </div>

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
          <table className="pdf-table w-full mt-4">
            <thead>
              <tr>
                <th colSpan={2}>CONCLUSION TECNICA</th>
                <th colSpan={2}>RECOMENDACION ACCIONABLE</th>
              </tr>
            </thead>
            <tbody>
              {data.conclusiones?.map((c, i) => (
                <tr key={i}>
                  <td style={{ width: 30, textAlign: "center" }}>{i + 1}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{c || "—"}</td>
                  <td style={{ width: 30, textAlign: "center" }}>{i + 1}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>
                    {data.recomendaciones?.[i] || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            className="border px-6 py-2 rounded"
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
