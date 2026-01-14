import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  /* =============================
     CARGAR INFORMES
  ============================== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(stored);
  }, []);

  /* =============================
     FILTRO
  ============================== */
  const filteredReports = reports.filter((r) => {
    const hasSignatures =
      r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

    if (filter === "borrador") return !hasSignatures;
    if (filter === "completado") return hasSignatures;
    return true;
  });

  /* =============================
     ELIMINAR
  ============================== */
  const deleteReport = (id) => {
    if (!confirm("¿Eliminar este informe?")) return;
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
    setReports(updated);
  };

  /* =============================
     ABRIR
  ============================== */
  const openReport = (report) => {
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate(`/informe/${report.id}`);
  };

  /* =============================
     PDF
  ============================== */
  const openPDF = (id) => {
    window.open(`/informe/pdf/${id}`, "_blank");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Informe general</h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border px-4 py-1 rounded"
          >
            Volver
          </button>
        </div>

        {/* NUEVO INFORME */}
        <button
          type="button"
          onClick={() => navigate("/informe/nuevo")}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Nuevo informe
        </button>

        {/* FILTROS */}
        <div className="flex gap-2">
          {["todos", "borrador", "completado"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 border rounded text-sm ${
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
            <p className="text-sm text-gray-500">Sin registros</p>
          )}

          {filteredReports.map((r) => {
            const completed =
              r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

            return (
              <div
                key={r.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <strong>ETAPA-EP</strong>
                  <div className="text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs">
                    Estado:{" "}
                    <strong>
                      {completed ? "Completado" : "Borrador"}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => openReport(r)}
                    className="text-blue-600"
                  >
                    Abrir
                  </button>

                  {completed && (
                    <button
                      type="button"
                      onClick={() => openPDF(r.id)}
                      className="text-green-600"
                    >
                      PDF
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteReport(r.id)}
                    className="text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
