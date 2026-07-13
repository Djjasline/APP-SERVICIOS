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
  label: { border: "1px solid #374151", padding: "5px 8px", verticalAlign: "middle", fontSize: 11, fontWeight: 700, backgroundColor: "#f3f4f6", whiteSpace: "nowrap", width: "35%" },
  th:    { border: "1px solid #374151", padding: "4px 6px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", textTransform: "uppercase", fontSize: 11 },
  thSI:  { border: "1px solid #374151", padding: "6px 4px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10, width: 36 },
  sectionTitle: {
    fontSize: 11, fontWeight: 800, textAlign: "center", textTransform: "uppercase",
    letterSpacing: "0.5px", padding: "5px 6px", backgroundColor: "#1e3a5f",
    color: "#fff", margin: "10px 0 0 0", border: "1px solid #1e3a5f",
  },
};

const maintenanceDescription =
  "Mantenimiento preventivo del módulo de hidrosuccionador, no incluye servicios de chasis.";

/* ══════════════════════════════
   SECCIONES — ESPEJO EXACTO DEL FORM
══════════════════════════════ */
const secciones = [
  {
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO HIDROSUCCIONADOR",
    tipo: "cantidad",
    items: [
      ["2.1",  "Tapón de expansión PN 45731-30"],
      ["2.2",  "Empaque externo tapa filtro en Y 3\" PN 41272-30"],
      ["2.3",  "Empaque externo tapa filtro en Y 3\" New Model PN 513726A-30"],
      ["2.4",  "Empaque interno tapa filtro en Y 3\" New Model PN 513726B-31"],
      ["2.5",  "Empaque interno tapa filtro en Y 3\" PN 41271-30"],
      ["2.6",  "Empaque filtro de agua Y 2\" PN 46137-30"],
      ["2.7",  "Empaque filtro de agua Y 2\" PN 46138-30"],
      ["2.8",  "Malla filtro de agua 2\" PN 45803-30"],
      ["2.9",  "O-Ring válvula check 2\" PN 29674-30"],
      ["2.10", "O-Ring válvula check 3\" PN 29640-30"],
      ["2.11", "Malla filtro de agua 3\" PN 41280-30"],
      ["2.12", "Filtro aceite hidráulico cartucho New Model PN 514335-30"],
      ["2.13", "Filtro aceite hidráulico cartucho PN 1099061"],
      ["2.14", "Aceite caja transferencia 80W90 (galones)"],
      ["2.15", "Aceite soplador ISO 220 (galones)"],
      ["2.16", "Aceite hidráulico AW 46 (galones)"],
    ],
  },
  {
    titulo: "3. SERVICIOS DE MÓDULO HIDROSUCCIONADOR",
    tipo: "simple",
    items: [
      ["3.1", "Sistema de diálisis para limpieza de impurezas del sistema hidráulico"],
      ["3.2", "Limpieza de bomba Rodder y cambio de elementos"],
      ["3.3", "Inspección válvula paso de agua a bomba Rodder"],
    ],
  },
  {
  titulo: "4. OTROS (ESPECIFICAR)",
  tipo: "otros",
},
  {
    titulo: "5. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POSTERIOR AL SERVICIO",
    tipo: "simple",
    items: [
      ["5.1", "Encendido general del equipo"],
      ["5.2", "Verificación de presiones de trabajo"],
      ["5.3", "Funcionamiento de sistemas hidráulicos"],
      ["5.4", "Funcionamiento de sistema de succión"],
      ["5.5", "Funcionamiento de sistema de agua"],
    ],
  },
];

