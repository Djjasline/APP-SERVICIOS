import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { printPdf } from "@/utils/printPdf";

const S = {
  tbl:   { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  cell:  { border: "1px solid #374151", padding: "5px 8px", verticalAlign: "middle", fontSize: 11 },
  label: { border: "1px solid #374151", padding: "5px 8px", verticalAlign: "middle", fontSize: 11, fontWeight: 700, backgroundColor: "#f3f4f6", whiteSpace: "nowrap", width: "35%" },
  th:    { border: "1px solid #374151", padding: "6px 8px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", textTransform: "uppercase", fontSize: 11 },
  thSI:  { border: "1px solid #374151", padding: "6px 4px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10, width: 36 },
  sectionTitle: { fontSize: 12, fontWeight: 800, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px", backgroundColor: "#1e3a5f", color: "#fff", margin: "14px 0 0 0", border: "1px solid #1e3a5f" },
};

const estadoColor = { SI: "#dcfce7", NO: "#fee2e2", NA: "#f3f4f6" };

function ChecklistTable({ items, data }) {
  return (
    <table style={S.tbl}>
      <thead>
        <tr>
          <th style={{ ...S.th, width: 50 }}>ÍTEM</th>
          <th style={{ ...S.th, textAlign: "left" }}>DESCRIPCIÓN</th>
          <th style={S.thSI}>SI</th><th style={S.thSI}>NO</th><th style={S.thSI}>N/A</th>
          <th style={{ ...S.th, textAlign: "left" }}>OBSERVACIÓN</th>
        </tr>
      </thead>
      <tbody>
        {items.map(([codigo, desc]) => {
          const estado = data?.items?.[codigo]?.estado || "";
          return (
            <tr key={codigo}>
              <td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{codigo}</td>
              <td style={S.cell}>{desc}</td>
              {["SI","NO","NA"].map((opt) => (
                <td key={opt} style={{ ...S.cell, textAlign: "center", backgroundColor: estado === opt ? estadoColor[opt] : "#fff", fontWeight: estado === opt ? 700 : 400 }}>{estado === opt ? "✓" : ""}</td>
              ))}
              <td style={S.cell}>{data?.items?.[codigo]?.observacion || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const pruebasPrevias = [["1.1","Encendido del sistema de cámara"],["1.2","Funcionamiento general del equipo"],["1.3","Verificación de conexiones y cables"]];
const secciones = [
  { titulo: "A) SISTEMA DE CÁMARA", items: [["A.1","Imagen clara y nítida en monitor"],["A.2","Iluminación LED de la cámara"],["A.3","Giro y movimiento del cabezal (pan / tilt)"],["A.4","Estado físico del cabezal (golpes / humedad)"],["A.5","Lente de la cámara — limpieza y estado"]] },
  { titulo: "B) CABLE Y CARRETE", items: [["B.1","Estado general del cable (cortes / rozaduras)"],["B.2","Funcionamiento del carrete (enrollado / desenrollado)"],["B.3","Contador de metros — funcionamiento"],["B.4","Codo giratorio del carrete"],["B.5","Seguros y trinquetes del carrete"]] },
  { titulo: "C) MONITOR Y GRABACIÓN", items: [["C.1","Visualización en monitor — calidad de imagen"],["C.2","Grabación de video — almacenamiento"],["C.3","Exportación de archivos (USB / SD)"],["C.4","Software de inspección — versión y funciones"],["C.5","Medición y anotación en pantalla"]] },
  { titulo: "D) SISTEMA ELÉCTRICO Y TRACTOR", items: [["D.1","Fuente de alimentación / batería"],["D.2","Conexiones eléctricas — estado"],["D.3","Tractor / ruedas de arrastre — estado"],["D.4","Control remoto del tractor"],["D.5","Luces adicionales del equipo"]] },
];

export default function InspeccionCamaraPDF() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
  .from("registros")
  .select("*")
  .eq("id", id)
  .eq("area", "vehiculos")
  .eq("tipo", "inspeccion")
  .eq("subtipo", "camara")
  .single();
      if (error || !data) { console.error(error); return; }
      setReport({ estado: data.estado, data: data.data });
    };
    load();
  }, [id]);

  if (!report) return (<div className="p-6 text-center"><p>No se encontró la inspección.</p><button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded mt-4">Volver</button></div>);
  if (report.estado !== "completado") return (<div className="p-6 text-center"><p>Esta inspección no está completada.</p><button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded mt-4">Volver</button></div>);

  const { data: d } = report;
  const handlePrint = () => { const cliente = (d.cliente||"cliente").replace(/\s+/g,"-"); const pedido = (d.pedidoDemanda||"pedido").replace(/\s+/g,""); const codigo = (d.codInf||"000").replace(/\s+/g,""); printPdf("pdf-content", `Inspeccion_Camara_${cliente}_${pedido}_${codigo}_ASTAP`); };
  const estadoEquipoImagenes = d?.estadoEquipo?.imagenes || [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "24px 16px" }}>
      <div id="pdf-content" style={{ maxWidth: 794, margin: "0 auto", background: "#fff", padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.12)", borderRadius: 6 }}>

        <div className="no-break">
          <table style={S.tbl}><tbody>
            <tr>
              <td rowSpan={5} style={{ ...S.cell, width: 130, textAlign: "center" }}><img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 65, margin: "0 auto", display: "block" }} /></td>
              <td colSpan={2} style={{ ...S.cell, textAlign: "center", fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>HOJA DE INSPECCIÓN CÁMARA V-CAM6</td>
              <td style={{ ...S.cell, width: 170 }}><div>Fecha versión: <strong>01-01-26</strong></div><div>Versión: <strong>01</strong></div></td>
            </tr>
            {[["REFERENCIA CONTRATO",d.referenciaContrato],["PEDIDO / DEMANDA",d.pedidoDemanda],["DESCRIPCIÓN",d.descripcion],["COD. INF.",d.codInf]].map(([l,v],i)=>(<tr key={i}><td style={{ ...S.label, width:"25%" }}>{l}</td><td colSpan={2} style={S.cell}>{v||"—"}</td></tr>))}
          </tbody></table>
        </div>

        <div className="no-break">
          <p style={S.sectionTitle}>DATOS DEL SERVICIO</p>
          <table style={S.tbl}><tbody>
            {[["CLIENTE",d.cliente],["DIRECCIÓN",d.direccion],["CONTACTO",d.contacto],["TELÉFONO",d.telefono],["CORREO",d.correo],["TÉCNICO RESPONSABLE",d.tecnicoNombre],["TELÉFONO TÉCNICO",d.tecnicoTelefono],["CORREO TÉCNICO",d.tecnicoCorreo],["FECHA DE SERVICIO",d.fechaServicio]].map(([l,v],i)=>(<tr key={i}><td style={S.label}>{l}</td><td style={S.cell}>{v||"—"}</td></tr>))}
          </tbody></table>
        </div>

        <div className="no-break">
          <p style={S.sectionTitle}>DESCRIPCIÓN DEL EQUIPO</p>
          <table style={S.tbl}><tbody>
            {[["NOTA",d.equipo?.nota],["MARCA",d.equipo?.marca],["MODELO",d.equipo?.modelo],["N° SERIE",d.equipo?.serie],["AÑO MODELO",d.equipo?.anio],["VIN / CHASIS",d.equipo?.vin],["PLACA",d.equipo?.placa],["HORAS MÓDULO",d.equipo?.horasModulo],["HORAS CHASIS",d.equipo?.horasChasis],["KILOMETRAJE",d.equipo?.kilometraje]].map(([l,v],i)=>(<tr key={i}><td style={S.label}>{l}</td><td style={S.cell}>{v||"—"}</td></tr>))}
          </tbody></table>
        </div>

        <div className="no-break">
          <p style={S.sectionTitle}>ESTADO DEL EQUIPO</p>
          {estadoEquipoImagenes.length === 0 ? (
            <table style={S.tbl}><tbody><tr><td style={{ ...S.cell, textAlign:"center", color:"#6b7280", padding:20 }}>Sin registros de estado del equipo</td></tr></tbody></table>
          ) : estadoEquipoImagenes.map((img, i) => (
            <div key={img.id||i} className="no-break" style={{ border:"1px solid #d1d5db", borderRadius:6, overflow:"hidden", marginTop:10 }}>
              <div style={{ padding:"5px 10px", borderBottom:"1px solid #d1d5db", fontSize:11, fontWeight:700, background:"#f9fafb" }}>Imagen {i+1}</div>
              <div style={{ padding:10 }}>
                <div style={{ position:"relative", width:"100%", border:"1px solid #d1d5db", borderRadius:4, overflow:"hidden" }}>
                  <img src={img.url} alt={`estado-${i+1}`} style={{ width:"100%", maxHeight:350, objectFit:"contain", display:"block" }} />
                  {(img.puntos||[]).map((p,pi)=>(<div key={p.id||pi} style={{ position:"absolute", left:`${p.x*100}%`, top:`${p.y*100}%`, transform:"translate(-50%,-50%)", width:18, height:18, borderRadius:"50%", background:"#dc2626", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", fontWeight:700 }}>{pi+1}</div>))}
                </div>
                {(img.puntos||[]).length > 0 && <div style={{ marginTop:8 }}>{img.puntos.map((p,pi)=>(<div key={p.id||pi} style={{ display:"flex", gap:8, marginBottom:4, fontSize:11 }}><span style={{ minWidth:22, fontWeight:700 }}>{pi+1})</span><span>{p.observacion||"—"}</span></div>))}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="page-break" />
        <p style={{ ...S.sectionTitle, marginTop:0 }}>1. PRUEBAS PREVIAS AL SERVICIO</p>
        <ChecklistTable items={pruebasPrevias} data={d} />

        {secciones.map((sec, i) => (
          <div key={i} className="no-break">
            <p style={S.sectionTitle}>{sec.titulo}</p>
            <ChecklistTable items={sec.items} data={d} />
          </div>
        ))}

        <div className="no-break">
          <table style={{ ...S.tbl, marginTop:14 }}>
            <thead><tr><th colSpan={2} style={S.th}>CONCLUSIONES</th><th colSpan={2} style={S.th}>RECOMENDACIONES</th></tr></thead>
            <tbody>{(d.conclusiones||[]).map((c,i)=>(<tr key={i} className="no-break"><td style={{ ...S.cell, width:28, textAlign:"center", fontWeight:700 }}>{i+1}</td><td style={{ ...S.cell, whiteSpace:"pre-wrap" }}>{c||"—"}</td><td style={{ ...S.cell, width:28, textAlign:"center", fontWeight:700 }}>{i+1}</td><td style={{ ...S.cell, whiteSpace:"pre-wrap" }}>{d.recomendaciones?.[i]||"—"}</td></tr>))}</tbody>
          </table>
        </div>

        <div className="no-break">
          <table style={{ ...S.tbl, marginTop:14 }}>
            <thead><tr><th style={S.th}>FIRMA TÉCNICO ASTAP</th><th style={S.th}>FIRMA CLIENTE</th></tr></thead>
            <tbody>
              <tr>
                <td style={{ ...S.cell, height:160, textAlign:"center", verticalAlign:"top", paddingTop:12 }}>
                  {d.firmas?.tecnico && <img src={d.firmas.tecnico} alt="Firma técnico" style={{ width:"100%", maxWidth:240, height:"auto", objectFit:"contain", margin:"0 auto", display:"block" }} />}
                  <div style={{ marginTop:10, fontSize:12, fontWeight:700 }}>{d.tecnicoNombre||"—"}</div>
                </td>
                <td style={{ ...S.cell, height:160, textAlign:"center", verticalAlign:"top", paddingTop:12 }}>
                  {d.firmas?.cliente && <img src={d.firmas.cliente} alt="Firma cliente" style={{ width:"100%", maxWidth:240, height:"auto", objectFit:"contain", margin:"0 auto", display:"block" }} />}
                  <div style={{ marginTop:10, fontSize:12, fontWeight:700 }}>{d.cliente||"—"}</div>
                  <div style={{ marginTop:4, fontSize:11 }}>Cédula: {d.firmas?.clienteCedula||"—"}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
      <div className="no-print" style={{ display:"flex", justifyContent:"space-between", maxWidth:794, margin:"24px auto 0" }}>
        <button onClick={() => navigate("/inspeccion")} className="border px-6 py-2 rounded">Volver</button>
        <button onClick={handlePrint} className="bg-green-600 text-white px-6 py-2 rounded">Descargar PDF</button>
      </div>
    </div>
  );
}
