import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { printPdf } from "@/utils/printPdf";

/* ══════════════════════════════
   ESTILOS — IDÉNTICOS A HYDRO
══════════════════════════════ */
const S = {
  tbl:   { width: "100%", borderCollapse: "collapse", fontSize: 10},
  cell:  { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10},
  label: { border: "1px solid #374151", padding: "4px 6px", verticalAlign: "middle", fontSize: 10, fontWeight: 700, backgroundColor: "#f3f4f6", whiteSpace: "nowrap", width: "35%" },
  th:    { border: "1px solid #374151", padding: "4px 6px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", textTransform: "uppercase", fontSize: 10},
  thSI:  { border: "1px solid #374151", padding: "6px 4px", backgroundColor: "#1e3a5f", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 10, width: 36 },
  sectionTitle: {
    fontSize: 10, fontWeight: 800, textAlign: "center", textTransform: "uppercase",
    letterSpacing: "0.5px", padding: "6px 8px", backgroundColor: "#1e3a5f",
    color: "#fff", margin: "10px 0 0 0", border: "1px solid #1e3a5f",
  },
};

const estadoColor = { SI: "#dcfce7", NO: "#fee2e2", "N/A": "#f3f4f6" };

/* ══════════════════════════════
   SECCIONES — ESPEJO DEL FORM
══════════════════════════════ */
const secciones = [
  {
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Verificación de pantalla / monitor"],
      ["1.4", "Verificación de iluminación LED del cabezal"],
      ["1.5", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    titulo: "2. MANTENIMIENTO DEL SISTEMA CÁMARA V-CAM6",
    tipo: "simple",
    items: [
      ["2.1",  "Limpieza exterior del carrete"],
      ["2.2",  "Limpieza de cable y guía de enrollado"],
      ["2.3",  "Inspección visual del cable de 12 mm"],
      ["2.4",  "Revisión de cortes, dobleces o zonas planas del cable"],
      ["2.5",  "Revisión de marcadores de longitud"],
      ["2.6",  "Revisión de conectores eléctricos"],
      ["2.7",  "Limpieza de lente del cabezal de cámara"],
      ["2.8",  "Verificación de estado del resorte de terminación"],
      ["2.9",  "Verificación de estanqueidad del cabezal"],
      ["2.10", "Lubricación ligera de ejes y puntos móviles del carrete"],
      ["2.11", "Verificación de giro libre del carrete"],
      ["2.12", "Verificación de calidad de imagen"],
      ["2.13", "Verificación de señal sin interferencias"],
      ["2.14", "Revisión de caja / maleta de transporte"],
    ],
  },
  {
    titulo: "3. REPUESTOS USADOS",
    tipo: "cantidad",
    items: [
      ["2.104.24.00006", "Kit base de terminación 12 mm"],
      ["3.02.01.000032", "Cordón de seguridad / lanyard usado en kits estándar de terminación 12 mm"],
      ["2.104.24.00004", "Ensamble de cable espiralado estándar 12 mm"],
      ["3.02.07.000014", "Resorte de terminación estándar 12 mm"],
    ],
  },
  {
    titulo: "4. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POSTERIOR AL SERVICIO",
    tipo: "simple",
    items: [
      ["4.1", "Encendido general posterior al mantenimiento"],
      ["4.2", "Verificación de imagen estable y centrada"],
      ["4.3", "Verificación de iluminación LED"],
      ["4.4", "Verificación de avance y retroceso del cable"],
      ["4.5", "Verificación de funcionamiento de controles"],
      ["4.6", "Prueba final del sistema completo"],
    ],
  },
];

/* ── TABLA SECCIÓN ── */
function SeccionTable({ sec, items }) {
  return (
    <table style={S.tbl}>
      <thead>
        <tr>
          <th style={{ ...S.th, width: 130, textAlign: "left" }}>ÍTEM</th>
          <th style={{ ...S.th, textAlign: "left" }}>DETALLE</th>
          {sec.tipo === "cantidad" && <th style={{ ...S.th, width: 70 }}>CANT.</th>}
          <th style={S.thSI}>SI</th>
          <th style={S.thSI}>NO</th>
          <th style={S.thSI}>N/A</th>
          <th style={{ ...S.th, textAlign: "left" }}>OBSERVACIÓN</th>
        </tr>
      </thead>
      <tbody>
        {sec.items.map(([codigo, texto]) => {
          const item   = items?.[codigo] || {};
          const estado = item.estado || "";
          return (
            <tr key={codigo}>
              <td style={{ ...S.cell, fontWeight: 700, fontSize: 10 }}>{codigo}</td>
              <td style={S.cell}>{texto}</td>
              {sec.tipo === "cantidad" && (
                <td style={{ ...S.cell, textAlign: "center" }}>{item.cantidad || "—"}</td>
              )}
              {["SI", "NO", "N/A"].map((opt) => (
                <td key={opt} style={{
                  ...S.cell, textAlign: "center",
                  backgroundColor: estado === opt ? estadoColor[opt] : "#fff",
                  fontWeight: estado === opt ? 700 : 400,
                }}>
                  {estado === opt ? "✓" : ""}
                </td>
              ))}
              <td style={S.cell}>{item.observacion || "—"}</td>
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
export default function MantenimientoVCamPDF() {
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
        .eq("subtipo", "vcam")
        .single();
      if (error || !data) { console.error(error); return; }
      setReport({ id: data.id, estado: data.estado, data: data.data, createdAt: data.created_at });
    };
    load();
  }, [id]);

  if (!report) return (
    <div className="p-6 text-center">
      <p>No se encontró el mantenimiento.</p>
      <button onClick={() => navigate("/mantenimiento")} className="border px-4 py-2 rounded mt-4">Volver</button>
    </div>
  );

  if (report.estado !== "completado") return (
    <div className="p-6 text-center">
      <p>Este mantenimiento no está completado aún.</p>
      <button onClick={() => navigate("/mantenimiento")} className="border px-4 py-2 rounded mt-4">Volver</button>
    </div>
  );

  const { data: d } = report;

  const handlePrint = () => {
    const cliente = (d.cliente       || "cliente").replace(/\s+/g, "-");
    const pedido  = (d.pedidoDemanda || "pedido").replace(/\s+/g, "");
    const codigo  = (d.codInf        || "000").replace(/\s+/g, "");
    printPdf("pdf-content", `Mantenimiento_VCam_${cliente}_${pedido}_${codigo}_ASTAP`);
  };

  const estadoEquipoImagenes = d?.estadoEquipo?.imagenes || [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "24px 16px" }}>
      <div id="pdf-content" style={{
        maxWidth: 794, margin: "0 auto", background: "#fff",
        padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.12)", borderRadius: 6,
      }}>

        {/* ── ENCABEZADO ── */}
        <div className="no-break">
          <table style={S.tbl}>
            <tbody>
              <tr>
                <td rowSpan={5} style={{ ...S.cell, width: 130, textAlign: "center" }}>
                  <img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 65, margin: "0 auto", display: "block" }} />
                </td>
                <td colSpan={2} style={{ ...S.cell, textAlign: "center", fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>
                  HOJA DE MANTENIMIENTO CÁMARA V-CAM6
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
                <tr key={i}><td style={S.label}>{l}</td><td style={S.cell}>{v || "—"}</td></tr>
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
                ["NOTA",              d.equipo?.nota],
                ["MARCA",             d.equipo?.marca],
                ["MODELO",            d.equipo?.modelo],
                ["N° SERIE MÓDULO",   d.equipo?.serieModulo],
                ["N° SERIE CARRETE",  d.equipo?.serieCarrete],
                ["N° SERIE CABEZAL",  d.equipo?.serieCabezal],
                ["AÑO MODELO",        d.equipo?.anio],
                ["LONGITUD CABLE",    d.equipo?.longitudCable],
                ["DIÁMETRO CABLE",    d.equipo?.diametroCable],
                ["VERSIÓN SOFTWARE",  d.equipo?.versionSoftware],
                ["ACCESORIOS",        d.equipo?.accesorios],
              ].map(([l, v], i) => (
                <tr key={i}><td style={S.label}>{l}</td><td style={S.cell}>{v || "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── ESTADO DEL EQUIPO ── */}
        <div className="no-break">
          <p style={S.sectionTitle}>ESTADO DEL EQUIPO</p>
          {estadoEquipoImagenes.length === 0 ? (
            <table style={S.tbl}><tbody><tr>
              <td style={{ ...S.cell, textAlign: "center", color: "#6b7280", padding: 20 }}>
                Sin registros de estado del equipo
              </td>
            </tr></tbody></table>
          ) : (
            estadoEquipoImagenes.map((img, i) => (
              <div key={img.id || i} className="no-break"
                style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", marginTop: 10 }}>
                <div style={{ padding: "5px 10px", borderBottom: "1px solid #d1d5db", fontSize: 10, fontWeight: 700, background: "#f9fafb" }}>
                  Fotografía {i + 1}
                </div>
                <div style={{ padding: 10 }}>
                  <div
  style={{
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 4,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
  }}
>
  <div
    style={{
      position: "relative",
      display: "inline-block",
      maxWidth: "100%",
    }}
  >
    <img
      src={img.url}
      alt={`estado-${i + 1}`}
      style={{
        maxWidth: "100%",
        maxHeight: 230,
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
</div>
                  {(img.puntos || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {img.puntos.map((p, pi) => (
                        <div key={p.id || pi} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 10}}>
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

        {/* ── SECCIONES ── */}
        <div className="page-break" />
        {secciones.map((sec, i) => (
          <div key={i} className="no-break">
            <p style={{ ...S.sectionTitle, marginTop: i === 0 ? 0 : 10 }}>{sec.titulo}</p>
            <SeccionTable sec={sec} items={d.items} />
          </div>
        ))}

        {/* ── NOTA FINAL ── */}
        {d.notaFinal && (
          <div className="no-break">
            <p style={S.sectionTitle}>NOTA / OBSERVACIÓN FINAL DEL TÉCNICO</p>
            <table style={S.tbl}><tbody><tr>
              <td style={{ ...S.cell, whiteSpace: "pre-wrap", minHeight: 60 }}>{d.notaFinal}</td>
            </tr></tbody></table>
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
                <td style={{ ...S.cell, height: 85, textAlign: "center", verticalAlign: "middle", padding: "6px 8px" }}>
                  <div style={{ height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.firmas?.tecnico ? (
                      <img src={d.firmas.tecnico} alt="Firma técnico"
                        style={{ maxHeight: 34, width: "auto", maxWidth: 160, objectFit: "contain", display: "block", filter: "contrast(1.05)" }} />
                    ) : (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                    {d.tecnicoNombre || "—"}
                  </div>
                </td>
                <td style={{ ...S.cell, height: 85, textAlign: "center", verticalAlign: "middle", padding: "6px 8px" }}>
                  <div style={{ height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.firmas?.cliente ? (
                      <img src={d.firmas.cliente} alt="Firma cliente"
                        style={{ maxHeight: 34, width: "auto", maxWidth: 160, objectFit: "contain", display: "block", filter: "contrast(1.05)" }} />
                    ) : (
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
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
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", maxWidth: 794, margin: "24px auto 0" }}>
        <button onClick={() => navigate("/mantenimiento")} className="border px-6 py-2 rounded">Volver</button>
        <button onClick={handlePrint} className="bg-green-600 text-white px-6 py-2 rounded">Descargar PDF</button>
      </div>
    </div>
  );
}
