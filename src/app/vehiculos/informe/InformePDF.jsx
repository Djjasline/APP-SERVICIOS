import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function InformePDF() {
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
          .eq("tipo", "informe")
          .eq("subtipo", "general")
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
  }, [id]);

  /* ===========================
     NO ENCONTRADO
  =========================== */
  if (!report) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró el informe.</p>
        <button
          onClick={() => navigate("/informe")}
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
          onClick={() => navigate("/informe")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const { data } = report;
  const estadoEquipoImagenes = data?.estadoEquipo?.imagenes || [];

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto bg-white p-4 md:p-6">

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
                INFORME GENERAL DE SERVICIOS
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
              <td className="pdf-label">COD. INF.</td>
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

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
       <div className="no-break">
  <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

  <table className="pdf-table w-full">
          <tbody>
            {[
              ["NOTA", data.equipo?.nota],
              ["MARCA", data.equipo?.marca],
              ["MODELO", data.equipo?.modelo],
              ["N° SERIE", data.equipo?.serie],
              ["AÑO MODELO", data.equipo?.anio],
              ["VIN / CHASIS", data.equipo?.vin],
              ["PLACA", data.equipo?.placa],
              ["HORAS MÓDULO", data.equipo?.horasModulo],
              ["HORAS CHASIS", data.equipo?.horasChasis],
              ["KILOMETRAJE", data.equipo?.kilometraje],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td className="pdf-label">{label}</td>
                <td>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
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

        {/* ================= ACTIVIDADES ================= */}
       <div className="page-break"></div>

<h3 className="pdf-title mt-4">ACTIVIDADES REALIZADAS</h3>
        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th style={{ width: 50 }}>ÍTEM</th>
              <th style={{ width: "35%" }}>DESCRIPCIÓN</th>
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

        {/* ================= CONCLUSIONES Y RECOMENDACIONES ================= */}
       <div className="no-break">
  <table className="pdf-table w-full mt-4">
          <thead>
            <tr>
              <th colSpan={2}>CONCLUSIONES</th>
              <th colSpan={2}>RECOMENDACIONES</th>
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
                  {data.cliente || "—"}
                </div>

                <div style={{ marginTop: 4, fontSize: 12 }}>
                  Cédula: {data.firmas?.clienteCedula || "—"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
