import { deleteRegistro, getAllRegistros, createRegistro } from "@/utils/registroStorage";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ estado }) => {
  const styles = {
    salida: "bg-yellow-100 text-yellow-800",
    completado: "bg-green-100 text-green-800",
    borrador: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[estado] || "bg-gray-100 text-gray-700"
      }`}
    >
      {estado || "—"}
    </span>
  );
};

export default function RegistroHome() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [filter, setFilter] = useState("todas");
  const [loading, setLoading] = useState(true);

  // ✅ Carga desde tabla "registros" con filtros correctos (via getAllRegistros)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getAllRegistros();
      const safe = Array.isArray(data) ? data : [];
      setRegistros(safe);
      setLoading(false);
    };

    loadData();
  }, []);

  const filtered = registros
    .filter((r) => (filter === "todas" ? true : r.estado === filter))
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    );

  // ✅ Crear nuevo registro y navegar al formulario
  const crearNuevoRegistro = async () => {
    const result = await createRegistro({ data: { items: [] } });
    if (!result?.id) return;
    navigate(`/registro/${result.id}`);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;

    const ok = await deleteRegistro(id);
    if (ok) {
      setRegistros((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            Control de salida e ingreso de herramientas
          </h1>

          <button
            onClick={crearNuevoRegistro}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            + Nuevo registro
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 text-xs">
          {["todas", "salida", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded border ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LISTA */}
        {loading ? (
          <p className="text-sm text-gray-400">Cargando registros...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No hay registros aún.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => {
              const items = item.data?.items || [];
              const total = items.length;
              const ingresadas = items.filter((i) => i.imagenIngresoUrl).length;
              const pendientes = total - ingresadas;
              const tecnico = items[0]?.tecnicoSalida || "Sin técnico";
              const pedido = items[0]?.pedido;

              return (
                <li
                  key={item.id}
                  className="border rounded-lg p-4 bg-white flex justify-between items-start shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* INFO */}
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      <span
                        className={`font-semibold ${
                          item.estado === "completado"
                            ? "text-green-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {item.estado === "completado"
                          ? "REGISTRO CERRADO"
                          : "EN CAMPO"}
                      </span>
                      {" – "}
                      {tecnico}
                    </p>

                    {pedido && (
                      <p className="text-slate-500 text-xs">
                        Pedido: {pedido}
                      </p>
                    )}

                    <p className="text-slate-500 text-xs">
                      {total} herramienta{total !== 1 ? "s" : ""}
                    </p>

                    {total > 0 && (
                      <p className="text-xs mt-1">
                        <span className="text-green-600">
                          🟢 {ingresadas} ingresada{ingresadas !== 1 ? "s" : ""}
                        </span>
                        {"  "}
                        <span className="text-red-600">
                          🔴 {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
                        </span>
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      {new Date(
                        item.created_at || item.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* ACCIONES */}
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <StatusBadge estado={item.estado} />

                    <button
                      onClick={() => navigate(`/registro/${item.id}`)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Abrir
                    </button>

                    <button
                      onClick={() => handleEliminar(item.id)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
