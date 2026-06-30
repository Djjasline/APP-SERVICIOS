import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { printPdf } from "@/utils/printPdf"; // ← ajusta la ruta a tu proyecto

export default function InformePDF({ allowDownload = true, backPath = "/informe" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLight } = useTheme();
  const [report, setReport] = useState(null);

  /* ── Cargar informe desde Supabase ── */
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

  /* ── Estados de carga / validación ── */
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
  const reportDescription =
    "Instalación y cambio de repuestos, montaje de elementos y reparación de sistemas. No aplica para inspección ni mantenimiento de equipos.";
  const toPointPercent = (value) => Math.min(100, Math.max(0, Number(value || 0) * 100));

  /* ── Handler de impresión via iframe ── */
  const handlePrint = () => {
  const cliente = (data.cliente || "cliente").replace(/\s+/g, "-");
  const pedido = (data.pedidoDemanda || "pedido").replace(/\s+/g, "");
  const codigo = (data.codInf || "000").replace(/\s+/g, "");

  const filename = `${cliente}_${pedido}_${codigo}_App Servicios ASTAP`;

  printPdf("pdf-content", filename);
};

  /* ── Estilos inline compartidos ── */
  const S = {
    tbl:   { width: "100%", borderCollapse: "collapse", fontSize: 10, color: "#111827" },
cell:  { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10, color: "#111827", backgroundColor: "#ffffff" },
    label: {
      border: "1px solid #374151", padding: "5px 8px", verticalAlign: "middle",
      fontSize: 11, fontWeight: 700, backgroundColor: "#f3f4f6", color: "#111827",
      whiteSpace: "nowrap", width: "35%",
    },
    th: {
      border: "1px solid #374151", padding: "5px 6px",
      backgroundColor: "#1e3a5f", color: "#fff",
      fontWeight: 700, textAlign: "center",
      textTransform: "uppercase", fontSize: 11,
    },
   sectionTitle: {
  fontSize: 11,
  fontWeight: 800,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: "5px 6px",
  backgroundColor: "#1e3a5f",
  color: "#fff",
  margin: "10px 0 0 0",
  border: "1px solid #1e3a5f",
},
  };

  return (
    <>
<style>{`
@page {
  margin: 10mm 10mm 14mm 10mm;
  @bottom-right {
    content: "Página " counter(page);
    font-size: 9px;
    color: #6b7280;
  }
}

.pdf-page-number {
  display: none;
}

@media print {

  .page-break {
    page-break-before: always;
  }

  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  table {
    break-inside: auto;
  }

  tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  img {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .activities-table tr,
  .activities-table td {
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .pdf-page-number {
    display: block;
    position: fixed;
    right: 0;
    bottom: -8mm;
    font-size: 9px;
    color: #6b7280;
  }

  .pdf-page-number::after {
    content: "Página " counter(page);
  }

  ${!allowDownload ? `#pdf-content { display: none !important; } .readonly-print-warning { display: block !important; }` : ""}

}
`}</style>
      {!allowDownload && (
        <div className="readonly-print-warning hidden p-8 text-center text-black">
          Vista solo lectura. Este usuario no tiene permiso de descarga o impresión.
        </div>
      )}
    <div
      style={{
        background: isLight ? "#f3f4f6" : "#0f172a",
        minHeight: "100vh",
        padding: "24px 16px",
        color: isLight ? "#111827" : "#e5e7eb",
      }}
    >

      {/* ══════════════════════════════════════════
          ÁREA PDF — id="pdf-content"
          printPdf() clona este nodo al iframe.
          No depende de jerarquía en el DOM real.
      ══════════════════════════════════════════ */}
      <div
        id="pdf-content"
        style={{
          maxWidth: 794,
          margin: "0 auto",
          background: "#fff",
          color: "#111827",
          padding: "18px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: 6,
        }}
      >

        {/* ════════════════════
            ENCABEZADO
        ════════════════════ */}
        <div className="no-break">
          <table style={S.tbl}>
            <tbody>
              <tr>
                <td rowSpan={5} style={{ ...S.cell, width: 130, textAlign: "center" }}>
                  <img
                    src="/astap-logo.jpg"
                    alt="ASTAP"
                    style={{ maxHeight: 65, margin: "0 auto", display: "block" }}
                  />
                </td>
                <td
                  colSpan={2}
                  style={{ ...S.cell, textAlign: "center", fontWeight: 800, textTransform: "uppercase" }}
                >
                  <div style={{ fontSize: 13 }}>
                    INFORME TÉCNICO DE SERVICIO
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 8.5,
                      fontWeight: 400,
                      lineHeight: 1.25,
                      textTransform: "none",
                    }}
                  >
                    ({reportDescription})
                  </div>
                </td>
                <td style={{ ...S.cell, width: 170, color: "#111827" }}>
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>
              <tr>
                <td style={{ ...S.label, width: "25%" }}>REFERENCIA CONTRATO</td>
                <td colSpan={2} style={S.cell}>{data.referenciaContrato || "—"}</td>
              </tr>
              <tr>
                <td style={S.label}>DESCRIPCIÓN</td>
                <td colSpan={2} style={S.cell}>{data.descripcion || "—"}</td>
              </tr>
              {/* PEDIDO / DEMANDA */}
              <tr>
                <td style={S.label}>N° DE PEDIDO / DEMANDA</td>
                <td colSpan={2} style={S.cell}>{data.pedidoDemanda || "—"}</td>
              </tr>
              <tr>
                <td style={S.label}>CÓDIGO DEL INFORME</td>
                <td colSpan={2} style={S.cell}>{data.codInf || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ════════════════════
            DATOS DEL SERVICIO
        ════════════════════ */}
        <div className="no-break">
          <p style={S.sectionTitle}>DATOS DEL SERVICIO</p>
          <table style={S.tbl}>
            <tbody>
              {[
                ["CLIENTE",             data.cliente],
                ["DIRECCIÓN",           data.direccion],
                ["CONTACTO",            data.contacto],
                ["TELÉFONO",            data.telefono],
                ["CORREO",              data.correo],
                ["TÉCNICO RESPONSABLE", data.tecnicoNombre],
                ["TELÉFONO TÉCNICO",    data.tecnicoTelefono],
                ["CORREO TÉCNICO",      data.tecnicoCorreo],
                ["FECHA DE SERVICIO",   data.fechaServicio],
              ].map(([label, value], i) => (
                <tr key={i}>
                  <td style={S.label}>{label}</td>
                  <td style={S.cell}>{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ════════════════════
            DESCRIPCIÓN EQUIPO
        ════════════════════ */}
        <div className="no-break">
          <p style={S.sectionTitle}>DESCRIPCIÓN DEL EQUIPO</p>
          <table style={S.tbl}>
            <tbody>
              {[
                ["NOTA",         data.equipo?.nota],
                ["MARCA",        data.equipo?.marca],
                ["MODELO",       data.equipo?.modelo],
                ["N° SERIE",     data.equipo?.serie],
                ["AÑO MODELO",   data.equipo?.anio],
                ["VIN / CHASIS", data.equipo?.vin],
                ["PLACA",        data.equipo?.placa],
                ["HORAS MÓDULO", data.equipo?.horasModulo],
                ["HORAS CHASIS", data.equipo?.horasChasis],
                ["KILOMETRAJE",  data.equipo?.kilometraje],
              ].map(([label, value], i) => (
                <tr key={i}>
                  <td style={S.label}>{label}</td>
                  <td style={S.cell}>{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ════════════════════
            ESTADO DEL EQUIPO
        ════════════════════ */}
        <div>
          <p style={S.sectionTitle}>ESTADO DEL EQUIPO</p>

          {estadoEquipoImagenes.length === 0 ? (
            <table style={S.tbl}>
              <tbody>
                <tr>
                  <td style={{ ...S.cell, textAlign: "center", color: "#6b7280", padding: "6px 8px" }}>
                    Sin registros de estado del equipo
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            estadoEquipoImagenes.map((img, imageIndex) => (
              <div
                key={img.id || imageIndex}
                style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", marginTop: 10 }}
              >
                <div style={{ padding: "5px 10px", borderBottom: "1px solid #d1d5db", fontSize: 11, fontWeight: 700, background: "#f9fafb", color: "#111827" }}>
                  Imagen {imageIndex + 1}
                </div>
                <div style={{ padding: 10 }}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 360,
                      aspectRatio: "4 / 3",
                      margin: "0 auto",
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
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                    {(img.puntos || []).map((p, pi) => (
                      <div
                        key={p.id || pi}
                        style={{
                          position: "absolute",
                          left: `${toPointPercent(p.x)}%`, top: `${toPointPercent(p.y)}%`,
                          transform: "translate(-50%,-50%)",
                          width: 18, height: 18, borderRadius: "50%",
                          background: "#dc2626", border: "2px solid #fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, color: "#fff", fontWeight: 700,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                        }}
                      >
                        {pi + 1}
                      </div>
                    ))}
                  </div>
                  {(img.puntos || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {img.puntos.map((p, pi) => (
                        <div key={p.id || pi} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11, color: "#111827" }}>
                          <span style={{ minWidth: 22, fontWeight: 700 }}>{pi + 1})</span>
                          <span style={{ whiteSpace: "pre-wrap" }}>{p.observacion || "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(img.puntos || []).length === 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#6b7280" }}>Sin puntos marcados</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ════════════════════
            ACTIVIDADES — página nueva
        ════════════════════ */}
        {/* <div className="page-break" /> */}

        <p style={{ ...S.sectionTitle, marginTop: 0 }}>ACTIVIDADES REALIZADAS Y HALLAZGOS</p>

        <table className="activities-table" style={S.tbl}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 40 }}>ÍTEM</th>
              <th style={{ ...S.th, width: "32%" }}>ACTIVIDAD / HALLAZGO</th>
              <th style={S.th}>IMÁGENES</th>
            </tr>
          </thead>
          <tbody>
            {(data.actividades || []).map((a, i) => (
              <tr key={i}>
                <td style={{ ...S.cell, textAlign: "center", verticalAlign: "top" }}>{i + 1}</td>
                <td style={{ ...S.cell, verticalAlign: "top" }}>
                  <strong>{a.titulo || "—"}</strong>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 5, fontSize: 11 }}>{a.detalle || "—"}</div>
                </td>
                <td style={{ ...S.cell, verticalAlign: "top" }}>
                  {a.imagenes?.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                      {a.imagenes.map((imgSrc, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={imgSrc}
                          alt={`act-${i + 1}-${imgIndex + 1}`}
                          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", border: "1px solid #d1d5db", borderRadius: 4, display: "block" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#9ca3af", textAlign: "center", fontSize: 11 }}>—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pdf-page-number" />

        {/* ════════════════════
            CONCLUSIONES / RECOMENDACIONES
        ════════════════════ */}
        <div className="no-break">
          <table style={{ ...S.tbl, marginTop: 14 }}>
            <thead>
              <tr>
                <th colSpan={2} style={S.th}>CONCLUSIÓN TÉCNICA</th>
                <th colSpan={2} style={S.th}>RECOMENDACIÓN ACCIONABLE</th>
              </tr>
            </thead>
            <tbody>
              {(data.conclusiones || []).map((c, i) => (
                <tr key={i} className="no-break">
                  <td style={{ ...S.cell, width: 28, textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...S.cell, whiteSpace: "pre-wrap" }}>{c || "—"}</td>
                  <td style={{ ...S.cell, width: 28, textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...S.cell, whiteSpace: "pre-wrap" }}>{data.recomendaciones?.[i] || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       {/* ════════════════════
    FIRMAS (CORREGIDO)
════════════════════ */}
<div className="no-break">
  <table style={{ ...S.tbl, marginTop: 14 }}>
    <thead>
      <tr>
        <th style={S.th}>FIRMA TÉCNICO ASTAP</th>
        <th style={S.th}>FIRMA CLIENTE</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        {/* ================= TÉCNICO ================= */}
        <td
          style={{
            ...S.cell,
            height: 120,
            textAlign: "center",
            verticalAlign: "top",
            paddingTop: 6,
          }}
        >
          {data.firmas?.tecnico && (
            <img
              src={data.firmas.tecnico}
              alt="Firma técnico"
              style={{
                width: "100%",
                maxWidth: 180,
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
          )}

         <div
  style={{
    marginTop: 10,
    fontSize: 12,
    fontWeight: 700,
  }}
>
  {data.tecnicoNombre || "—"}
</div>
        </td>

       {/* ================= CLIENTE ================= */}
<td
  style={{
    ...S.cell,
    height: 120,
    textAlign: "center",
    verticalAlign: "top",
    paddingTop: 6,
  }}
>
  {data.firmas?.cliente && (
    <img
      src={data.firmas.cliente}
      alt="Firma cliente"
      style={{
        width: "100%",
        maxWidth: 180,
        height: "auto",
        objectFit: "contain",
        display: "block",
        margin: "0 auto",
      }}
    />
  )}

  <div
    style={{
      marginTop: 10,
      fontSize: 12,
      fontWeight: 700,
    }}
  >
    {data.contacto || data.cliente || "—"}
  </div>

  <div
    style={{
      marginTop: 4,
      fontSize: 11,
    }}
  >
    Cédula: {data.firmas?.clienteCedula || "—"}
  </div>
</td>
      </tr>
    </tbody>
  </table>
</div>
      </div>
      {/* ── fin #pdf-content ── */}

      {/* ════════════════════
          BOTONES (no se imprimen)
      ════════════════════ */}
      <div
        className="no-print"
        style={{ display: "flex", justifyContent: "space-between", maxWidth: 794, margin: "24px auto 0" }}
      >
        <button
          onClick={() => navigate(backPath)}
          className={`border px-6 py-2 rounded ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-white/20 text-white hover:bg-white/10"}`}
        >
          Volver
        </button>
        {allowDownload ? (
          <button
            onClick={handlePrint}
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
    </>
  );
}

