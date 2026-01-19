import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";
import { useEffect, useState } from "react";

export default function InspeccionPdf() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const data = getInspectionById(type, id);
    setInspection(data);
  }, [type, id]);

  if (!inspection) {
    return <p className="p-6">Cargando…</p>;
  }

  const { data } = inspection;

  const descargarPDF = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white max-w-6xl mx-auto p-6 shadow space-y-6">

        {/* BOTONES */}
        <div className="flex justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={descargarPDF}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

        {/* ===== VISTA PREVIA PDF ===== */}
        <h1 className="text-lg font-bold text-center">
          HOJA DE INSPECCIÓN ({type.toUpperCase()})
        </h1>

        {/* DATOS GENERALES */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td className="pdf-label">Cliente</td>
              <td>{data.cliente}</td>
            </tr>
            <tr>
              <td className="pdf-label">Código</td>
              <td>{data.codInf}</td>
            </tr>
            <tr>
              <td className="pdf-label">Fecha</td>
              <td>{new Date(inspection.fecha).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>

        {/* ESTADO EQUIPO */}
        {data.estadoEquipoPuntos?.length > 0 && (
          <section>
            <h3 className="font-semibold">Estado del equipo</h3>
            <ul className="text-sm list-disc pl-5">
              {data.estadoEquipoPuntos.map((p) => (
                <li key={p.id}>
                  Punto {p.id}: {p.nota || "—"}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ITEMS */}
        <section>
          <h3 className="font-semibold">Checklist</h3>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.items || {}).map(
                ([codigo, item]) => (
                  <tr key={codigo}>
                    <td>{codigo}</td>
                    <td>{item.estado}</td>
                    <td>{item.observacion}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </section>

        {/* FIRMAS */}
        <section className="grid grid-cols-2 gap-6 pt-6">
          <div className="text-center">
            <p className="font-semibold">Firma técnico</p>
            {data.firmas?.tecnico && (
              <img
                src={data.firmas.tecnico}
                alt="Firma técnico"
                className="mx-auto max-h-32"
              />
            )}
          </div>

          <div className="text-center">
            <p className="font-semibold">Firma cliente</p>
            {data.firmas?.cliente && (
              <img
                src={data.firmas.cliente}
                alt="Firma cliente"
                className="mx-auto max-h-32"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
