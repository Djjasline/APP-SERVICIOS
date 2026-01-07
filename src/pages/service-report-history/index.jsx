// APP-SERVICIOS/src/pages/service-report-history/index.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ServiceReportHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(stored);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow space-y-6">

        <h1 className="text-2xl font-bold text-slate-800">
          Historial de Informes de Servicio
        </h1>

        {reports.length === 0 ? (
          <p className="text-slate-500">
            No existen informes guardados.
          </p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-2">Fecha</th>
                <th className="border p-2">Cliente</th>
                <th className="border p-2">Técnico</th>
                <th className="border p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="border p-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {r.data?.cliente || "-"}
                  </td>
                  <td className="border p-2">
                    {r.data?.tecnicoNombre || "-"}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => {
                        localStorage.setItem(
                          "currentReport",
                          JSON.stringify(r)
                        );
                        navigate("/service-report-creation");
                      }}
                      className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                      Continuar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pt-4">
          <button
            onClick={() => navigate("/")}
            className="border px-6 py-2 rounded"
          >
            Volver al menú
          </button>
        </div>

      </div>
    </div>
  );
}
