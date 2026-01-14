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

  const isCompleted = (r) =>
    r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

  const filteredReports = reports.filter((r) => {
    if (filter === "todos") return true;
    if (filter === "borrador") return !isCompleted(r);
    if (filter === "completado") return isCompleted(r);
    return true;
  });

  const openReport = (id) => {
    navigate(`/informe/editar/${id}`);
  };

  const openPDF = (id) => {
    navigate(`/informe/pdf/${id}`);
  };

  const deleteReport = (id) => {
    if (!confirm("¿Eliminar informe?")) return;
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
    setReports(updated);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-4">

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Informe general</h1>

          {/* 🔙 BOTÓN VOLVER (ESTE FALTABA) */}
          <button
            onClick={() => navigate("/")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>

        {/* ===== NUEVO INFORME ===== */}
        <button
          onClick={() => navigate("/informe/nuevo")}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Nuevo informe
        </button>

        {/* ===== FILTROS ===== */}
        <div className="flex gap-2">
          {["todos", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 border rounded text-sm ${
                filter === f ? "bg-black text-white" : ""
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ===== LISTADO ===== */}
        <div className="space-y-2">
          {filteredReports.length === 0 && (
            <p className="text-sm text-gray-500">Sin registros</p>
          )}

          {filteredReports.map((r) => {
            const completed = isCompleted(r);

            return (
              <div
                key={r.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <strong>{r.data?.cliente || "ETAPA"}</strong>
                  <div className="text-xs text-gray-500">
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
                    className="text-blue-600"
                    onClick={() => openReport(r.id)}
                  >
                    Abrir
                  </button>

                  {completed && (
                    <button
                      className="text-green-600"
                      onClick={() => openPDF(r.id)}
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
            );
          })}
        </div>

      </div>
    </div>
  );
}
