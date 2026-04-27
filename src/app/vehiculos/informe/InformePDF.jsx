import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ─────────────────────────────────────────────
   ESTILOS CSS PARA IMPRESIÓN A4
   Se inyectan una sola vez en el <head>.
───────────────────────────────────────────── */
const PRINT_STYLES = `
/* ── Variables de página A4 ── */
@page {
  size: A4 portrait;
  margin: 14mm 12mm 16mm 12mm;
}

/* ── Reset general para impresión ── */
@media print {
  html, body {
    width: 210mm;
    height: 297mm;
    font-size: 11px;
    background: #fff !important;
    color: #000 !important;
  }

  /* Ocultar todo excepto el área de impresión */
  body > *:not(.pdf-root) { display: none !important; }
  .no-print { display: none !important; }

  /* ── Contenedor principal ── */
  .print-area {
    width: 100%;
    margin: 0;
    padding: 0;
    background: #fff !important;
    box-shadow: none !important;
  }

  /* ── Control de saltos de página ── */
  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .page-break {
    break-before: page;
    page-break-before: always;
  }

  /* ── Tablas: no cortar filas entre páginas ── */
  table {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
  }

  /* Repetir encabezado de tabla en cada página */
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }

  tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  td, th {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ── Imágenes: no cortar ── */
  img {
    break-inside: avoid;
    page-break-inside: avoid;
    max-width: 100% !important;
  }

  /* ── Secciones con múltiples elementos ── */
  .actividad-row {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* ─────────────────────────────────────────
   ESTILOS COMPARTIDOS (pantalla + impresión)
───────────────────────────────────────────── */

/* Tabla base */
.pdf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.pdf-table th,
.pdf-table td {
  border: 1px solid #374151;
  padding: 5px 7px;
  vertical-align: middle;
}

.pdf-table thead th {
  background-color: #1e3a5f;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Etiquetas de campo */
.pdf-label {
  font-weight: 700;
  background-color: #f3f4f6;
  width: 35%;
  white-space: nowrap;
}

/* Título de sección */
.pdf-title {
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px;
  background-color: #1e3a5f;
  color: #fff;
  margin: 12px 0 0 0;
}

/* Número de página (solo impresión) */
@media print {
  .pdf-page-num::after {
    content: counter(page) " / " counter(pages);
  }
}
`;

