import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { printPdf } from "@/utils/printPdf";
import { useAuth } from "@/context/AuthContext";
import { createEmptyVisitaCampoData } from "./visitaCampoData";
import { parseTableText } from "./tableUtils";

const S = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    margin: "0 auto",
    padding: "10mm",
    background: "#fff",
    color: "#111",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 11,
    lineHeight: 1.45,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  cell: { border: "1px solid #111", padding: 5, verticalAlign: "top" },
  headerCell: { border: "1px solid #111", padding: 5, fontWeight: 700, background: "#eee" },
};

function Header({ data }) {
  return (
    <table style={{ ...S.table, marginBottom: 8 }}>
      <tbody>
        <tr>
          <td rowSpan={3} style={{ ...S.cell, width: "24%", textAlign: "center", verticalAlign: "middle" }}>
            <img src="/astap-logo.jpg" alt="ASTAP" style={{ width: 88, maxHeight: 66, objectFit: "contain" }} />
          </td>
          <td rowSpan={3} style={{ ...S.cell, width: "46%", textAlign: "center", fontWeight: 700, verticalAlign: "middle" }}>
            <div style={{ fontSize: 13 }}>ASTAP CIA. LTDA.</div>
            <div style={{ fontStyle: "italic", marginTop: 4, fontSize: 12 }}>{data.titulo || "Informe técnico de visita en campo"}</div>
          </td>
          <td colSpan={2} style={{ ...S.cell, width: "30%", fontWeight: 700, textAlign: "center", fontSize: 13 }}>{data.codigoDocumento || "-"}</td>
        </tr>
        <tr>
          <td style={{ ...S.cell, width: "15%", fontWeight: 700, textAlign: "right" }}>No. Revisión</td>
          <td style={S.cell}>{data.revision || "-"}</td>
        </tr>
        <tr>
          <td style={{ ...S.cell, fontWeight: 700, textAlign: "right" }}>Fecha:</td>
          <td style={S.cell}>{data.fecha || "-"}</td>
        </tr>
      </tbody>
    </table>
  );
}

function ClientInfoTable({ data }) {
  return (
    <table style={{ ...S.table, marginBottom: 0 }}>
      <tbody>
        <tr>
          <td style={{ ...S.headerCell, width: "18%" }}>CLIENTE:</td>
          <td style={{ ...S.cell, width: "34%" }}>{data.cliente}</td>
          <td style={{ ...S.headerCell, width: "18%" }}>MODELOS:</td>
          <td style={{ ...S.cell, width: "30%" }}>{data.modelos}</td>
        </tr>
        <tr>
          <td style={S.headerCell}>UBICACIÓN:</td>
          <td colSpan={3} style={S.cell}>{data.ubicacion}</td>
        </tr>
        <tr>
          <td style={S.headerCell}>MARCA:</td>
          <td colSpan={3} style={S.cell}>{data.marca}</td>
        </tr>
      </tbody>
    </table>
  );
}

function SectionTitle({ children }) {
  return <div style={{ border: "1px solid #111", padding: 4, fontWeight: 700, textAlign: "center", background: "#eee", marginTop: 0 }}>{children}</div>;
}

function TextBlock({ children }) {
  return <div style={{ border: "1px solid #111", borderTop: 0, padding: 10, whiteSpace: "pre-line", textAlign: "justify" }}>{children}</div>;
}

