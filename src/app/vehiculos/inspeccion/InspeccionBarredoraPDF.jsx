import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { printPdf } from "@/utils/printPdf";

/* ══════════════════════════════
   ESTILOS — IDÉNTICOS A HYDRO
══════════════════════════════ */
const S = {
  tbl:   { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  cell:  { border: "1px solid #374151", padding: "5px 8px", verticalAlign: "middle", fontSize: 11 },
  label: { border: "1px solid #374151", padding: "5px 8px", verticalAlign: "middle", fontSize: 11, fontWeight: 700, backgroundColor: "#f3f4f6", whiteSpace: "nowrap", width: "35%" },
  th:    { border: "1px solid #374151", padding: "6px 8px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", textTransform: "uppercase", fontSize: 11 },
  thSI:  { border: "1px solid #374151", padding: "6px 4px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10, width: 36 },
  sectionTitle: {
    fontSize: 12, fontWeight: 800, textAlign: "center", textTransform: "uppercase",
    letterSpacing: "0.5px", padding: "6px 8px", backgroundColor: "#1e3a5f",
    color: "#fff", margin: "14px 0 0 0", border: "1px solid #1e3a5f",
  },
};

const estadoColor = { SI: "#dcfce7", NO: "#fee2e2", NA: "#f3f4f6" };

/* ── TABLA CHECKLIST ── */
function ChecklistTable({ items, data }) {
  return (
    <table style={S.tbl}>
      <thead>
        <tr>
          <th style={{ ...S.th, width: 50 }}>ÍTEM</th>
          <th style={{ ...S.th, textAlign: "left" }}>DESCRIPCIÓN</th>
          <th style={S.thSI}>SI</th>
          <th style={S.thSI}>NO</th>
          <th style={S.thSI}>N/A</th>
          <th style={{ ...S.th, textAlign: "left" }}>OBSERVACIÓN</th>
        </tr>
      </thead>
      <tbody>
        {items.map(([codigo, desc]) => {
          const estado = data?.items?.[codigo]?.estado || "";
          const obs    = data?.items?.[codigo]?.observacion || "";
          return (
            <tr key={codigo}>
              <td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{codigo}</td>
              <td style={S.cell}>{desc}</td>
              {["SI", "NO", "NA"].map((opt) => (
                <td
                  key={opt}
                  style={{
                    ...S.cell,
                    textAlign: "center",
                    backgroundColor: estado === opt ? estadoColor[opt] : "#fff",
                    fontWeight: estado === opt ? 700 : 400,
                  }}
                >
                  {estado === opt ? "✓" : ""}
                </td>
              ))}
              <td style={S.cell}>{obs || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ══════════════════════════════
   DATOS DE INSPECCIÓN
══════════════════════════════ */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

const secciones = [
  {
    titulo: "A) CARRETE Y ESTRUCTURA",
    items: [
      ["A.1", "Estructura del carrete sin deformaciones ni soldaduras rotas"],
      ["A.2", "Pintura y acabado sin corrosión ni desprendimientos"],
      ["A.3", "Mango, manivela o freno en buen estado y funcionamiento suave"],
      ["A.4", "Base estable, sin vibraciones al girar el tambor"],
      ["A.5", "Ruedas (si aplica) sin desgaste"],
    ],
  },
  {
    titulo: "B) CABLE Y SISTEMA DE TRANSMISIÓN",
    items: [
      ["B.1", "Cable limpio, libre de cortes, dobleces o secciones planas"],
      ["B.2", "Recubrimiento sin grietas ni desgaste visible"],
      ["B.3", "Longitud total verificada (según especificación)"],
      ["B.4", "Marcadores de longitud visibles y legibles"],
      ["B.5", "Giro libre del cable en ambos sentidos al enrollar / desenrollar"],
      ["B.6", "Cable y carrete completamente limpios"],
      ["B.7", "Lubricación ligera de ejes y rodamientos"],
      ["B.8", "Tapones y protecciones instalados para transporte"],
      ["B.9", "Empaque o caja en buen estado"],
    ],
  },
  {
    titulo: "C) CABEZAL Y SISTEMA ÓPTICO",
    items: [
      ["C.1", "Lente limpio y sin rayaduras"],
      ["C.2", "Iluminación LED funcional (probar con fuente)"],
      ["C.3", "Alineación y estanqueidad verificada (sin fugas)"],
      ["C.4", "Protección frontal y resorte de entrada intactos"],
      ["C.5", "Imagen estable y centrada"],
      ["C.6", "LEDs responden a control de intensidad"],
      ["C.7", "Sin interferencias ni pérdida de señal al enrollar cable"],
    ],
  },
];

/* ══════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════ */
export default function InspeccionBarredoraPDF() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
  .from("registros")
  .select("*")
  .eq("id", id)
  .eq("area", "vehiculos")
  .eq("tipo", "inspeccion")
  .eq("subtipo", "barredora")
  .single();

      if (error || !data) { console.error(error); return; }
      setReport({ id: data.id, estado: data.estado, data: data.data, createdAt: data.created_at });
    };
    load();
  }, [id]);

  if (!report) return (
    <div className="p-6 text-center">
      <p>No se encontró la inspección.</p>
      <button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded mt-4">
        Volver
      </button>
    </div>
  );

  if (report.estado !== "completado") return (
    <div className="p-6 text-center">
      <p>Esta inspección no está completada.</p>
      <button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded mt-4">
        Volver
      </button>
    </div>
  );

  const { data: d } = report;

  const handlePrint = () => {
    const cliente = (d.cliente    || "cliente").replace(/\s+/g, "-");
    const pedido  = (d.pedidoDemanda || "pedido").replace(/\s+/g, "");
    const codigo  = (d.codInf     || "000").replace(/\s+/g, "");
    printPdf("pdf-content", `Inspeccion_Camara_${cliente}_${pedido}_${codigo}_ASTAP`);
  };

  const estadoEquipoImagenes = d?.estadoEquipo?.imagenes || [];
  const puntosBase           = d?.estadoEquipo?.puntosBase || [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "24px 16px" }}>
      <div
        id="pdf-content"
        style={{
          maxWidth: 794,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: 6,
        }}
      >

        {/* ── ENCABEZADO ── */}
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
                  style={{
                    ...S.cell,
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    textTransform: "uppercase",
                  }}
                >
                  HOJA DE INSPECCIÓN CÁMARA V-CAM6
                </td>
                <td style={{ ...S.cell, width: 170 }}>
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>
              {[
                ["REFERENCIA CONTRATO", d.referenciaContrato],
                ["PEDIDO / DEMANDA",    d.pedidoDemanda],
                ["DESCRIPCIÓN",         d.descripcion],
                ["COD. INF.",           d.codInf],
              ].map(([label, value], i) => (
                <tr key={i}>
                  <td style={{ ...S.label, width: "25%" }}>{label}</td>
                  <td colSpan={2} style={S.cell}>{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── DATOS DEL SERVICIO ── */}
        <div className="no-break">
          <p style={S.sectionTitle}>DATOS DEL SERVICIO</p>
          <table style={S.tbl}>
            <tbody>
              {[
                ["CLIENTE",              d.cliente],
                ["DIRECCIÓN",            d.direccion],
                ["CONTACTO",             d.contacto],
                ["TELÉFONO",             d.telefono],
                ["CORREO",               d.correo],
                ["TÉCNICO RESPONSABLE",  d.tecnicoNombre],
                ["TELÉFONO TÉCNICO",     d.tecnicoTelefono],
                ["CORREO TÉCNICO",       d.tecnicoCorreo],
                ["FECHA DE SERVICIO",    d.fechaServicio],
              ].map(([l, v], i) => (
                <tr key={i}>
                  <td style={S.label}>{l}</td>
                  <td style={S.cell}>{v || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── DESCRIPCIÓN DEL EQUIPO ── */}
        <div className="no-break">
          <p style={S.sectionTitle}>DESCRIPCIÓN DEL EQUIPO — V-CAM6</p>
          <table style={S.tbl}>
            <tbody>
              {[
                ["NOTA",             d.equipo?.nota],
                ["MARCA",            d.equipo?.marca],
                ["MODELO",           d.equipo?.modelo],
                ["AÑO MODELO",       d.equipo?.anio],
                ["N° SERIE MÓDULO",  d.equipo?.serieModulo],
                ["N° SERIE CARRETE", d.equipo?.serieCarrete],
                ["N° SERIE CABEZAL", d.equipo?.serieCabezal],
              ].map(([l, v], i) => (
                <tr key={i}>
                  <td style={S.label}>{l}</td>
                  <td style={S.cell}>{v || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── ESTADO DEL EQUIPO ── */}
        <div>
          <p style={S.sectionTitle}>ESTADO DEL EQUIPO</p>

          {/* Plantilla base con puntos */}
          {puntosBase.length > 0 && (
            <div
              className="no-break"
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 6,
                overflow: "hidden",
                marginTop: 10,
              }}
            >
              <div
                style={{
                  padding: "5px 10px",
                  borderBottom: "1px solid #d1d5db",
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#f9fafb",
                }}
              >
                Vista general del equipo
              </div>
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/estado-equipo-camara.png"
                    alt="Vista general cámara"
                    style={{ width: "100%", maxHeight: 350, objectFit: "contain", display: "block" }}
                  />
                  {puntosBase.map((p, pi) => (
                    <div
                      key={p.id || pi}
                      style={{
                        position: "absolute",
                        left: `${p.x * 100}%`,
                        top: `${p.y * 100}%`,
                        transform: "translate(-50%,-50%)",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#dc2626",
                        border: "2px solid #fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {pi + 1}
                    </div>
                  ))}
                </div>
                {puntosBase.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {puntosBase.map((p, pi) => (
                      <div
                        key={p.id || pi}
                        style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11 }}
                      >
                        <span style={{ minWidth: 22, fontWeight: 700 }}>{pi + 1})</span>
                        <span>{p.observacion || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotografías adicionales */}
          {estadoEquipoImagenes.length === 0 && puntosBase.length === 0 ? (
            <table style={S.tbl}>
              <tbody>
                <tr>
                  <td style={{ ...S.cell, textAlign: "center", color: "#6b7280", padding: 20 }}>
                    Sin registros de estado del equipo
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            estadoEquipoImagenes.map((img, i) => (
              <div
                key={img.id || i}
                className="no-break"
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    padding: "5px 10px",
                    borderBottom: "1px solid #d1d5db",
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#f9fafb",
                  }}
                >
                  Fotografía {i + 1}
                </div>
                <div style={{ padding: 10 }}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`estado-${i + 1}`}
                      style={{
                        width: "100%",
                        maxHeight: 350,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                    {(img.puntos || []).map((p, pi) => (
                      <div
                        key={p.id || pi}
                        style={{
                          position: "absolute",
                          left: `${p.x * 100}%`,
                          top: `${p.y * 100}%`,
                          transform: "translate(-50%,-50%)",
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#dc2626",
                          border: "2px solid #fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {pi + 1}
                      </div>
                    ))}
                  </div>
                  {(img.puntos || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {img.puntos.map((p, pi) => (
                        <div
                          key={p.id || pi}
                          style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11 }}
                        >
                          <span style={{ minWidth: 22, fontWeight: 700 }}>{pi + 1})</span>
                          <span>{p.observacion || "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── PRUEBAS PREVIAS ── */}
        <div className="no-break">
          <p style={{ ...S.sectionTitle, marginTop: 0 }}>
            1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
          </p>
          <ChecklistTable items={pruebasPrevias} data={d} />
        </div>

        {/* ── SECCIONES A–C ── */}
        {secciones.map((sec, i) => (
          <div key={i} className="no-break">
            <p style={S.sectionTitle}>{sec.titulo}</p>
            <ChecklistTable items={sec.items} data={d} />
          </div>
        ))}

        {/* ── CONCLUSIONES Y RECOMENDACIONES ── */}
        <div className="no-break">
          <table style={{ ...S.tbl, marginTop: 14 }}>
            <thead>
              <tr>
                <th colSpan={2} style={S.th}>CONCLUSIONES</th>
                <th colSpan={2} style={S.th}>RECOMENDACIONES</th>
              </tr>
            </thead>
            <tbody>
              {(d.conclusiones || []).map((c, i) => (
                <tr key={i} className="no-break">
                  <td style={{ ...S.cell, width: 28, textAlign: "center", fontWeight: 700 }}>
                    {i + 1}
                  </td>
                  <td style={{ ...S.cell, whiteSpace: "pre-wrap" }}>{c || "—"}</td>
                  <td style={{ ...S.cell, width: 28, textAlign: "center", fontWeight: 700 }}>
                    {i + 1}
                  </td>
                  <td style={{ ...S.cell, whiteSpace: "pre-wrap" }}>
                    {d.recomendaciones?.[i] || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── NOTA FINAL ── */}
        <div className="no-break">
          <p style={S.sectionTitle}>NOTA / OBSERVACIÓN FINAL DEL TÉCNICO</p>
          <table style={S.tbl}>
            <tbody>
              <tr>
                <td style={{ ...S.cell, whiteSpace: "pre-wrap", minHeight: 60 }}>
                  {d.notaFinal || "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── FIRMAS ── */}
        <div className="no-break">
          <table style={{ ...S.tbl, marginTop: 10 }}>
            <thead>
              <tr>
                <th style={S.th}>FIRMA TÉCNICO ASTAP</th>
                <th style={S.th}>FIRMA CLIENTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* TÉCNICO */}
                <td
                  style={{
                    ...S.cell,
                    height: 85,
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "6px 8px",
                  }}
                >
                  <div
                    style={{
                      height: 45,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {d.firmas?.tecnico ? (
                      <img
                        src={d.firmas.tecnico}
                        alt="Firma técnico"
                        style={{
                          maxHeight: 38,
                          width: "auto",
                          maxWidth: 160,
                          objectFit: "contain",
                          display: "block",
                          filter: "contrast(1.05)",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {d.tecnicoNombre || "—"}
                  </div>
                </td>

                {/* CLIENTE */}
                <td
                  style={{
                    ...S.cell,
                    height: 85,
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "6px 8px",
                  }}
                >
                  <div
                    style={{
                      height: 45,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {d.firmas?.cliente ? (
                      <img
                        src={d.firmas.cliente}
                        alt="Firma cliente"
                        style={{
                          maxHeight: 38,
                          width: "auto",
                          maxWidth: 160,
                          objectFit: "contain",
                          display: "block",
                          filter: "contrast(1.05)",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {d.cliente || "—"}
                  </div>
                  <div style={{ marginTop: 1, fontSize: 9, color: "#4b5563" }}>
                    Cédula: {d.firmas?.clienteCedula || "—"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* ── BOTONES ── */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 794,
          margin: "24px auto 0",
        }}
      >
        <button
          onClick={() => navigate("/inspeccion")}
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
  );
}