function InjectPrintStyles() {
  useEffect(() => {
    const id = "informe-pdf-styles";
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = PRINT_STYLES;
    document.head.appendChild(tag);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);
  return null;
}

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function InformePDF() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);

  /* ── Cargar informe ── */
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

        setReport({
          id: data.id,
          estado: data.estado,
          data: data.data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } catch (err) {
        console.error("Error cargando informe:", err);
      }
    };

    loadReport();
  }, [id]);

  /* ── Estados de carga / error ── */
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

  /* ── Handler de impresión ── */
  const handlePrint = () => {
    const nombre = `ASTAP_${(data.codInf || "").replace(/\s/g, "")}_${(
      data.cliente || ""
    ).replace(/\s/g, "_")}`;
    document.title = nombre;
    window.print();
  };

  /* ────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────── */
  return (
    <>
      <InjectPrintStyles />

      {/* Wrapper visible en pantalla */}
      <div className="pdf-root p-4 md:p-6 bg-gray-100 min-h-screen">

        {/* ── Área de impresión A4 ── */}
        <div className="print-area pdf-container max-w-[210mm] mx-auto bg-white p-6 shadow-md">

          {/* ══════════════════════════════════════
              ENCABEZADO
          ══════════════════════════════════════ */}
          <div className="no-break">
            <table className="pdf-table">
              <tbody>
                {/* Fila 1: Logo + título + versión */}
                <tr>
                  <td
                    rowSpan={5}
                    style={{
                      width: 130,
                      textAlign: "center",
                      verticalAlign: "middle",
                      borderRight: "1px solid #374151",
                    }}
                  >
                    <img
                      src="/astap-logo.jpg"
                      alt="ASTAP"
                      style={{ maxHeight: 65, margin: "0 auto" }}
                    />
                  </td>

                  <td
                    colSpan={2}
                    style={{
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    INFORME GENERAL DE SERVICIOS
                  </td>

                  <td style={{ width: 170, fontSize: 11 }}>
                    <div>
                      Fecha versión: <strong>01-01-26</strong>
                    </div>
                    <div>
                      Versión: <strong>01</strong>
                    </div>
                  </td>
                </tr>

                {/* Fila 2: Referencia contrato */}
                <tr>
                  <td className="pdf-label" style={{ width: "25%" }}>
                    REFERENCIA CONTRATO
                  </td>
                  <td colSpan={2}>{data.referenciaContrato || "—"}</td>
                </tr>

                {/* Fila 3: Descripción */}
                <tr>
                  <td className="pdf-label">DESCRIPCIÓN</td>
                  <td colSpan={2}>{data.descripcion || "—"}</td>
                </tr>

                {/* ✅ Fila 4: Pedido / Demanda (NUEVA) */}
                <tr>
                  <td className="pdf-label">PEDIDO / DEMANDA</td>
                  <td colSpan={2}>{data.pedidoDemanda || "—"}</td>
                </tr>

                {/* Fila 5: Cod. Inf. */}
                <tr>
                  <td className="pdf-label">COD. INF.</td>
                  <td colSpan={2}>{data.codInf || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══════════════════════════════════════
              DATOS DEL CLIENTE / SERVICIO
          ══════════════════════════════════════ */}
          <div className="no-break">
            <h3 className="pdf-title">DATOS DEL SERVICIO</h3>
            <table className="pdf-table">
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

          {/* ══════════════════════════════════════
              DESCRIPCIÓN DEL EQUIPO
          ══════════════════════════════════════ */}
          <div className="no-break">
            <h3 className="pdf-title">DESCRIPCIÓN DEL EQUIPO</h3>
            <table className="pdf-table">
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
          </div>

          {/* ══════════════════════════════════════
              ESTADO DEL EQUIPO
          ══════════════════════════════════════ */}
          <div className="no-break">
            <h3 className="pdf-title">ESTADO DEL EQUIPO</h3>

            {estadoEquipoImagenes.length === 0 ? (
              <table className="pdf-table">
                <tbody>
                  <tr>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        padding: 20,
                      }}
                    >
                      Sin registros de estado del equipo
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>
                {estadoEquipoImagenes.map((img, imageIndex) => (
                  <div
                    key={img.id || imageIndex}
                    className="no-break"
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    {/* Sub-encabezado de imagen */}
                    <div
                      style={{
                        padding: "5px 10px",
                        borderBottom: "1px solid #d1d5db",
                        fontSize: 11,
                        fontWeight: 700,
                        background: "#f9fafb",
                      }}
                    >
                      Imagen {imageIndex + 1}
                    </div>

                    <div style={{ padding: 10 }}>
                      {/* Imagen con puntos superpuestos */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          border: "1px solid #d1d5db",
                          borderRadius: 4,
                          overflow: "hidden",
                          background: "#fff",
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`estado-equipo-${imageIndex + 1}`}
                          style={{
                            width: "100%",
                            maxHeight: 380,
                            objectFit: "contain",
                            display: "block",
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              color: "#fff",
                              fontWeight: 700,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                            }}
                          >
                            {pointIndex + 1}
                          </div>
                        ))}
                      </div>

                      {/* Observaciones de puntos */}
                      {(img.puntos || []).length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {img.puntos.map((p, pointIndex) => (
                            <div
                              key={p.id || pointIndex}
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-start",
                                marginBottom: 4,
                                fontSize: 11,
                              }}
                            >
                              <span style={{ minWidth: 22, fontWeight: 700 }}>
                                {pointIndex + 1})
                              </span>
                              <span style={{ whiteSpace: "pre-wrap" }}>
                                {p.observacion || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {(img.puntos || []).length === 0 && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color: "#6b7280",
                          }}
                        >
                          Sin puntos marcados
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              ACTIVIDADES REALIZADAS
              (salto de página antes de la sección)
          ══════════════════════════════════════ */}
          <div className="page-break" />

          <h3 className="pdf-title" style={{ marginTop: 0 }}>
            ACTIVIDADES REALIZADAS
          </h3>

          <table className="pdf-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>ÍTEM</th>
                <th style={{ width: "32%" }}>DESCRIPCIÓN</th>
                <th>IMÁGENES</th>
              </tr>
            </thead>
            <tbody>
              {(data.actividades || []).map((a, i) => (
                <tr key={i} className="actividad-row no-break">
                  <td
                    style={{ textAlign: "center", verticalAlign: "top" }}
                  >
                    {i + 1}
                  </td>

                  <td style={{ verticalAlign: "top" }}>
                    <strong>{a.titulo || "—"}</strong>
                    <div
                      style={{ whiteSpace: "pre-wrap", marginTop: 5, fontSize: 11 }}
                    >
                      {a.detalle || "—"}
                    </div>
                  </td>

                  <td style={{ verticalAlign: "top" }}>
                    {a.imagenes?.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 8,
                        }}
                      >
                        {a.imagenes.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`actividad-${i + 1}-img-${imgIndex + 1}`}
                            style={{
                              width: "100%",
                              aspectRatio: "4 / 3",
                              objectFit: "cover",
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              display: "block",
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "#9ca3af",
                          textAlign: "center",
                          fontSize: 11,
                        }}
                      >
                        —
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══════════════════════════════════════
              CONCLUSIONES Y RECOMENDACIONES
          ══════════════════════════════════════ */}
          <div className="no-break">
            <table className="pdf-table" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  <th colSpan={2}>CONCLUSIONES</th>
                  <th colSpan={2}>RECOMENDACIONES</th>
                </tr>
              </thead>
              <tbody>
                {(data.conclusiones || []).map((c, i) => (
                  <tr key={i} className="no-break">
                    <td style={{ width: 28, textAlign: "center", fontWeight: 700 }}>
                      {i + 1}
                    </td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{c || "—"}</td>
                    <td style={{ width: 28, textAlign: "center", fontWeight: 700 }}>
                      {i + 1}
                    </td>
                    <td style={{ whiteSpace: "pre-wrap" }}>
                      {data.recomendaciones?.[i] || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ══════════════════════════════════════
              FIRMAS
          ══════════════════════════════════════ */}
          <div className="no-break">
            <table className="pdf-table" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  <th>FIRMA TÉCNICO ASTAP</th>
                  <th>FIRMA CLIENTE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Técnico */}
                  <td
                    style={{
                      height: 160,
                      textAlign: "center",
                      verticalAlign: "top",
                      paddingTop: 12,
                    }}
                  >
                    {data.firmas?.tecnico && (
                      <img
                        src={data.firmas.tecnico}
                        alt="Firma técnico"
                        style={{ maxHeight: 100, margin: "0 auto", display: "block" }}
                      />
                    )}
                    <div
                      style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}
                    >
                      {data.tecnicoNombre || "—"}
                    </div>
                  </td>

                  {/* Cliente */}
                  <td
                    style={{
                      height: 160,
                      textAlign: "center",
                      verticalAlign: "top",
                      paddingTop: 12,
                    }}
                  >
                    {data.firmas?.cliente && (
                      <img
                        src={data.firmas.cliente}
                        alt="Firma cliente"
                        style={{ maxHeight: 100, margin: "0 auto", display: "block" }}
                      />
                    )}
                    <div
                      style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}
                    >
                      {data.cliente || "—"}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11 }}>
                      Cédula: {data.firmas?.clienteCedula || "—"}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
        {/* ── fin print-area ── */}

        {/* ══════════════════════════════════════
            BOTONES (ocultos al imprimir)
        ══════════════════════════════════════ */}
        <div className="no-print flex justify-between mt-6 max-w-[210mm] mx-auto">
          <button
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

      </div>
      {/* ── fin pdf-root ── */}
    </>
  );
}
