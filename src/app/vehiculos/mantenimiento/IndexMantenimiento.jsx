import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function IndexMantenimiento() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  /* =============================
     CARGAR DATOS
  ============================== */
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("tipo", "mantenimiento")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setItems([]);
        return;
      }

      setItems(data || []);
    };

    load();
  }, []);

  /* =============================
     AGRUPAR
  ============================== */
  const safe = Array.isArray(items) ? items : [];

  const byType = {
    hidro: safe.filter((i) => i.subtipo === "hidro"),
    barredora: safe.filter((i) => i.subtipo === "barredora"),
  };

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (type, id) => {
    navigate(`/mantenimiento/${type}/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar mantenimiento?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* =============================
     CARD REUTILIZABLE
  ============================== */
  const renderCard = (title, desc, type, list, colorBtn) => (
    <div className="bg-white rounded-xl p-5 shadow border border-gray-200 space-y-4 hover:shadow-lg hover:-translate-y-1 transition duration-300">

      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-600">{desc}</p>
      </div>

      <button
        onClick={() => navigate(`/mantenimiento/${type}/new`)}
        className={`px-3 py-2 ${colorBtn} hover:opacity-90 text-white rounded text-sm transition`}
      >
        Crear mantenimiento
      </button>

      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-xs text-gray-600">
            Sin registros
          </p>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  {item.data?.cliente || "Sin cliente"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.estado}
                </span>
              </div>

              <span className="text-[10px] text-gray-500">
                {new Date(
                  item.updated_at || item.created_at
                ).toLocaleString()}
              </span>

              <div className="flex gap-3 pt-1 text-xs">
                <button
                  onClick={() => handleOpen(type, item.id)}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:underline"
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
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">
          Servicio de mantenimiento
        </h1>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className="border border-gray-300 text-white bg-transparent px-4 py-1 rounded text-sm hover:bg-white/10 transition"
        >
          ← Volver
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {renderCard(
          "Mantenimiento Hidrosuccionador",
          "Control de mantenimiento preventivo de equipos",
          "hidro",
          byType.hidro,
          "bg-blue-600"
        )}

        {renderCard(
          "Mantenimiento Barredora",
          "Gestión de mantenimiento de barredoras",
          "barredora",
          byType.barredora,
          "bg-green-600"
        )}

      </div>
    </div>
  );
}
