import SyncStatus from "@/components/SyncStatus";
import { syncReports } from "@/lib/sync";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    const loadReports = async () => {
      await syncReports();

      try {
        const { data, error } = await supabase
  .from("registros")
  .select("*")
  .eq("tipo", "informe")
  .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setReports(data);
          localStorage.setItem("serviceReports", JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn("Sin conexión, usando localStorage");
      }

      // 🔁 fallback local
      try {
        const stored = JSON.parse(localStorage.getItem("serviceReports"));

        if (Array.isArray(stored)) {
          const sorted = [...stored].sort(
            (a, b) =>
              new Date(
                b.updated_at || b.updatedAt || b.created_at || b.createdAt
              ) -
              new Date(
                a.updated_at || a.updatedAt || a.created_at || a.createdAt
              )
          );

          setReports(sorted);
        } else {
          setReports([]);
        }
      } catch {
        setReports([]);
      }
    };

    loadReports();
    window.addEventListener("online", loadReports);
    return () => window.removeEventListener("online", loadReports);
  }, []);

  // 🎯 FILTRO
  const filteredReports = reports.filter((r) => {
    if (filter === "borrador") return r.estado !== "completado";
    if (filter === "completado") return r.estado === "completado";
    return true;
  });

  // 📂 ABRIR
  const openReport = (report) => {
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate(`/informe/${report.id}`);
  };

  // 🗑 ELIMINAR
  const deleteReport = async (id) => {
    if (!confirm("¿Eliminar este informe?")) return;

    try {
      await supabase
        .from("registros")
        .delete()
        .eq("id", id)
        .eq("tipo", "informe");
    } catch {
      console.warn("Sin conexión, solo borrado local");
    }

    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
    setReports(updated);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Informe general</h1>

          <div className="flex items-center gap-3">
            <SyncStatus />
            <button
              onClick={() => navigate("/")}
              className="border px-4 py-1 rounded"
            >
              Volver
            </button>
          </div>
        </div>

        {/* NUEVO */}
        <button
          onClick={() => {
            localStorage.removeItem("currentReport");
            navigate("/informe/nuevo");
          }}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Nuevo informe
        </button>

        {/* FILTROS */}
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

        {/* LISTA */}
        <div className="space-y-2">
          {filteredReports.length === 0 && (
            <p className="text-sm text-gray-500">Sin registros</p>
          )}

          {filteredReports.map((r) => (
            <div
              key={r.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <strong>{r.data?.cliente || "Sin cliente"}</strong>

                <div className="text-xs">
                  {new Date(
                    r.updated_at || r.created_at
                  ).toLocaleString()}
                </div>

                <div className="text-xs">
                  Estado:{" "}
                  <strong>
                    {r.estado === "completado"
                      ? "Completado"
                      : "Borrador"}
                  </strong>
                </div>
              </div>

              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => openReport(r)}
                  className="text-blue-600"
                >
                  Abrir
                </button>

                {r.estado === "completado" && (
                  <button
                    onClick={() => navigate(`/informe/pdf/${r.id}`)}
                    className="text-green-600 font-semibold"
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
          ))}
        </div>

      </div>
    </div>
  );
}
