import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";

/* ======================================================
   PDF – INSPECCIÓN CÁMARA
   Regla de oro:
   - El PDF SIEMPRE se genera desde datos guardados
   - Todo se muestra, esté lleno o no
====================================================== */

export default function InspeccionCamaraPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  /* =========================
     CARGAR INSPECCIÓN
  ========================= */
  useEffect(() => {
    const found = getInspectionById("camara", id);
    if (found) {
      setInspection(found);
    }
  }, [id]);

  if (!inspection) {
    return (
      <div className="p-6 text-center">
        <p>Cargando inspección…</p>
      </div>
    );
  }

  const { data } = inspection;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="pdf-container max-w-6xl mx-auto bg-white p-6">

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table w-full border mb-4">
          <tbody>
            <tr>
              <td rowSpan={3} style={{ width: 140, textAlign: "center" }}>
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  style={{ maxHeight: 70 }}
                />
              </td>
              <td colSpan={2} className="pdf-title text-center font-bold">
                HOJA DE INSPECCIÓN – CÁMARA
              </td>
            </tr>
            <tr>
              <td className="pdf-label">CLIENTE</td>
              <td>{data.cliente || "—"}</td>
            </tr>
            <tr>
              <td className="pdf-label">FECHA DE SERVICIO</td>
              <td>{data.fechaServicio || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS GENERALES ================= */}
        <table className="pdf-table w-full border mb-4">
          <tbody>
            {[
              ["DIRECCIÓN", data.direccion],
              ["CONTACTO", data.contacto],
              ["TELÉFONO", data.telefono],
              ["CORREO", data.correo],
              ["TÉCNICO RESPONSABLE", data.tecnicoResponsable],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td className="pdf-label">{label}</td>
                <td>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN / OBSERVACIONES ================= */}
        <h3 className="pdf-title mt-4 mb-2">
          DESCRIPCIÓN / OBSERVACIONES
        </h3>

        <table className="pdf-table w-full border mb-4">
          <tbody>
            <tr>
              <td style={{ height: 80 }}>
                {data.descripcion || "—"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table w-full border mt-6">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.tecnico ? (
                  <img
                    src={data.firmas.tecnico}
                    alt="firma técnico"
                    style={{ maxHeight: 100 }}
                  />
                ) : (
                  "—"
                )}
              </td>
              <td style={{ height: 120, textAlign: "center" }}>
                {data.firmas?.cliente ? (
                  <img
                    src={data.firmas.cliente}
                    alt="firma cliente"
                    style={{ maxHeight: 100 }}
                  />
                ) : (
                  "—"
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