function RenderTable({ text }) {
  const rows = parseTableText(text);
  if (rows.length === 0) return null;

  return (
    <table style={{ ...S.table, marginTop: 8 }}>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${row.join("-")}`}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} style={rowIndex === 0 ? S.headerCell : S.cell}>
                {cell || " "}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const getStationRowSpan = (rows, rowIndex) => {
  const station = rows[rowIndex]?.[0]?.trim();
  if (!station) {
    for (let i = rowIndex - 1; i >= 0; i -= 1) {
      if (rows[i]?.[0]?.trim()) return 0;
    }
    return 1;
  }
  if (rowIndex > 0) {
    let previousStation = "";
    for (let i = rowIndex - 1; i >= 0; i -= 1) {
      previousStation = rows[i]?.[0]?.trim();
      if (previousStation) break;
    }
    if (previousStation === station) return 0;
  }

  let span = 1;
  for (let i = rowIndex + 1; i < rows.length; i += 1) {
    const nextStation = rows[i]?.[0]?.trim();
    if (nextStation && nextStation !== station) break;
    span += 1;
  }

  return span;
};

function EquipmentSummaryTable({ intro, text }) {
  const rows = parseTableText(text);
  if (rows.length === 0) return null;

  const header = rows[0];
  const body = rows.slice(1);
  const widths = ["18%", "14%", "19%", "39%", "10%"];

  return (
    <table style={{ ...S.table, marginTop: 8, breakInside: "avoid", pageBreakInside: "avoid" }}>
      <tbody>
        <tr>
          <td colSpan={5} style={{ ...S.headerCell, textAlign: "center" }}>Tabla resumen de equipos centrífugos</td>
        </tr>
        {intro && (
          <tr>
            <td colSpan={5} style={{ ...S.cell, padding: 8, fontWeight: 600, textAlign: "justify", whiteSpace: "pre-line" }}>{intro}</td>
          </tr>
        )}
        <tr>
          {header.map((cell, index) => (
            <td key={index} style={{ ...S.headerCell, width: widths[index], textAlign: "center", textTransform: "uppercase" }}>{cell}</td>
          ))}
        </tr>
        {body.map((row, rowIndex) => {
          const stationSpan = getStationRowSpan(body, rowIndex);

          return (
            <tr key={`${rowIndex}-${row.join("-")}`}>
              {stationSpan > 0 && (
                <td rowSpan={stationSpan} style={{ ...S.cell, width: widths[0], textAlign: "center", fontWeight: 700, textTransform: "uppercase", verticalAlign: "middle" }}>
                  {row[0]}
                </td>
              )}
              {row.slice(1).map((cell, cellIndex) => (
                <td key={cellIndex} style={{ ...S.cell, width: widths[cellIndex + 1], textAlign: cellIndex === 2 ? "left" : "center", verticalAlign: "middle" }}>
                  {cell || " "}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PartsIntroBox({ text }) {
  return (
    <table style={{ ...S.table, marginTop: 8, breakInside: "avoid", pageBreakInside: "avoid" }}>
      <tbody>
        <tr>
          <td style={{ ...S.cell, padding: 4, textAlign: "center", fontWeight: 700 }}>
            Lista de partes recomendada por el fabricante- FLOWSERVE
          </td>
        </tr>
        <tr>
          <td style={{ ...S.cell, padding: "10px 28px", whiteSpace: "pre-line", textAlign: "justify", fontWeight: 600 }}>
            {text}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function RepuestoTable({ text }) {
  const rows = parseTableText(text);
  if (rows.length === 0) return null;

  const widths = ["7%", "35%", "11%", "19%", "20%", "8%"];

  return (
    <table style={{ ...S.table, marginTop: 6 }}>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${row.join("-")}`}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                style={{
                  ...(rowIndex === 0 ? S.headerCell : S.cell),
                  width: widths[cellIndex],
                  padding: 3,
                  fontSize: 9,
                  textAlign: cellIndex === 1 ? "left" : "center",
                  verticalAlign: "middle",
                  fontWeight: rowIndex === 0 ? 700 : 500,
                }}
              >
                {cell || " "}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IntervalosTable({ text }) {
  const rows = parseTableText(text);
  if (rows.length === 0) return null;

  const widths = ["24%", "38%", "38%"];

  return (
    <table style={{ ...S.table, marginTop: 8 }}>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${row.join("-")}`}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                style={{
                  ...(rowIndex === 0 ? S.headerCell : S.cell),
                  width: widths[cellIndex],
                  padding: 4,
                  fontSize: 9,
                  textAlign: "center",
                  verticalAlign: "middle",
                  whiteSpace: "pre-line",
                  fontWeight: rowIndex === 0 || cellIndex === 0 ? 700 : 600,
                }}
              >
                {cell || " "}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IntervalosBox({ intro, tableText, note }) {
  return (
    <div style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
      <div style={{ border: "1px solid #111", padding: 4, fontWeight: 700, textAlign: "center", textDecoration: "underline", marginTop: 8 }}>
        Tiempo mínimo para cambio de partes según normativa API 610 y ANSI B73.1
      </div>
      {intro && <div style={{ border: "1px solid #111", borderTop: 0, padding: 10, whiteSpace: "pre-line", textAlign: "justify", fontWeight: 600 }}>{intro}</div>}
      <IntervalosTable text={tableText} />
      {note && <div style={{ padding: "10px 14px", whiteSpace: "pre-line", textAlign: "justify", fontSize: 10, fontWeight: 600 }}>{note}</div>}
    </div>
  );
}

function SignatureBlock({ data }) {
  const signatures = [
    ["REALIZADO POR", data.realizadoPor, data.firmas?.realizado],
    ["REVISADO POR", data.revisadoPor, data.firmas?.revisado],
    ["RECIBIDO POR", data.recibidoPor, data.firmas?.recibido],
  ];

  return (
    <table style={{ ...S.table, marginTop: 28 }}>
      <tbody>
        <tr>
          {signatures.map(([label]) => (
            <td key={label} style={{ ...S.headerCell, textAlign: "center" }}>{label}</td>
          ))}
        </tr>
        <tr>
          {signatures.map(([label, , signature]) => (
            <td key={`${label}-firma`} style={{ ...S.cell, height: 78, textAlign: "center", verticalAlign: "middle", padding: 0 }}>
              {signature && <img src={signature} alt={`Firma ${label}`} style={{ maxWidth: "95%", maxHeight: 76, objectFit: "contain" }} />}
            </td>
          ))}
        </tr>
        <tr>
          {signatures.map(([label, value]) => (
            <td key={`${label}-texto`} style={{ ...S.cell, height: 58, whiteSpace: "pre-line", textAlign: "center", verticalAlign: "middle", fontWeight: 600 }}>
              {value}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
      {(items || []).map((item, index) => (
        <li key={index} style={{ marginBottom: 6, textAlign: "justify" }}>{item}</li>
      ))}
    </ul>
  );
}

export default function VisitaCampoPDF({ allowDownload = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      const { data, error } = await supabase.from("registros").select("*").eq("id", id).maybeSingle();
      if (error) console.error(error);
      if (data && !superAdminActivo && data.user_id !== user?.id) {
        setRecord(null);
      } else {
        setRecord(data || null);
      }
      setLoading(false);
    };

    loadRecord();
  }, [id, superAdminActivo, user?.id]);

  if (loading) return <div className="p-6 text-gray-500">Cargando PDF...</div>;
  if (!record) return <div className="p-6 text-center"><p>No se encontró el informe.</p><button onClick={() => navigate("/petroleo/visita-campo")} className="btn-volver-orange mt-4">Volver</button></div>;
  if (record.estado !== "completado" && allowDownload) return <div className="p-6 text-center"><p>Este informe aún no está completado.</p><button onClick={() => navigate(`/petroleo/visita-campo/${id}`)} className="btn-volver-orange mt-4">Volver</button></div>;

  const data = { ...createEmptyVisitaCampoData(), ...(record.data || {}) };

  return (
    <div className="bg-gray-100 p-4 text-gray-900">
      <div className="mx-auto mb-4 flex max-w-[210mm] justify-between gap-2 print:hidden">
        <button onClick={() => navigate("/petroleo/visita-campo")} className="btn-volver-orange">Volver</button>
        {allowDownload && (
          <button onClick={() => printPdf("visita-campo-pdf", `ASTAP_${data.codigoDocumento || record.id}_visita_campo`)} className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Descargar / imprimir PDF</button>
        )}
      </div>

      <div id="visita-campo-pdf" style={S.page}>
        <Header data={data} />
        <ClientInfoTable data={data} />

        <SectionTitle>Antecedentes</SectionTitle>
        <TextBlock>{data.antecedentes}</TextBlock>

        <SectionTitle>Objetivos de la asistencia en campo</SectionTitle>
        <div style={{ border: "1px solid #111", borderTop: 0, padding: 10 }}><BulletList items={data.objetivos} /></div>

        <Header data={data} />
        <SectionTitle>Descripción de actividades</SectionTitle>
        <div style={{ border: "1px solid #111", borderTop: 0, padding: 10 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>Lugar de ubicación del equipo.</strong>
            <p style={{ margin: "8px 0 0", whiteSpace: "pre-line", textAlign: "justify" }}>{data.descripcionLugar}</p>
          </div>

          {data.actividades.map((actividad, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <strong>{index + 1}. {actividad.titulo}:</strong>
              <p style={{ margin: "6px 0 0", whiteSpace: "pre-line", textAlign: "justify" }}>{actividad.detalle}</p>
            </div>
          ))}
        </div>

        <Header data={data} />
        <EquipmentSummaryTable intro={data.equiposIntro} text={data.equiposTabla} />

        <PartsIntroBox text={data.partesIntro} />

        {(data.repuestos || []).map((grupo, index) => (
          <div key={index} style={{ breakInside: "avoid", pageBreakInside: "avoid", marginTop: 12 }}>
            <Header data={data} />
            <h3 style={{ margin: "10px 0 6px", fontSize: 13 }}>{grupo.titulo}</h3>
            <RepuestoTable text={grupo.rows} />
            {grupo.caption && <p style={{ textAlign: "center", fontSize: 10, fontStyle: "italic" }}>{grupo.caption}</p>}
            {grupo.esquema && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <img src={grupo.esquema} alt={`Esquema ${grupo.titulo}`} style={{ maxWidth: "100%", maxHeight: 430, objectFit: "contain" }} />
              </div>
            )}
          </div>
        ))}

        <Header data={data} />
        <IntervalosBox intro={data.intervalosIntro} tableText={data.intervalosTabla} note={data.notaIntervalos} />

        <Header data={data} />
        <SectionTitle>Conclusiones</SectionTitle>
        <div style={{ border: "1px solid #111", borderTop: 0, padding: 10 }}><BulletList items={data.conclusiones} /></div>

        <SectionTitle>Recomendaciones</SectionTitle>
        <div style={{ border: "1px solid #111", borderTop: 0, padding: 10 }}><BulletList items={data.recomendaciones} /></div>

        <SignatureBlock data={data} />
      </div>
    </div>
  );
}
