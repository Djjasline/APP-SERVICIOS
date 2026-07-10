import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { printPdf } from "@/utils/printPdf";
import ObservationImagesPdf from "@/components/ObservationImagesPdf";
import { PdfEquipmentImageFrame } from "@/components/pdf/PdfReportLayout";

/* ══════════════════════════════
   ESTILOS — IDÉNTICOS A HYDRO
══════════════════════════════ */
const S = {
  tbl:   { width: "100%", borderCollapse: "collapse", fontSize: 10 },
  cell:  { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10 },
  label: { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10, fontWeight: 700, backgroundColor: "#f3f4f6", whiteSpace: "nowrap", width: "35%" },
  th:    { border: "1px solid #374151", padding: "6px 8px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", textTransform: "uppercase", fontSize: 10 },
  thSI:  { border: "1px solid #374151", padding: "6px 4px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10, width: 36 },
  sectionTitle: {
    fontSize: 11, fontWeight: 800, textAlign: "center", textTransform: "uppercase",
    letterSpacing: "0.5px", padding: "6px 8px", backgroundColor: "#1e3a5f",
    color: "#fff", margin: "10px 0 0 0", border: "1px solid #1e3a5f",
  },
};

/* ══════════════════════════════
   SECCIONES — ESPEJO EXACTO DEL FORM
══════════════════════════════ */
const secciones = [
  {
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Encendido general del equipo"],
      ["1.2", "Funcionamiento de controles y tablero"],
      ["1.3", "Revisión de alarmas o fallas"],
    ],
  },
  {
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO",
    tipo: "cantidad",
    items: [
      ["2.1",  "Filtro de combustible primario (trampa de agua)"],
      ["2.2",  "Filtro de combustible secundario (bomba)"],
      ["2.3",  "Aceite de motor 15W40 (4 GL)"],
      ["2.4",  "Filtro de aceite de motor"],
      ["2.5",  "Filtro de aire primario interno"],
      ["2.6",  "Filtro de aire secundario exterior"],
      ["2.7",  "Reemplazo de filtros de combustible"],
      ["2.8",  "Comprobación tensión tensor de correa y desgaste de banda"],
      ["2.9",  "Reemplazo de aceite de motor"],
      ["2.10", "Reemplazo filtro de aceite de motor"],
      ["2.11", "Mantenimiento por 250 Hrs"],
      ["2.12", "Mano de obra mantenimiento por 1000 Hrs motor"],
      ["2.13", "Inspección visual de bomba de agua"],
      ["2.14", "Verificación manguera respiradero cárter y válvula"],
      ["2.15", "Calibración de válvulas del motor"],
      ["2.16", "Cambio de empaque tapa de válvulas"],
      ["2.17", "Limpieza de inyectores por método de recirculación"],
      ["2.18", "Reemplazo de termostato"],
      ["2.19", "Cambio de refrigerante"],
      ["2.20", "Reemplazo de filtros de aire"],
      ["2.21", "Aceite hidráulico AW 68"],
      ["2.22", "Kit filtro hidráulico"],
      ["2.23", "Aceite sintético SHC 629 cubo de ruedas"],
      ["2.24", "Filtro de aire acondicionado"],
      ["2.25", "Refrigerante JD tanque 2 1/2 gal"],
      ["2.26", "Grasa JD multipropósito"],
      ["2.27", "Termostato"],
      ["2.28", "Empaque tapa de válvula"],
      ["2.29", "Junta del termostato"],
      ["2.30", "Elemento filtrante"],
      ["2.31", "Aditivo limpieza de inyectores"],
      ["2.32", "Set segmento cepillo lateral"],
      ["2.33", "Cepillo central"],
      ["2.34", "Caucho zapata lateral"],
      ["2.35", "Caucho zapata esquinera"],
      ["2.36", "Cadena banda transportadora"],
      ["2.37", "Piñón hidromotor banda transportadora"],
      ["2.38", "Piñón rodillo superior banda"],
      ["2.39", "Filtro de agua"],
      ["2.40", "Chumacera eje cepillo"],
      ["2.41", "Chumacera rodillo superior"],
      ["2.42", "Chumacera eje inferior banda"],
      ["2.43", "Banda transportadora"],
    ],
  },
  {
    titulo: "4. OTROS (ESPECIFICAR)",
    tipo: "otros",
    items: [],
  },
  {
    titulo: "5. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POST SERVICIO",
    tipo: "simple",
    items: [
      ["5.1", "Encendido general del equipo", "3.1"],
      ["5.2", "Funcionamiento del sistema de barrido", "3.2"],
      ["5.3", "Funcionamiento del sistema hidráulico", "3.3"],
    ],
  },
];

