import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  /* ===========================
     CARGAR INFORMES
  =========================== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(stored);
  }, []);

  /* ===========================
     FILTRO
  =========================== */
  const filteredReports = reports.filter((r) => {
    const completed =
      r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

    if (filter === "borrador") return !completed;
    if (filter === "completado") return completed;
    return true;
  });

  /* ===========================
     ACCIONES
  =========================== */
  const openReport = (report) => {
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate("/informe"); // ✅ RUTA CORRECTA
  };

  const newReport = () => {
    localStorage.removeItem("currentReport");
    navigate("/informe"); // ✅ RUTA CORRECTA
  };

  const deleteReport = (id) => {
    if (!confirm("¿Eliminar este informe?")) return;
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
    setReports(updated);
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Informe general</h1>
          <button
            onClick={() => navigate("/")}
            className="border px-4 py-1 rounded text-sm"
          >
            Volver
          </button>
        </div>

        {/* NUEVO */}
        <button
          onClick={newReport}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Nuevo informe
        </button>

        {/* FILTROS */}
        <div className="flex gap-2 text-xs">
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
            <p className="text-xs text-gray-500">Sin registros</p>
          )}

          {filteredReports.map((r) => {
            const completed =
              r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

            return (
              <div
                key={r.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div className="text-xs">
                  <p className="font-semibold">
                    {r.data?.cliente || "ETAPA"}
                  </p>
                  <p>{new Date(r.createdAt).toLocaleString()}</p>
                  <p>
                    Estado:{" "}
                    <strong>
                      {completed ? "Completado" : "Borrador"}
                    </strong>
                  </p>
                </div>

                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => openReport(r)}
                    className="text-blue-600"
                  >
                    Abrir
                  </button>

                  {completed && (
                    <button
                      onClick={() =>
                        navigate(`/informe/pdf/${r.id}`)
                      }
                      className="text-green-600"
                    >
                      PDF
                    </button>
                  )}

                  <button
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
