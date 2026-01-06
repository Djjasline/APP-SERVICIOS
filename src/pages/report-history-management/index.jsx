import React from "react";
import { useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportContext";

export default function ReportHistoryManagement() {
  const navigate = useNavigate();
  const { reports, loadReport, deleteReport } = useReports();

  const abrirReporte = (id) => {
    loadReport(id);
    navigate("/service-report-creation");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto bg-white border p-6">
        <h1 className="text-xl font-bold mb-4">
          Historial de Informes
        </h1>

        {reports.length === 0 ? (
          <p className="text-slate-500">
            No existen informes registrados.
          </p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2">FECHA</th>
                <th className="border p-2">CLIENTE</th>
                <th className="border p-2">ESTADO</th>
                <th className="border p-2">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="border p-2 text-center">
                    {r.updatedAt
                      ? new Date(r.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="border p-2">
                    {r.generalInfo?.cliente?.nombre ||
                      "Sin cliente"}
                  </td>

                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        r.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status === "completed"
                        ? "FINALIZADO"
                        : "BORRADOR"}
                    </span>
                  </td>

                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => abrirReporte(r.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      Abrir
                    </button>

                    <button
                      onClick={() => deleteReport(r.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