const roadWizardSecciones = [
  secciones[0],
  {
    titulo: "A. MANTENIMIENTO POR 250 Hrs",
    tipo: "cantidad",
    items: [
      ["A.1", "Aceite de motor 15W40"],
      ["A.2", "Filtro de aceite P/N 51783"],
      ["A.3", "Filtro de aire primario P/N 7174125"],
      ["A.4", "Filtro de aire secundario P/N 7174126"],
      ["A.5", "Filtro de combustible primario P/N 7174127"],
      ["A.6", "Filtro de combustible secundario (cartucho de filtro) P/N 7174129"],
      ["A.7", "Desplazamiento a campo"],
    ],
  },
  {
    titulo: "B. MANTENIMIENTO POR 1000 Hrs",
    tipo: "cantidad",
    items: [
      ["B.1", "Aceite hidráulico AW 68"],
      ["B.2", "Cartucho filtro hidráulico P/N 1090961"],
      ["B.3", "Refrigerante Gold TY26576 GL, una vez por año"],
    ],
  },
  {
    titulo: "C. REPUESTOS QUE SE REQUIEREN PARA 1000 HORAS + AÑO",
    tipo: "cantidad",
    items: [
      ["C.1", "Cepillo central barredora Road Wizard P/N 7173202"],
      ["C.2", "Set de cepillo lateral 5 segmentos P/N 7173222"],
      ["C.3", "Rodamiento superior de banda P/N 1034474"],
      ["C.4", "Rodamiento inferior de banda P/N 1034473"],
      ["C.5", "Rodamiento cepillo principal P/N 1023051"],
      ["C.6", "Banda transportadora P/N 1118973"],
      ["C.7", "Filtro de agua P/N 1052992"],
      ["C.8", "Luz lateral derecha P/N 0806548"],
      ["C.9", "Aspersores de cepillos P/N 1040011 (6)"],
      ["C.10", "Manguera llenado de agua hidrante 2 1/2\" x 21 ft P/N 267290-30"],
    ],
  },
  {
    titulo: "D. REPUESTOS QUE SE REQUIEREN PARA MANTENIMIENTO DE CHASIS",
    tipo: "cantidad",
    items: [
      ["D.1", "Filtro de A/C"],
      ["D.2", "Filtro de aire primario"],
      ["D.3", "Filtro de aire secundario"],
      ["D.4", "Filtro separador combustible"],
      ["D.5", "Filtro de combustible separador"],
      ["D.6", "Filtro de aceite"],
      ["D.7", "Aceite"],
      ["D.8", "Grasa"],
      ["D.9", "Aceite de la dirección"],
      ["D.10", "Filtro de la dirección"],
      ["D.11", "Refrigerante"],
      ["D.12", "Aceite puntas de eje"],
      ["D.13", "Mano de obra de mantenimiento de 1000 horas y desplazamiento"],
      ["D.14", "Mano de obra de mantenimiento de 250 horas"],
    ],
  },
  secciones[2],
  secciones[3],
];

const barredoraPdfVariants = {
  pelican: {
    subtipo: "barredora",
    title: "INFORME DE MANTENIMIENTO BARREDORA PELICAN",
    description: "Mantenimiento del módulo de barrido incluye motor de combustión interna.",
    filePrefix: "Mantenimiento_Barredora_Pelican",
    sections: secciones,
  },
  roadWizard: {
    subtipo: "barredora-road-wizard",
    title: "INFORME DE MANTENIMIENTO BARREDORA ROAD WIZARD",
    description: "Mantenimiento del módulo barredora Road Wizard incluye motor auxiliar, no incluye servicio de chasis.",
    filePrefix: "Mantenimiento_Barredora_Road_Wizard",
    sections: roadWizardSecciones,
  },
};

