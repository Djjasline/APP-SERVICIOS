import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { printPdf } from "@/utils/printPdf";
import ObservationImagesPdf from "@/components/ObservationImagesPdf";
import { InspectionPartsAnnexPdf } from "@/components/InspectionPartsAnnex";
import { PdfConclusionRecommendationTable, PdfEquipmentImageFrame } from "@/components/pdf/PdfReportLayout";

/* ══════════════════════════════
   ESTILOS — COMPACTOS PDF
══════════════════════════════ */
const S = {
  tbl: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 10,
  },

  cell: {
    border: "1px solid #374151",
    padding: "4px 6px",
    verticalAlign: "middle",
    fontSize: 10,
  },

  label: {
    border: "1px solid #374151",
    padding: "4px 6px",
    verticalAlign: "middle",
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: "#f3f4f6",
    whiteSpace: "nowrap",
    width: "35%",
  },

  th: {
    border: "1px solid #374151",
    padding: "4px 6px",
    backgroundColor: "#1e3a5f",
    color: "#fff",
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: 10,
  },

  thSI: {
    border: "1px solid #374151",
    padding: "4px 4px",
    backgroundColor: "#1e3a5f",
    color: "#fff",
    fontWeight: 700,
    textAlign: "center",
    fontSize: 10,
    width: 36,
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
          const item = data?.items?.[codigo] || {};
          const obs = item.observacion || "";
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
              <td style={S.cell}>
                <div>{obs || "—"}</div>
                <ObservationImagesPdf images={item.imagenes} />
              </td>
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
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)"],
      ["A.2", "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?"],
      ["A.3", "Fugas de aceite en motores de cepillos"],
      ["A.4", "Fugas de aceite en motor de banda"],
      ["A.5", "Fugas de bombas hidráulicas"],
      ["A.6", "Fugas en motor John Deere"],
    ],
  },
  {
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      ["B.1", "Inspección de fugas de agua (mangueras, acoples)"],
      ["B.2", "Estado del filtro para agua"],
      ["B.3", "Estado de válvulas check"],
      ["B.4", "Estado de solenoides de apertura de agua"],
      ["B.5", "Estado de la bomba eléctrica de agua"],
      ["B.6", "Estado de los aspersores de cepillos"],
      ["B.7", "Estado de la manguera de carga de agua hidrante"],
      ["B.8", "Inspección del medidor de nivel del tanque"],
      ["B.9", "Inspección del sistema de llenado de agua"],
    ],
  },
  {
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Inspección visual de conectores de bancos de control"],
      ["C.2", "Evaluar funcionamiento al encender el equipo"],
      ["C.3", "Estado del tablero de control de cabina"],
      ["C.4", "Inspección de batería"],
      ["C.5", "Inspección de luces externas"],
      ["C.6", "Diagnóstico con service tool (opcional)"],
      ["C.7", "Estado del limpia parabrisas"],
      ["C.8", "Conexiones externas (GPS / radio)"],
    ],
  },
  {
    titulo: "D) SISTEMA DE RECOLECCIÓN",
    items: [
      ["D.1", "Estado de la banda"],
      ["D.2", "Estado de las cerdas de los cepillos"],
      ["D.3", "Estado de la tolva"],
      ["D.4", "Funcionamiento de la tolva"],
      ["D.5", "Funcionamiento de la banda"],
      ["D.6", "Estado de zapatas de arrastre"],
    ],
  },
  {
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      ["E.1", "Estado de filtros de aire 1° y 2°"],
      ["E.2", "Filtro combustible trampa de agua"],
      ["E.3", "Filtro de combustible"],
      ["E.4", "Filtro de aceite"],
      ["E.5", "Nivel de aceite de motor"],
      ["E.6", "Estado y nivel del refrigerante"],
      ["E.7", "Filtro A/C cabina"],
    ],
  },
];

/* ══════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════ */
const barredoraVariants = {
  pelican: {
    subtipo: "barredora",
    title: "INFORME DE INSPECCIÓN BARREDORA PELICAN",
    description: "Inspección del módulo de barrido incluye motor de combustión interna.",
    filePrefix: "Inspeccion_Barredora_Pelican",
    imagePath: "/barredora-base.png",
    imageAlt: "Vista general barredora Pelican",
    equipmentTitle: "DESCRIPCIÓN DEL EQUIPO — BARREDORA PELICAN",
  },
  roadWizard: {
    subtipo: "barredora-road-wizard",
    title: "INFORME DE INSPECCIÓN BARREDORA ROAD WIZARD",
    description: "Inspección del módulo barredora Road Wizard incluye motor auxiliar, no incluye servicio de chasis.",
    filePrefix: "Inspeccion_Barredora_Road_Wizard",
    imagePath: "/barredora-roadwizard-base.png",
    imageAlt: "Vista general barredora Road Wizard",
    equipmentTitle: "DESCRIPCIÓN DEL EQUIPO — BARREDORA ROAD WIZARD",
  },
};

