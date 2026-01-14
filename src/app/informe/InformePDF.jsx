import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformePDF() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (current) setReport(current);
  }, []);

  if (!report) {
    return <p className="p-6">No hay informe cargado</p>;
  }

  return (
    <div className="p-6">
      <button
        className="border px-4 py-2 mb-4 rounded"
        onClick={() => navigate("/informe")}
      >
        Volver
      </button>

      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  );
}
