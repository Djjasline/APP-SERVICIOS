import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(stored);
  }, []);

  const openReport = (report) => {
    // 🔑 PASO CLAVE
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate("/informe/nuevo");
  };

  const deleteReport = (id) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
  };

  const isCompleted = (r) =>
    r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

  const filteredReports = reports.filter((r) => {
    if (filter === "borrador") return !isCompleted(r);
    if (filter === "completado") return isCompleted(r);
    return true;
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Informe general</h1>

      <button
        className="bg-blue-600 text-white px-6 py-2 rounded mb-4"
        onClick={() => {
          localStorage.removeItem("currentReport");
          navigate("/informe/nuevo");
        }}
      >
        Nuevo informe
      </button>

      {/* FILTROS */}
      <div className="flex gap-2 mb-4">
        {["todos", "borrador", "completado"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border rounded ${
              filter === f ? "bg-black text-white" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="space-y-2">
        {filteredReports.length === 0 && (
          <p className="text-gray-500">Sin registros</p>
        )}

        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {r.data?.cliente || "ETAPA"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleString()}
              </p>
              <p className="text-xs">
                Estado:{" "}
                <strong>
                  {isCompleted(r) ? "Completado" : "Borrador"}
                </strong>
              </p>
            </div>

            <div className="flex gap-3 text-sm">
              <button
                className="text-blue-600"
                onClick={() => openReport(r)}
              >
                Abrir
              </button>

              {isCompleted(r) && (
                <button
                  className="text-green-600"
                  onClick={() => navigate(`/informe/pdf/${r.id}`)}
                >
                  PDF
                </button>
              )}

              <button
                className="text-red-600"
                onClick={() => deleteReport(r.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