export default function InspeccionBarredoraPDF({ variant = "pelican", allowDownload = true }) {
  const variantConfig = barredoraVariants[variant] || barredoraVariants.pelican;
  const navigate = useNavigate();
  const { id }   = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
  const load = async () => {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .eq("tipo", "inspeccion")
      .or("area.eq.vehiculos,area.is.null")
      .single();

    if (error || !data) {
      console.error(error);
      return;
    }

    const subtipo = String(data?.subtipo || "").toLowerCase();

    if (subtipo && subtipo !== variantConfig.subtipo) {
      console.error("El registro no corresponde a barredora:", data?.subtipo);
      return;
    }

    setReport({
      id: data.id,
      estado: data.estado,
      data: data.data,
      createdAt: data.created_at,
    });
  };

  load();
}, [id, variantConfig.subtipo]);

  if (!report) return (
    <div className="p-6 text-center">
      <p>No se encontró la inspección.</p>
      <button onClick={() => navigate("/vehiculos/inspeccion")} className="btn-volver-orange mt-4">
        Volver
      </button>
    </div>
  );

  if (report.estado !== "completado" && allowDownload) return (
    <div className="p-6 text-center">
      <p>Esta inspección no está completada.</p>
      <button onClick={() => navigate("/vehiculos/inspeccion")} className="btn-volver-orange mt-4">
        Volver
      </button>
    </div>
  );

  const { data: d } = report;

  const handlePrint = () => {
    const cliente = (d.cliente    || "cliente").replace(/\s+/g, "-");
    const pedido  = (d.pedidoDemanda || "pedido").replace(/\s+/g, "");
    const codigo  = (d.codInf     || "000").replace(/\s+/g, "");
  printPdf(
  "pdf-content",
  `${variantConfig.filePrefix}_${cliente}_${pedido}_${codigo}_ASTAP`
);
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
          padding: 18,
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
                  <div>{variantConfig.title}</div>
                  <div style={{ marginTop: 3, fontSize: 8.5, fontWeight: 400, lineHeight: 1.25, textTransform: "none" }}>
                    {variantConfig.description}
                  </div>
                </td>
                <td style={{ ...S.cell, width: 170 }}>
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>
              {[
                ["REFERENCIA CONTRATO", d.referenciaContrato],
                ["N° DE PEDIDO / DEMANDA", d.pedidoDemanda],
                ["DESCRIPCIÓN",         d.descripcion],
                ["CÓDIGO DEL INFORME",  d.codInf],
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
          <p style={S.sectionTitle}>{variantConfig.equipmentTitle}</p>
          <table style={S.tbl}>
            <tbody>
              {[
                ["NOTA", d.equipo?.nota],
                ["MARCA", d.equipo?.marca],
                ["MODELO", d.equipo?.modelo],
                ["N° SERIE", d.equipo?.serie],
                ["AÑO MODELO", d.equipo?.anio],
                ["VIN / CHASIS", d.equipo?.vin],
                ["PLACA", d.equipo?.placa],
                ["HORAS MÓDULO", d.equipo?.horasModulo],
                ["HORAS CHASIS", d.equipo?.horasChasis],
                ["KILOMETRAJE", d.equipo?.kilometraje],
                ["HORÓMETRO", d.equipo?.horometro],
                [null, null],
              ].reduce((rows, field, idx, arr) => {
                if (idx % 2 !== 0) return rows;

                const next = arr[idx + 1];

                rows.push(
                  <tr key={idx}>
                    {field[0] ? (
                      <>
                        <td style={{ ...S.label, width: "25%" }}>{field[0]}</td>
                        <td style={{ ...S.cell, width: "25%" }}>{field[1] || "—"}</td>
                      </>
                    ) : (
                      <td colSpan={2} style={S.cell} />
                    )}

                    {next?.[0] ? (
                      <>
                        <td style={{ ...S.label, width: "25%" }}>{next[0]}</td>
                        <td style={{ ...S.cell, width: "25%" }}>{next[1] || "—"}</td>
                      </>
                    ) : (
                      <td colSpan={2} style={S.cell} />
                    )}
                  </tr>
                );

                return rows;
              }, [])}
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
                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              <div
                style={{
                  padding: "5px 10px",
                  borderBottom: "1px solid #d1d5db",
                  fontSize: 10,
                  fontWeight: 700,
                  background: "#f9fafb",
                }}
              >
                Vista general del equipo
              </div>
              <div style={{ padding: 10 }}>
                <PdfEquipmentImageFrame src={variantConfig.imagePath} alt={variantConfig.imageAlt} points={puntosBase} />
                {puntosBase.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {puntosBase.map((p, pi) => (
                      <div
                        key={p.id || pi}
                        style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 10 }}
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
                  <td style={{ ...S.cell, textAlign: "center", color: "#6b7280", padding: "6px 8px" }}>
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
                  breakInside: "avoid",
                  pageBreakInside: "avoid",
                }}
              >
                <div
                  style={{
                    padding: "5px 10px",
                    borderBottom: "1px solid #d1d5db",
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#f9fafb",
                  }}
                >
                  Fotografía {i + 1}
                </div>
                <div style={{ padding: 10 }}>
                  <PdfEquipmentImageFrame src={img.url} alt={`estado-${i + 1}`} points={img.puntos} />
                  {(img.puntos || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {img.puntos.map((p, pi) => (
                        <div
                          key={p.id || pi}
                          style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 10 }}
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
        <div>
          <p style={{ ...S.sectionTitle, marginTop: 0 }}>
            1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
          </p>
          <ChecklistTable items={pruebasPrevias} data={d} />
        </div>

        {/* ── SECCIONES A–C ── */}
        {secciones.map((sec, i) => (
          <div key={i}>
            <p style={S.sectionTitle}>{sec.titulo}</p>
            <ChecklistTable items={sec.items} data={d} />
          </div>
        ))}

        <InspectionPartsAnnexPdf rows={d.anexoItems} styles={S} />

        {/* ── CONCLUSION Y RECOMENDACION ── */}
        <div className="no-break">
          <PdfConclusionRecommendationTable conclusiones={d.conclusiones} recomendaciones={d.recomendaciones} styles={S} />
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
                    padding: "4px 6px",
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
                          maxHeight: 34,
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
                    padding: "4px 6px",
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
                          maxHeight: 34,
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
                    {d.contacto || d.cliente || "—"}
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
          onClick={() => navigate("/vehiculos/inspeccion")}
          className="btn-volver-orange px-6"
        >
          Volver
        </button>
        {allowDownload && (
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  );
}
