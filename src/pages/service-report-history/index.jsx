import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ServiceReportHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  // =============================
  // CARGAR HISTORIAL
  // =============================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(saved);
  }, []);

  // =============================
  // ELIMINAR REPORTE
  // =============================
  const deleteReport = (index) => {
    if (!confirm("¿Eliminar este reporte?")) return;
    const updated = [...reports];
    updated.splice(index, 1);
    setReports(updated);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Historial de Informes Técnicos
        </h1>

        {reports.length === 0 ? (
          <p className="text-center text-gray-500">
            No existen informes guardados.
          </p>
        ) : (
          <table className="pdf-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Referencia</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.cliente || "-"}</td>
                  <td>{r.referenciaContrato || "-"}</td>
                  <td>{r.fechaServicio || "-"}</td>
                  <td className="space-x-2">
                    <button
                      onClick={() => {
                        localStorage.setItem("currentReport", JSON.stringify(r));
                        navigate("/service-report-creation");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Continuar
                    </button>

                    <button
                      onClick={() => {
                        localStorage.setItem("currentReport", JSON.stringify(r));
                        navigate("/service-report-preview");
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => deleteReport(i)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 border rounded"
          >
            Volver al panel
          </button>
        </div>

      </div>
    </div>
  );
}
