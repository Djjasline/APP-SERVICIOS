import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById } from "@/utils/inspectionStorage";
import { useEffect, useState } from "react";
import InspectionLayoutHidro from "../components/InspectionLayoutHidro";

export default function InspeccionPdf() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    setInspection(getInspectionById(type, id));
  }, [type, id]);

  if (!inspection) return <p>Cargando…</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="print:hidden flex justify-between mb-4">
        <button onClick={() => navigate(-1)} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button
          onClick={() => window.print()}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Descargar PDF
        </button>
      </div>

      <InspectionLayoutHidro
        data={inspection.data}
        readOnly
        showActions={false}
      />
    </div>
  );
}
