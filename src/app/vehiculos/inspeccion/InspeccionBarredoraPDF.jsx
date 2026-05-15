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
          <th style={S.thSI}>SI</th>
          <th style={S.thSI}>NO</th>
          <th style={S.thSI}>N/A</th>
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

const pruebasPrevias = [
  ["1.1","Arranque y pruebas iniciales del equipo"],
  ["1.2","Funcionamiento general del sistema"],
  ["1.3","Revisión de alarmas o mensajes de fallo"],
];
const secciones = [
  { titulo: "A) SISTEMA DE BARRIDO", items: [["A.1","Estado de cepillos principales"],["A.2","Estado de cepillos laterales"],["A.3","Sistema de aspiración central"],["A.4","Toberas de agua / pulverización"],["A.5","Caucho de zapatas laterales"],["A.6","Caucho de zapata esquinera"],["A.7","Cadena banda transportadora"],["A.8","Piñón hidromotor banda transportadora"]] },
  { titulo: "B) SISTEMA HIDRÁULICO", items: [["B.1","Fugas hidráulicas (mangueras / acoples / bancos)"],["B.2","Nivel de aceite hidráulico"],["B.3","Filtro hidráulico — estado y presión"],["B.4","Cilindros hidráulicos (fugas o daños)"],["B.5","Bomba hidráulica — ruidos o vibraciones anormales"],["B.6","Tapones de drenaje"]] },
  { titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO", items: [["C.1","Tablero de control — funciones y visualización"],["C.2","Iluminación y señales de advertencia"],["C.3","Sensores y actuadores"],["C.4","Humedad en componentes eléctricos"]] },
  { titulo: "D) SISTEMA DE MOTOR Y CHASIS", items: [["D.1","Nivel de aceite de motor"],["D.2","Nivel de refrigerante"],["D.3","Revisión de correas y tensores"],["D.4","Revisión de filtros de aire"],["D.5","Estado de frenos"],["D.6","Estado de neumáticos"],["D.7","Estado de articulaciones y rotulas"]] },
];

export default function InspeccionBarredoraPDF() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("registros").select("*").eq("id", id).eq("tipo", "inspeccion").eq("subtipo", "barredora").single();
      if (error || !data) { console.error(error); return; }
      setReport({ id: data.id, estado: data.estado, data: data.data });
    };
    load();
  }, [id]);

  if (!report) return (<div className="p-6 text-center"><p>No se encontró la inspección.</p><button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded mt-4">Volver</button></div>);
  if (report.estado !== "completado") return (<div className="p-6 text-center"><p>Esta inspección no está completada.</p><button onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded mt-4">Volver</button></div>);

  const { data: d } = report;
  const handlePrint = () => { 
    const cliente = (d.cliente||"cliente").replace(/\s+/g,"-"); 
    const pedido = (d.pedidoDemanda||"pedido").replace(/\s+/g,""); 
    const codigo = (d.codInf||"000").replace(/\s+/g,""); 
    printPdf("pdf-content", `Inspeccion_Barredora_${cliente}_${pedido}_${codigo}_ASTAP`);
  };
  const estadoEquipoImagenes = d?.estadoEquipo?.imagenes || [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "24px 16px" }}>
      <div id="pdf-content" style={{ maxWidth: 794, margin: "0 auto", background: "#fff", padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.12)", borderRadius: 6 }}>

        {/* ENCABEZADO */}
        <div className="no-break">
          <table style={S.tbl}>
            <tbody>
            <tr>
              <td rowSpan={5} style={{ ...S.cell, width: 130, textAlign: "center" }}>
                <img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 65, margin: "0 auto", display: "block" }} />
              </td>
              <td colSpan={2} style={{ ...S.cell, textAlign: "center", fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>HOJA DE INSPECCIÓN BARREDORA</td>
              <td style={{ ...S.cell, width: 170 }}><div>Fecha versión: <strong>01-01-26</strong></div><div>Versión: <strong>01</strong></div></td>
            </tr>
            {[["REFERENCIA CONTRATO",d.referenciaContrato],["PEDIDO / DEMANDA",d.pedidoDemanda],["DESCRIPCIÓN",d.descripcion],["COD. INF.",d.codInf]].map(([l,v],i)=>(
              <tr key={i}><td style={{ ...S.label, width: "25%" }}>{l}</td><td colSpan={2} style={S.cell}>{v||"—"}</td></tr>
            ))}
          </tbody>
          </table>
        </div>

         {/* DATOS SERVICIO */}
        <div className="no-break">
          <p style={S.sectionTitle}>DATOS DEL SERVICIO</p>
          <table style={S.tbl}><tbody>
            {[["CLIENTE",d.cliente],["DIRECCIÓN",d.direccion],["CONTACTO",d.contacto],["TELÉFONO",d.telefono],["CORREO",d.correo],["TÉCNICO RESPONSABLE",d.tecnicoNombre],["TELÉFONO TÉCNICO",d.tecnicoTelefono],["CORREO TÉCNICO",d.tecnicoCorreo],["FECHA DE SERVICIO",d.fechaServicio]].map(([l,v],i)=>(
              <tr key={i}><td style={S.label}>{l}</td><td style={S.cell}>{v||"—"}</td></tr>
            ))}
          </tbody></table>
        </div>

               {/* DESCRIPCIÓN EQUIPO */}
        <div className="no-break">
          <p style={S.sectionTitle}>DESCRIPCIÓN DEL EQUIPO</p>
          <table style={S.tbl}>
            <tbody>
            {[
              ["NOTA",d.equipo?.nota],
              ["MARCA",d.equipo?.marca],
              ["MODELO",d.equipo?.modelo],
              ["N° SERIE",d.equipo?.serie],
              ["AÑO MODELO",d.equipo?.anio],
              ["VIN / CHASIS",d.equipo?.vin],
              ["PLACA",d.equipo?.placa],
              ["HORAS MÓDULO",d.equipo?.horasModulo],
              ["HORAS CHASIS",d.equipo?.horasChasis],
              ["KILOMETRAJE",d.equipo?.kilometraje],
              ["HORÓMETRO",d.equipo?.horometro],
             ].map(([l,v],i)=>(
              <tr key={i}>
                <td style={S.label}>{l}</td>
                <td style={S.cell}>{v||"—"}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

         {/* ESTADO DEL EQUIPO */}
        <div>
          <p style={S.sectionTitle}>ESTADO DEL EQUIPO</p>
          {estadoEquipoImagenes.length === 0 ? (
            <table style={S.tbl}><tbody><tr><td style={{ ...S.cell, textAlign: "center", color: "#6b7280", padding: 20 }}>Sin registros de estado del equipo</td></tr></tbody></table>
          ) : estadoEquipoImagenes.map((img, i) => (
            <div key={img.id||i} className="no-break" style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", marginTop: 10 }}>
              <div style={{ padding: "5px 10px", borderBottom: "1px solid #d1d5db", fontSize: 11, fontWeight: 700, background: "#f9fafb" }}>Imagen {i+1}</div>
              <div style={{ padding: 10 }}>
                <div style={{ position: "relative", width: "100%", border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden" }}>
                  <img src={img.url} alt={`estado-${i+1}`} style={{ width: "100%", maxHeight: 350, objectFit: "contain", display: "block" }} />
                  {(img.puntos||[]).map((p,pi)=>(<div key={p.id||pi} style={{ position:"absolute", left:`${p.x*100}%`, top:`${p.y*100}%`, transform:"translate(-50%,-50%)", width:18, height:18, borderRadius:"50%", background:"#dc2626", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", fontWeight:700 }}>{pi+1}</div>))}
                </div>
                {(img.puntos||[]).length > 0 && <div style={{ marginTop:8 }}>{img.puntos.map((p,pi)=>(<div key={p.id||pi} style={{ display:"flex", gap:8, marginBottom:4, fontSize:11 }}><span style={{ minWidth:22, fontWeight:700 }}>{pi+1})</span><span>{p.observacion||"—"}</span></div>))}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* PRUEBAS PREVIAS */}
        <div className="page-break" />
        <p style={{ ...S.sectionTitle, marginTop: 0 }}>
          1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
        </p>
        <ChecklistTable items={pruebasPrevias} data={d} />
</div>

       {/* SECCIONES */}
        {secciones.map((sec, i) => (
          <div key={i} className="no-break">
            <p style={S.sectionTitle}>{sec.titulo}</p>
            <ChecklistTable items={sec.items} data={d} />
          </div>
        ))}

      {/* CONCLUSIONES */}
        <div className="no-break">
          <table style={{ ...S.tbl, marginTop: 14 }}>
            <thead><tr><th colSpan={2} style={S.th}>CONCLUSIONES</th><th colSpan={2} style={S.th}>RECOMENDACIONES</th></tr></thead>
            <tbody>
              {(d.conclusiones||[]).map((c,i)=>(
                <tr key={i} className="no-break">
                  <td style={{ ...S.cell, width:28, textAlign:"center", fontWeight:700 }}>{i+1}</td>
                  <td style={{ ...S.cell, whiteSpace:"pre-wrap" }}>{c||"—"}</td>
                  <td style={{ ...S.cell, width:28, textAlign:"center", fontWeight:700 }}>{i+1}</td>
                  <td style={{ ...S.cell, whiteSpace:"pre-wrap" }}>{d.recomendaciones?.[i]||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


{/* NOTA FINAL */}
<div className="no-break">
  <p style={S.sectionTitle}>
    NOTA / OBSERVACIÓN FINAL DEL TÉCNICO
  </p>
  <table style={S.tbl}>
    <tbody>
      <tr>
        <td
          style={{
            ...S.cell,
            whiteSpace: "pre-wrap",
            minHeight: 60,
          }}
        >
          {d.notaFinal || "—"}
        </td>
      </tr>
    </tbody>
  </table>
</div>

        
{/* FIRMAS */}
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

        {/* FIRMA TÉCNICO */}
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
              <span style={{ fontSize: 10, color: "#9ca3af" }}>
                Sin firma
              </span>
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

        {/* FIRMA CLIENTE */}
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
              <span style={{ fontSize: 10, color: "#9ca3af" }}>
                Sin firma
              </span>
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

          <div
            style={{
              marginTop: 1,
              fontSize: 9,
              color: "#4b5563",
            }}
          >
            Cédula: {d.firmas?.clienteCedula || "—"}
          </div>
        </td>

      </tr>
    </tbody>
  </table>
</div>

      </div>
     {/* BOTONES */}
      <div className="no-print" style={{ display:"flex", justifyContent:"space-between", maxWidth:794, margin:"24px auto 0" }}>
        <button onClick={() => navigate("/inspeccion")} className="border px-6 py-2 rounded">Volver</button>
        <button onClick={handlePrint} className="bg-green-600 text-white px-6 py-2 rounded">Descargar PDF</button>
      </div>
    </div>
  );
}