/* ── TABLA DE SECCIÓN ── */
function SeccionTable({ sec, items, extras = [] }) {
  const rows = sec.tipo === "otros"
    ? extras.map((extra) => ({ codigo: extra.item, texto: extra.detalle || "—", item: extra }))
    : sec.items.map(([codigo, texto, codigoAnterior]) => ({
        codigo,
        texto,
        item: items?.[codigo] || items?.[codigoAnterior] || {},
      }));

  if (sec.tipo === "otros" && rows.length === 0) return null;

  return (
    <table style={S.tbl}>
      <thead>
        <tr>
          <th style={{ ...S.th, width: 50, textAlign: "left" }}>ÍTEM</th>
          <th style={{ ...S.th, textAlign: "left" }}>DETALLE</th>
          {sec.tipo === "cantidad" && <th style={{ ...S.th, width: 70 }}>CANT.</th>}
          <th style={S.thSI}>SI</th>
          <th style={S.thSI}>NO</th>
          <th style={{ ...S.th, textAlign: "left" }}>OBSERVACIÓN</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ codigo, texto, item }) => {
          const esSI = item.estado === "SI";
          const esNO = item.estado === "NO";
          return (
            <tr key={codigo}>
              <td style={{ ...S.cell, fontWeight: 700 }}>{codigo}</td>
              <td style={S.cell}>{texto}</td>
              {sec.tipo === "cantidad" && (
                <td style={{ ...S.cell, textAlign: "center" }}>
                  {item.cantidad || "—"}
                </td>
              )}
              <td style={{
                ...S.cell, textAlign: "center",
                backgroundColor: esSI ? "#dcfce7" : "#fff",
                fontWeight: esSI ? 700 : 400,
              }}>
                {esSI ? "✓" : ""}
              </td>
              <td style={{
                ...S.cell, textAlign: "center",
                backgroundColor: esNO ? "#fee2e2" : "#fff",
                fontWeight: esNO ? 700 : 400,
              }}>
                {esNO ? "✓" : ""}
              </td>
              <td style={S.cell}>
                <div>{item.observacion || "—"}</div>
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
   COMPONENTE PRINCIPAL
══════════════════════════════ */
export default function MantenimientoBarredoraPDF({ variant = "pelican" }) {
  const variantConfig = barredoraPdfVariants[variant] || barredoraPdfVariants.pelican;
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
  .eq("tipo", "mantenimiento")
  .eq("subtipo", variantConfig.subtipo)
  .single();
      if (error || !data) { console.error(error); return; }
      setReport({ id: data.id, estado: data.estado, data: data.data, createdAt: data.created_at });
    };
    load();
  }, [id, variantConfig.subtipo]);

  if (!report) return (
    <div className="p-6 text-center">
      <p>No se encontró el mantenimiento.</p>
      <button onClick={() => navigate("/mantenimiento")} className="border px-4 py-2 rounded mt-4">
        Volver
      </button>
    </div>
  );

  if (report.estado !== "completado") return (
    <div className="p-6 text-center">
      <p>Este mantenimiento no está completado aún.</p>
      <button onClick={() => navigate("/mantenimiento")} className="border px-4 py-2 rounded mt-4">
        Volver
      </button>
    </div>
  );

  const { data: d } = report;

  const handlePrint = () => {
    const cliente = (d.cliente       || "cliente").replace(/\s+/g, "-");
    const pedido  = (d.pedidoDemanda || "pedido").replace(/\s+/g, "");
    const codigo  = (d.codInf        || "000").replace(/\s+/g, "");
    printPdf("pdf-content", `${variantConfig.filePrefix}_${cliente}_${pedido}_${codigo}_ASTAP`);
  };

  const estadoEquipoImagenes = d?.estadoEquipo?.imagenes || [];

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
                ["CLIENTE",             d.cliente],
                ["DIRECCIÓN",           d.direccion],
                ["CONTACTO",            d.contacto],
                ["TELÉFONO",            d.telefono],
                ["CORREO",              d.correo],
                ["TÉCNICO RESPONSABLE", d.tecnicoNombre],
                ["TELÉFONO TÉCNICO",    d.tecnicoTelefono],
                ["CORREO TÉCNICO",      d.tecnicoCorreo],
                ["FECHA DE SERVICIO",   d.fechaServicio],
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
          <p style={S.sectionTitle}>DESCRIPCIÓN DEL EQUIPO</p>
          <table style={S.tbl}>
            <tbody>
              {[
                ["NOTA",         d.equipo?.nota],
                ["MARCA",        d.equipo?.marca],
                ["MODELO",       d.equipo?.modelo],
                ["N° SERIE",     d.equipo?.serie],
                ["AÑO MODELO",   d.equipo?.anio],
                ["VIN / CHASIS", d.equipo?.vin],
                ["PLACA",        d.equipo?.placa],
                ["HORAS MÓDULO", d.equipo?.horasModulo],
                ["HORAS CHASIS", d.equipo?.horasChasis],
                ["KILOMETRAJE",  d.equipo?.kilometraje],
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
            estadoEquipoImagenes.map((img, i) => (
              <div
                key={img.id || i}
                className="no-break"
                style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", marginTop: 10, breakInside: "avoid", pageBreakInside: "avoid" }}
              >
                <div style={{ padding: "5px 10px", borderBottom: "1px solid #d1d5db", fontSize: 10, fontWeight: 700, background: "#f9fafb" }}>
                  Fotografía {i + 1}
                </div>
                <div style={{ padding: 10 }}>
                  <PdfEquipmentImageFrame src={img.url} alt={`estado-${i + 1}`} points={img.puntos} />
                  {(img.puntos || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {img.puntos.map((p, pi) => (
                        <div key={p.id || pi} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 10 }}>
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

        {/* ── SECCIONES DE MANTENIMIENTO ── */}
        {variantConfig.sections.map((sec, i) => (
          (sec.tipo !== "otros" || (d.extras || []).length > 0) && <div key={i}>
            <p style={{ ...S.sectionTitle, marginTop: i === 0 ? 0 : 14 }}>{sec.titulo}</p>
            <SeccionTable sec={sec} items={d.items} extras={d.extras || []} />
          </div>
        ))}

        {/* ── NOTA FINAL ── */}
        {d.notaFinal && (
          <div className="no-break">
            <p style={S.sectionTitle}>NOTA FINAL TECNICA DEL MANTENIMIENTO</p>
            <table style={S.tbl}>
              <tbody>
                <tr>
                  <td style={{ ...S.cell, whiteSpace: "pre-wrap", minHeight: 60 }}>
                    {d.notaFinal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

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
                <td style={{ ...S.cell, height: 85, textAlign: "center", verticalAlign: "middle", padding: "6px 8px" }}>
                  <div style={{ height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.firmas?.tecnico ? (
                      <img
                        src={d.firmas.tecnico}
                        alt="Firma técnico"
                        style={{
                          maxHeight: 34, width: "auto", maxWidth: 160,
                          objectFit: "contain", display: "block",
                          filter: "contrast(1.05)",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                    {d.tecnicoNombre || "—"}
                  </div>
                </td>

                {/* CLIENTE */}
                <td style={{ ...S.cell, height: 85, textAlign: "center", verticalAlign: "middle", padding: "6px 8px" }}>
                  <div style={{ height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.firmas?.cliente ? (
                      <img
                        src={d.firmas.cliente}
                        alt="Firma cliente"
                        style={{
                          maxHeight: 34, width: "auto", maxWidth: 160,
                          objectFit: "contain", display: "block",
                          filter: "contrast(1.05)",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
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
        <button onClick={() => navigate("/mantenimiento")} className="border px-6 py-2 rounded">
          Volver
        </button>
        <button onClick={handlePrint} className="bg-green-600 text-white px-6 py-2 rounded">
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
