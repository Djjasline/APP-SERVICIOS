import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ServiceReportHistory() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("serviceReports") || "[]"
    );
    setReports(stored.reverse());
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Historial de informes</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">
                {new Date(r.fecha).toLocaleString()}
              </td>
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">
                <button
                  className="underline"
                  onClick={() =>
                    navigate("/service-report-preview", { state: r })
                  }
                >
                  Ver / PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
