import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function IndexMantenimiento() {
  const navigate = useNavigate();

  const [filtroHidro, setFiltroHidro] = useState("todos");
  const [filtroBarredora, setFiltroBarredora] = useState("todos");

  const [hidro, setHidro] = useState([]);
  const [barredora, setBarredora] = useState([]);

  useEffect(() => {
    setHidro(
      JSON.parse(localStorage.getItem("mantenimiento-hidro") || "[]")
    );
    setBarredora(
      JSON.parse(localStorage.getItem("mantenimiento-barredora") || "[]")
    );
  }, []);

  /* =============================
     ELIMINAR REGISTROS
  ============================= */
  const handleDeleteHidro = (id) => {
    if (!window.confirm("¿Eliminar este mantenimiento?")) return;

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-hidro")) || [];

    const updated = stored.filter((r) => r.id !== id);

    localStorage.setItem(
      "mantenimiento-hidro",
      JSON.stringify(updated)
    );

    setHidro(updated);
  };

  const handleDeleteBarredora = (id) => {
    if (!window.confirm("¿Eliminar este mantenimiento?")) return;

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-barredora")) || [];

    const updated = stored.filter((r) => r.id !== id);

    localStorage.setItem(
      "mantenimiento-barredora",
      JSON.stringify(updated)
    );

    setBarredora(updated);
  };

  /* =============================
     FILTRO
  ============================= */
  const filtrar = (data, filtro) => {
    if (filtro === "todos") return data;
    return data.filter((i) => i.estado === filtro);
  };

  /* =============================
     RENDER HISTORIAL
  ============================= */
  const renderHistorico = (
    data,
    basePath,
    filtro,
    onDelete
  ) => {
    const lista = filtrar(data, filtro);

    if (lista.length === 0) {
      return <p className="text-xs text-gray-400">Sin registros</p>;
    }

    return lista.map((item) => (
      <div
        key={item.id}
        className="border rounded p-3 text-sm space-y-2"
      >
        {/* INFO */}
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            {item.codInf || "Sin código"}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              item.estado === "completado"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {item.estado}
          </span>
        </div>

        {/* BOTONES */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => navigate(`${basePath}/${item.id}`)}
            className="border px-3 py-1 rounded"
          >
            Abrir
          </button>

          <button
            onClick={() => navigate(`${basePath}/${item.id}/pdf`)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Ver PDF
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="text-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto my-8 space-y-6">
      {/* VOLVER */}
      <button
        onClick={() => navigate("/")}
        className="text-sm border px-4 py-2 rounded"
      >
        ← Volver
      </button>

      <h1 className="text-xl font-semibold">
        Servicio de mantenimiento
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ================= HIDRO ================= */}
        <section className="border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">
            Mantenimiento Hidrosuccionador
          </h2>

          <button
            onClick={() => navigate("/mantenimiento/hidro/crear")}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Crear mantenimiento
          </button>

          <div className="flex gap-2 text-xs">
            {["todos", "borrador", "completado"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltroHidro(f)}
                className={`px-3 py-1 rounded border ${
                  filtroHidro === f ? "bg-black text-white" : ""
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {renderHistorico(
              hidro,
              "/mantenimiento/hidro",
              filtroHidro,
              handleDeleteHidro
            )}
          </div>
        </section>

        {/* ================= BARREDORA ================= */}
        <section className="border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">
            Mantenimiento Barredora
          </h2>

          <button
            onClick={() => navigate("/mantenimiento/barredora/crear")}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Crear mantenimiento
          </button>

          <div className="flex gap-2 text-xs">
            {["todos", "borrador", "completado"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltroBarredora(f)}
                className={`px-3 py-1 rounded border ${
                  filtroBarredora === f ? "bg-black text-white" : ""
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {renderHistorico(
              barredora,
              "/mantenimiento/barredora",
              filtroBarredora,
              handleDeleteBarredora
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