/* ── TABLA DE SECCIÓN ── */
function SeccionTable({ sec, items, extras = [] }) {
  const esOtros = sec.tipo === "otros";
  const esCantidad = sec.tipo === "cantidad";

  const filas = esOtros
    ? extras.map((extra) => ({
        codigo: extra.item,
        texto: extra.detalle || "—",
        item: {
          estado: extra.estado,
          observacion: extra.observacion,
          imagenes: extra.imagenes,
        },
      }))
    : sec.items
        .map((it) => {
          const codigo = Array.isArray(it) ? it[0] : it;
          const texto = Array.isArray(it) ? it[1] : "";
          const item = items?.[codigo] || {};

          return { codigo, texto, item };
        })
        .filter(Boolean);

  if (esOtros && filas.length === 0) return null;

  return (
    <table style={S.tbl}>
      <thead>
        <tr>
          <th style={{ ...S.th, width: 50, textAlign: "left" }}>ÍTEM</th>
          <th style={{ ...S.th, textAlign: "left" }}>DETALLE</th>
          {esCantidad && <th style={{ ...S.th, width: 70 }}>CANT.</th>}
          <th style={S.thSI}>SI</th>
          <th style={S.thSI}>NO</th>
          <th style={{ ...S.th, textAlign: "left" }}>OBSERVACIÓN</th>
        </tr>
      </thead>

      <tbody>
        {filas.map(({ codigo, texto, item }) => {
          const esSI = item.estado === "SI";
          const esNO = item.estado === "NO";

          return (
            <tr key={codigo}>
              <td style={{ ...S.cell, fontWeight: 700 }}>{codigo}</td>
              <td style={S.cell}>{texto || "—"}</td>

              {esCantidad && (
                <td style={{ ...S.cell, textAlign: "center" }}>
                  {item.cantidad || "—"}
                </td>
              )}

              <td
                style={{
                  ...S.cell,
                  textAlign: "center",
                  backgroundColor: esSI ? "#dcfce7" : "#fff",
                  fontWeight: esSI ? 700 : 400,
                }}
              >
                {esSI ? "✓" : ""}
              </td>

              <td
                style={{
                  ...S.cell,
                  textAlign: "center",
                  backgroundColor: esNO ? "#fee2e2" : "#fff",
                  fontWeight: esNO ? 700 : 400,
                }}
              >
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
export default function MantenimientoHidroPDF() {
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
  .eq("subtipo", "hidro")
  .single();
       
      if (error || !data) { console.error(error); return; }
      setReport({ id: data.id, estado: data.estado, data: data.data, createdAt: data.created_at });
    };
    load();
  }, [id]);

  if (!report) return (
    <div className="p-6 text-center">
      <p>No se encontró el mantenimiento.</p>
      <button onClick={() => navigate("/mantenimiento")} className="btn-volver-orange mt-4">
        Volver
      </button>
    </div>
  );

  if (report.estado !== "completado") return (
    <div className="p-6 text-center">
      <p>Este mantenimiento no está completado aún.</p>
      <button onClick={() => navigate("/mantenimiento")} className="btn-volver-orange mt-4">
        Volver
      </button>
    </div>
  );

  const { data: d } = report;

  const handlePrint = () => {
    const cliente = (d.cliente        || "cliente").replace(/\s+/g, "-");
    const pedido  = (d.pedidoDemanda  || "pedido").replace(/\s+/g, "");
    const codigo  = (d.codInf         || "000").replace(/\s+/g, "");
    printPdf("pdf-content", `Mantenimiento_Hidro_${cliente}_${pedido}_${codigo}_ASTAP`);
  };

  const estadoEquipoImagenes = d?.estadoEquipo?.imagenes || [];

  return (
  <>
    <style>{`
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
      }
    `}</style>

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
                  <div>INFORME DE MANTENIMIENTO HIDROSUCCIONADOR</div>
                  <div style={{ marginTop: 3, fontSize: 8.5, fontWeight: 400, lineHeight: 1.25, textTransform: "none" }}>
                    {maintenanceDescription}
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
                <div style={{ padding: "5px 10px", borderBottom: "1px solid #d1d5db", fontSize: 11, fontWeight: 700, background: "#f9fafb" }}>
                  Fotografía {i + 1}
                </div>
                <div style={{ padding: 10 }}>
                  <PdfEquipmentImageFrame src={img.url} alt={`estado-${i + 1}`} points={img.puntos} />

                  {(img.puntos || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {img.puntos.map((p, pi) => (
                        <div key={p.id || pi} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11 }}>
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
{secciones.map((sec, i) => {
          // Para "otros": si ningún ítem tiene datos, omitir sección entera
          if (sec.tipo === "otros" && !(d.extras || []).length) {
  return null;
}
          return (
            <div key={i}>
              <p style={{ ...S.sectionTitle, marginTop: i === 0 ? 0 : 10 }}>{sec.titulo}</p>
              <SeccionTable
  sec={sec}
  items={d.items}
  extras={d.extras || []}
/>
            </div>
          );
        })}

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
                <td style={{ ...S.cell, height: 95, textAlign: "center", verticalAlign: "middle", padding: "4px 6px" }}>
                  <div style={{ height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.firmas?.tecnico ? (
                      <img
                        src={d.firmas.tecnico}
                        alt="Firma técnico"
                        style={{
  maxHeight: 52,
  width: "100%",
  maxWidth: 180,
  objectFit: "contain",
  display: "block",
  filter: "contrast(1.1)",
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
                <td style={{ ...S.cell, height: 95, textAlign: "center", verticalAlign: "middle", padding: "4px 6px" }}>
                  <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.firmas?.cliente ? (
                      <img
                        src={d.firmas.cliente}
                        alt="Firma cliente"
                        style={{
                          maxHeight: 34,
                          width: "auto",
                          maxWidth: 140,
                          objectFit: "contain",
                          display: "block",
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
        <button onClick={() => navigate("/mantenimiento")} className="btn-volver-orange px-6">
          Volver
        </button>
        <button onClick={handlePrint} className="bg-green-600 text-white px-6 py-2 rounded">
          Descargar PDF
        </button>
      </div>
    </div>
</>
);
}
