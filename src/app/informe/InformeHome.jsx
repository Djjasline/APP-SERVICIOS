import SyncStatus from "@/components/SyncStatus";
import { syncReports } from "@/lib/sync";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  /* =============================
     CARGA SEGURA DESDE SUPABASE Y LOCALSTORE
  ============================== */
  useEffect(() => {
    const loadReports = async () => {

      // 🔥 1️⃣ Sincronizar pendientes primero
      await syncReports();

      try {
  // 🔥 2️⃣ Cargar desde Supabase (fuente principal)
  const { data, error } = await supabase
    .from("registros")
    .select("*")
          .eq("tipo", "informe")
          .eq("subtipo", "general")
          .order("updated_at", { ascending: false });

        if (!error && data) {
          setReports(data);
          return;
        }

        console.warn("Supabase no disponible, usando localStorage");

      } catch (err) {
        console.warn("Sin conexión, usando localStorage");
      }

      // 🔹 3️⃣ Fallback local
      try {
         stored = JSON.parse(localStorage.getItem("serviceReports"));

        if (Array.isArray(stored)) {
           sorted = [...stored].sort((a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
          );

          setReports(sorted);
        } else {
          setReports([]);
        }

      } catch (e) {
        console.error("Error leyendo localStorage", e);
        setReports([]);
      }
    };

    loadReports();

    // 🔥 Sincronización automática cuando vuelve internet
    window.addEventListener("online", loadReports);

    return () => {
      window.removeEventListener("online", loadReports);
    };

  }, []);

  /* =============================
     FILTRO SEGURO
  ============================== */
   filteredReports = Array.isArray(reports)
    ? reports.filter((r) => {
         completed =
          r?.data?.firmas?.tecnico && r?.data?.firmas?.cliente;

        if (filter === "borrador") return !completed;
        if (filter === "completado") return completed;
        return true;
      })
    : [];

  /* =============================
     ACCIONES
  ============================== */

   openReport = (report) => {
    if (!report) return;
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate(`/informe/${report.id}`);
  };

   deleteReport = async (id) => {
    if (!confirm("¿Eliminar este informe?")) return;

    try {
      const { error } = await supabase
        .from("informes")
        .delete()
        .eq("id", id)
        .eq("tipo", "informe")
        .eq("subtipo", "general");

      if (error) {
        console.warn("No se pudo borrar en Supabase");
      }
    } catch (err) {
      console.warn("Sin conexión, solo borrado local");
    }

    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem("serviceReports", JSON.stringify(updated));
    setReports(updated);
  };

  const openPDF = (id) => {
    window.open(`/informe/pdf/${id}`, "_blank");
  };

  /* =============================
     RENDER
  ============================== */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-4">
<div className="flex justify-between items-center">
  <h1 className="text-lg font-semibold">Informe general</h1>
  <div className="flex items-center gap-3">
    <SyncStatus />
    <button
      type="button"
      onClick={() => navigate("/")}
      className="border px-4 py-1 rounded"
    >
      Volver
    </button>
  </div>
</div>

        {/* NUEVO */}
        <button
          type="button"
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
              r?.data?.firmas?.tecnico && r?.data?.firmas?.cliente;

            return (
              <div
                key={r.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <strong>{r.data?.cliente || "Sin cliente"}</strong>

                  <div className="text-xs">
                    {new Date(
                      r.updated_at ||
                      r.updatedAt ||
                      r.created_at ||
                      r.createdAt
                    ).toLocaleString()}
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
