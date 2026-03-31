import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LiberacionHome() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 CARGAR DATA
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("registros")
          .select("*")
          .eq("tipo", "liberacion")
          .eq("subtipo", "vehiculo")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setRegistros(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Sin conexión");
      }

      // 🔴 FALLBACK LOCAL
      const local = JSON.parse(localStorage.getItem("pending_registros") || "[]");
      setRegistros(local);
      setLoading(false);
    };

    loadData();
  }, []);

  // 🔍 ABRIR
  const openItem = (item) => {
    localStorage.setItem("currentLiberacion", JSON.stringify(item));
    navigate(`/liberacion/${item.id || "local"}`);
  };

  // ❌ ELIMINAR
  const deleteItem = async (id) => {
    if (!confirm("¿Eliminar registro?")) return;

    try {
      await supabase.from("registros").delete().eq("id", id);
    } catch {
      console.warn("Error eliminando en supabase");
    }

    setRegistros(registros.filter((r) => r.id !== id));
  };

  // 📄 DESCARGAR PDF
  const downloadPDF = (id) => {
    const stored = JSON.parse(localStorage.getItem("pdf_liberaciones") || "{}");

    const pdf = stored[id];

    if (!pdf) {
      alert("PDF no disponible en este dispositivo");
      return;
    }

    const link = document.createElement("a");
    link.href = pdf;
    link.download = `Liberacion_${id}.pdf`;
    link.click();
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

     <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Historial de Liberaciones
          </h1>

          <button
            onClick={() => navigate("/liberacion/nuevo")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Nueva liberación
          </button>
        </div>

        {/* ESTADO */}
        {loading && <p>Cargando...</p>}

        {!loading && registros.length === 0 && (
          <p className="text-gray-500">Sin registros</p>
        )}

        {/* LISTADO */}
        <div className="space-y-3">
          {registros.map((item) => {
            const data = item.data || {};

            return (
              <div
                key={item.id || Math.random()}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {data.cliente || "Sin cliente"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {data.conductor || "Sin conductor"}
                  </p>

                  <p className="text-xs text-gray-400">
                    {data.placa || "Sin placa"}
                  </p>

                  <p className="text-xs">
                    Estado:{" "}
                    <strong>
                      {item.estado === "completado"
                        ? "APROBADO"
                        : "NO APROBADO"}
                    </strong>
                  </p>
                </div>

                <div className="flex gap-3 text-sm">

                  {/* ABRIR */}
                  <button
                    onClick={() => openItem(item)}
                    className="text-blue-600"
                  >
                    Abrir
                  </button>

                  {/* PDF SOLO SI COMPLETADO */}
                  {item.estado === "completado" && (
                    <button
                      onClick={() => downloadPDF(item.id)}
                      className="text-green-600 font-semibold"
                    >
                      PDF
                    </button>
                  )}

                  {/* ELIMINAR */}
                  <button
                    onClick={() => deleteItem(item.id)}
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
