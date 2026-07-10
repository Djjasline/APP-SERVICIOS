import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { printPdf } from "@/utils/printPdf";
import {
  CHECKLIST_SECCIONES,
  EPP_ITEMS,
  ESPECIFICACIONES,
  HERRAMIENTAS,
  INSUMOS,
  INSTRUCCIONES_OPERACION,
  PROTOCOLO_VCAM_INFO,
  PRUEBAS_FINALES,
  PRUEBAS_PREVIAS,
  REPUESTOS_USADOS,
  RIESGO_ITEMS,
  SEGURIDAD_ITEMS,
} from "./protocoloVCamData";

const PROTOCOL_SUBTIPO = "camara-vcam6";

const S = {
  tbl: { width: "100%", borderCollapse: "collapse", fontSize: 10 },
  cell: { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10 },
  label: { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10, fontWeight: 700, backgroundColor: "#f3f4f6", width: "28%" },
  th: { border: "1px solid #374151", padding: "4px 6px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 800, textAlign: "center", textTransform: "uppercase", padding: "5px 6px", backgroundColor: "#1e3a5f", color: "#fff", margin: "10px 0 0 0", border: "1px solid #1e3a5f" },
};

function BoolList({ items, values }) {
  return (
    <table style={S.tbl}>
      <tbody>{items.map(([key, label]) => <tr key={key}><td style={S.cell}>{label}</td><td style={{ ...S.cell, textAlign: "center", width: 45, fontWeight: 700 }}>{values?.[key] ? "X" : ""}</td></tr>)}</tbody>
    </table>
  );
}

function StatusCell({ current, value }) {
  return <td style={{ ...S.cell, textAlign: "center", width: 42, fontWeight: 700 }}>{current === value ? "X" : ""}</td>;
}

function StatusTable({ items, values, includeCantidad = false }) {
  return (
    <table style={S.tbl}>
      <thead><tr><th style={{ ...S.th, width: 55 }}>Ítem</th><th style={S.th}>Detalle</th>{includeCantidad && <th style={{ ...S.th, width: 58 }}>Cant.</th>}<th style={{ ...S.th, width: 42 }}>C</th><th style={{ ...S.th, width: 42 }}>NC</th><th style={{ ...S.th, width: 42 }}>N/A</th><th style={S.th}>Observación</th></tr></thead>
      <tbody>
        {items.map(([codigo, detalle]) => {
          const item = values?.[codigo] || {};
          return (
            <tr key={codigo}>
              <td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{codigo}</td>
              <td style={S.cell}>{detalle}</td>
              {includeCantidad && <td style={{ ...S.cell, textAlign: "center" }}>{item.cantidad || "-"}</td>}
              <StatusCell current={item.estado} value="cumple" />
              <StatusCell current={item.estado} value="noCumple" />
              <StatusCell current={item.estado} value="na" />
              <td style={S.cell}>{item.observacion || "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ProtocoloVCamPDF({ allowDownload = true, backPath = "/vehiculos/protocolos" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("area", "vehiculos")
        .eq("tipo", "protocolo")
        .eq("subtipo", PROTOCOL_SUBTIPO)
        .maybeSingle();

      if (error || !data) {
        console.error("Error cargando protocolo VCAM:", error);
        return;
      }

      setRecord(data);
    };

    load();
  }, [id]);

  if (!record) return <div className="p-6 text-center"><p>No se encontró el protocolo VCAM.</p><button onClick={() => navigate(backPath)} className="border px-4 py-2 rounded mt-4">Volver</button></div>;
  if (record.estado !== "completado") return <div className="p-6 text-center"><p>Este protocolo no está completado.</p><button onClick={() => navigate(backPath)} className="border px-4 py-2 rounded mt-4">Volver</button></div>;

  const d = record.data || {};
  const handlePrint = () => {
    if (!allowDownload) {
      alert("No tienes permiso para descargar este protocolo.");
      return;
    }

    const cliente = (d.cliente || "cliente").replace(/\s+/g, "-");
    const codigo = (d.codInf || record.id).replace(/\s+/g, "");
    printPdf("pdf-content", `Protocolo_VCAM_${cliente}_${codigo}_ASTAP`);
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "24px 16px" }}>
      <div className="no-print" style={{ maxWidth: 794, margin: "0 auto 12px auto", display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button onClick={() => navigate(backPath)} className="border px-4 py-2 rounded bg-white text-sm">Volver</button>
        {allowDownload && <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded text-sm">Descargar / imprimir PDF</button>}
      </div>

      <div id="pdf-content" style={{ maxWidth: 794, margin: "0 auto", background: "#fff", padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.12)", borderRadius: 6 }}>
        <div className="no-break">
          <table style={S.tbl}><tbody>
            <tr>
              <td rowSpan={5} style={{ ...S.cell, width: 130, textAlign: "center" }}><img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 65, margin: "0 auto", display: "block" }} /></td>
              <td colSpan={2} style={{ ...S.cell, textAlign: "center", fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}><div>{PROTOCOLO_VCAM_INFO.titulo}</div><div style={{ marginTop: 3, fontSize: 8.5, fontWeight: 400, lineHeight: 1.25, textTransform: "none" }}>{PROTOCOLO_VCAM_INFO.descripcion}</div></td>
              <td style={{ ...S.cell, width: 150 }}><div>Código: <strong>{PROTOCOLO_VCAM_INFO.codigo}</strong></div><div>Versión: <strong>{PROTOCOLO_VCAM_INFO.version}</strong></div></td>
            </tr>
            {[["REFERENCIA CONTRATO", d.referenciaContrato], ["N° DE PEDIDO / DEMANDA", d.pedidoDemanda], ["DESCRIPCIÓN", d.descripcion], ["CÓDIGO DEL INFORME", d.codInf]].map(([label, value]) => <tr key={label}><td style={{ ...S.label, width: "24%" }}>{label}</td><td colSpan={2} style={S.cell}>{value || "-"}</td></tr>)}
          </tbody></table>
        </div>

        <div className="no-break">
          <p style={S.sectionTitle}>1. Datos generales del equipo</p>
          <table style={S.tbl}><tbody>
            {[["CLIENTE", d.cliente], ["EQUIPO No.", d.equipoNo], ["MODELO", d.modelo], ["SERIE MÓDULO", d.serieModulo], ["SERIE CARRETE", d.serieCarrete], ["SERIE CABEZAL", d.serieCabezal], ["LONGITUD CABLE", d.longitudCable], ["VERSIÓN SOFTWARE", d.versionSoftware], ["ACCESORIOS", d.accesorios], ["TÉCNICO RESPONSABLE", d.tecnicoNombre], ["CORREO TÉCNICO", d.tecnicoCorreo]].map(([label, value]) => <tr key={label}><td style={S.label}>{label}</td><td style={S.cell}>{value || "-"}</td></tr>)}
          </tbody></table>
        </div>

        <div className="no-break">
          <p style={S.sectionTitle}>2. Seguridad, EPP y riesgos</p>
          <table style={S.tbl}><tbody><tr>
            <td style={{ ...S.cell, width: "33%", verticalAlign: "top" }}><strong>Seguridad</strong><BoolList items={SEGURIDAD_ITEMS} values={d.seguridad} /></td>
            <td style={{ ...S.cell, width: "33%", verticalAlign: "top" }}><strong>EPP</strong><BoolList items={EPP_ITEMS} values={d.epp} /></td>
            <td style={{ ...S.cell, width: "34%", verticalAlign: "top" }}><strong>Riesgos</strong><BoolList items={RIESGO_ITEMS} values={d.riesgos} /></td>
          </tr></tbody></table>
        </div>

        <div className="no-break"><p style={S.sectionTitle}>Pruebas de encendido previas al servicio</p><StatusTable items={PRUEBAS_PREVIAS} values={d.pruebasPrevias} /></div>
        <div className="no-break"><p style={S.sectionTitle}>Repuestos usados</p><StatusTable items={REPUESTOS_USADOS} values={d.repuestos} includeCantidad /></div>

        <div className="no-break">
          <p style={S.sectionTitle}>Herramientas e instrucciones operativas</p>
          <table style={S.tbl}><tbody><tr>
            <td style={{ ...S.cell, width: "50%", verticalAlign: "top" }}><strong>Herramientas requeridas</strong><ul style={{ margin: "6px 0 0 18px", padding: 0 }}>{HERRAMIENTAS.map((item) => <li key={item}>{item}</li>)}</ul></td>
            <td style={{ ...S.cell, width: "50%", verticalAlign: "top" }}><strong>Instrucciones operativas</strong><ol style={{ margin: "6px 0 0 18px", padding: 0 }}>{INSTRUCCIONES_OPERACION.map((item) => <li key={item}>{item}</li>)}</ol></td>
          </tr></tbody></table>
        </div>

        <p style={S.sectionTitle}>3. Checklist de mantenimiento VCAM</p>
        {CHECKLIST_SECCIONES.map((section) => (
          <div key={section.titulo} className="no-break">
            <p style={{ ...S.sectionTitle, marginTop: 6, fontSize: 10 }}>{section.titulo}</p>
            {section.imagenReferencia && <div style={{ border: "1px solid #374151", borderTop: 0, padding: 6, textAlign: "center" }}><div style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>IMAGEN DE REFERENCIA FIJA DEL PROTOCOLO</div><img src={section.imagenReferencia} alt={`Imagen de referencia ${section.titulo}`} style={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain" }} /></div>}
            <table style={S.tbl}>
              <thead><tr><th style={{ ...S.th, width: 45 }}>No.</th><th style={S.th}>Sistema / componente</th><th style={S.th}>Actividad</th><th style={{ ...S.th, width: 42 }}>C</th><th style={{ ...S.th, width: 42 }}>NC</th><th style={{ ...S.th, width: 42 }}>N/A</th><th style={S.th}>Observación</th></tr></thead>
              <tbody>{section.items.map(([codigo, componente, actividad]) => { const item = d.checklist?.[codigo] || {}; return <tr key={codigo}><td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{codigo}</td><td style={S.cell}>{componente}</td><td style={S.cell}>{actividad}</td><StatusCell current={item.estado} value="cumple" /><StatusCell current={item.estado} value="noCumple" /><StatusCell current={item.estado} value="na" /><td style={S.cell}>{item.observacion || "-"}</td></tr>; })}</tbody>
            </table>
          </div>
        ))}

        <div className="no-break"><p style={S.sectionTitle}>4. Pruebas finales</p><BoolList items={PRUEBAS_FINALES} values={d.pruebasFinales} /></div>
        <div className="no-break"><p style={S.sectionTitle}>5. Resultado general</p><table style={S.tbl}><tbody><tr><td style={S.label}>RESULTADO</td><td style={S.cell}>{d.resultadoGeneral === "cumple" ? "Cumple" : d.resultadoGeneral === "noCumple" ? "No cumple" : d.resultadoGeneral === "na" ? "N/A" : "-"}</td></tr><tr><td style={S.label}>OBSERVACIONES GENERALES</td><td style={S.cell}>{d.observacionesGenerales || "-"}</td></tr></tbody></table></div>

        <div className="no-break">
          <p style={S.sectionTitle}>Insumos y especificaciones de referencia</p>
          <table style={S.tbl}><tbody><tr>
            <td style={{ ...S.cell, width: "50%", verticalAlign: "top" }}><strong>Insumos</strong><ul style={{ margin: "6px 0 0 18px", padding: 0 }}>{INSUMOS.map((item) => <li key={item}>{item}</li>)}</ul></td>
            <td style={{ ...S.cell, width: "50%", verticalAlign: "top" }}><strong>Especificaciones</strong><table style={{ ...S.tbl, marginTop: 6 }}><tbody>{ESPECIFICACIONES.map(([label, value]) => <tr key={label}><td style={S.label}>{label}</td><td style={S.cell}>{value}</td></tr>)}</tbody></table></td>
          </tr></tbody></table>
        </div>

        <div className="no-break"><p style={S.sectionTitle}>6. Registro y aprobación</p><table style={S.tbl}><tbody>{[["FECHA", d.aprobacion?.fecha], ["PRÓXIMO MANTENIMIENTO", d.aprobacion?.proximoMantenimiento], ["TÉCNICO RESPONSABLE", d.aprobacion?.tecnicoResponsable || d.tecnicoNombre], ["FIRMA", d.aprobacion?.firma || d.tecnicoFirma]].map(([label, value]) => <tr key={label}><td style={S.label}>{label}</td><td style={S.cell}>{value || "-"}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
