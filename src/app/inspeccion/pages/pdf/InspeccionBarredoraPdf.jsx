import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

export default function InspeccionBarredoraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const found = getInspectionById("barredora", id);
    if (found) setInspection(found);
  }, [id]);

  if (!inspection) {
    return <div className="p-6">Cargando inspección…</div>;
  }

  const { data } = inspection;

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
                HOJA DE INSPECCIÓN BARREDORA
              </td>
            </tr>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td>{data.referenciaContrato || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td>{data.descripcion || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= ESTADO DEL EQUIPO ================= */}
        <h3 className="pdf-title mt-4">ESTADO DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td colSpan={2} style={{ position: "relative", padding: 0 }}>
                <img
                  src="/estado equipo barredora.png"
                  style={{ width: "100%", display: "block" }}
                />

                {/* 🔴 PUNTOS ROJOS */}
                {data.estadoEquipoPuntos?.map((pt) => (
                  <div
                    key={pt.id}
                    style={{
                      position: "absolute",
                      left: `${pt.x}%`,
                      top: `${pt.y}%`,
                      transform: "translate(-50%, -50%)",
                      background: "red",
                      color: "white",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pt.id}
                  </div>
                ))}
              </td>
            </tr>

            {/* 🔴 DETALLE DE PUNTOS */}
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
