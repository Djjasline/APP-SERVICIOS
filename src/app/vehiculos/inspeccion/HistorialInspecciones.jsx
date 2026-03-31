import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);

  /* =============================
     CARGAR INSPECCIONES
  ============================== */
  useEffect(() => {
    const loadInspections = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("tipo", "inspeccion")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setInspections([]);
        return;
      }

      setInspections(data || []);
    };

    loadInspections();
  }, []);

  /* =============================
     AGRUPAR
  ============================== */
  const safeInspections = Array.isArray(inspections) ? inspections : [];

  const byType = {
    hidro: safeInspections.filter((i) => i.subtipo === "hidro"),
    barredora: safeInspections.filter((i) => i.subtipo === "barredora"),
    camara: safeInspections.filter((i) => i.subtipo === "camara"),
  };

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (type, id) => {
    navigate(`/inspeccion/${type}/${id}`);
  };

  const handleGeneratePdf = (inspection) => {
    navigate(`/inspeccion/pdf/${inspection.id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar inspección?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setInspections((prev) => prev.filter((i) => i.id !== id));
  };

  /* =============================
     CARD COMPONENT (GLASS)
  ============================== */
  const renderCard = (title, desc, type, list) => (
    <div className="bg-white rounded-xl p-6 shadow border border-white/10 rounded-xl p-5 space-y-4">

      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-300">{desc}</p>
      </div>

      <button
        onClick={() => navigate(`/inspeccion/${type}/new`)}
        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
      >
        + Nueva inspección
      </button>

      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-xs text-gray-400">
            No hay inspecciones registradas.
          </p>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 border rounded-lg border border-white/10 rounded-lg p-3 text-xs flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">
                  {item.data?.cliente || "Sin cliente"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.estado === "completado"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {item.estado}
                </span>
              </div>

              <span className="text-[10px] text-gray-400">
                {new Date(
                  item.updated_at || item.created_at
                ).toLocaleString()}
              </span>

              <div className="flex gap-3 pt-1 text-xs">

                {item.estado === "completado" && (
                  <button
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-400 hover:text-green-300"
                  >
                    PDF
                  </button>
                )}

                <button
                  onClick={() => handleOpen(type, item.id)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Abrir
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /* =============================
     UI
  ============================== */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">
          Inspección y valoración
        </h1>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className="border border-white/20 text-white px-4 py-1 rounded text-sm hover:bg-white/10 transition"
        >
          ← Volver
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {renderCard(
          "Hidrosuccionador",
          "Inspección general del equipo hidrosuccionador",
          "hidro",
          byType.hidro
        )}

        {renderCard(
          "Barredora",
          "Inspección y valoración de barredoras",
          "barredora",
          byType.barredora
        )}

        {renderCard(
          "Cámara (VCAM / Metrotech)",
          "Inspección con sistema de cámara",
          "camara",
          byType.camara
        )}

      </div>
    </div>
  );
}
