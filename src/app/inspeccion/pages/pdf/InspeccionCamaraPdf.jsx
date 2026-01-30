import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   DEFINICIÓN DE ESTRUCTURA
   (MISMO ENFOQUE QUE HIDRO)
============================= */

export default function InspeccionCamaraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  /* =============================
     CARGA DE INSPECCIÓN (IGUAL HIDRO)
  ============================= */
  useEffect(() => {
    const found = getInspectionById("camara", id);
    if (found) setInspection(found);
  }, [id]);

  if (!inspection) {
    return <div className="p-6">Cargando inspección…</div>;
  }

  const { data } = inspection;
  const items = data.items || {};

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto">

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td rowSpan={3} style={{ width: 140, textAlign: "center" }}>
                <img src="/astap-logo.jpg" style={{ maxHeight: 70 }} />
              </td>
              <td colSpan={2} className="pdf-title">
                HOJA DE INSPECCIÓN CÁMARA CCTV
              </td>
            </tr>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td>{data.referenciaContrato || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">COD. INF.</td>
              <td>{data.codInf || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="pdf-table mt-4">
          <tbody>
            {[
              ["CLIENTE", data.cliente],
              ["UBICACIÓN", data.ubicacion],
              ["TÉCNICO ASTAP", data.tecnicoAstap],
              ["RESPONSABLE CLIENTE", data.responsableCliente],
              ["FECHA DE INSPECCIÓN", data.fechaInspeccion],
            ].map(([l, v], i) => (
              <tr key={i}>
                <td className="pdf-label">{l}</td>
                <td>{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td colSpan={2}>
                <img
                  src="/estado equipo camara.png"
                  style={{ width: "100%" }}
                />
              </td>
            </tr>

            {data.estadoEquipoPuntos?.length > 0 ? (
              data.estadoEquipoPuntos.map((pt) => (
                <tr key={pt.id}>
                  <td className="pdf-label">{pt.id}</td>
                  <td>{pt.nota || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  — Sin observaciones —
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ================= EVALUACIÓN DE COMPONENTES ================= */}
        <h3 className="pdf-title mt-4">
          EVALUACIÓN DE COMPONENTES / SISTEMAS
        </h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Estado</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(items).length > 0 ? (
              Object.entries(items).map(([codigo, item]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{item.estado || "—"}</td>
                  <td>{item.observacion || ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  — Sin ítems evaluados —
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            {[
              ["MARCA", data.marca],
              ["MODELO", data.modelo],
              ["SERIE MÓDULO", data.serieModulo],
              ["SERIE CARRETE", data.serieCarrete],
              ["SERIE CABEZAL", data.serieCabezal],
              ["AÑO MODELO", data.anioModelo],
            ].map(([l, v], i) => (
              <tr key={i}>
                <td className="pdf-label">{l}</td>
                <td>{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table mt-4">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.tecnico && (
                  <img
                    src={data.firmas.tecnico}
                    style={{ maxHeight: 100 }}
                  />
                )}
              </td>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.cliente && (
                  <img
                    src={data.firmas.cliente}
                    style={{ maxHeight: 100 }}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/inspeccion")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

      </div>
    </div>
  );
}
