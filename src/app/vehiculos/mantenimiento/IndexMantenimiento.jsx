import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const tipos = [
  {
    type: "hidro",
    title: "Hidrosuccionador",
    desc: "Mantenimiento preventivo de hidrosuccionador",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  {
    type: "barredora",
    title: "Barredora",
    desc: "Mantenimiento de barredoras",
    btn: "bg-green-600 hover:bg-green-700",
  },
  {
    type: "vcam",
    title: "Cámara V-Cam6",
    desc: "Mantenimiento de cámara de inspección",
    btn: "bg-yellow-500 hover:bg-yellow-600",
  },
];

export default function IndexMantenimiento() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  const superAdminActivo =
    typeof isSuperAdmin === "function"
      ? isSuperAdmin()
      : !!isSuperAdmin;

  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState("todos");

  const [filters, setFilters] = useState({
    cliente: "",
    codigo: "",
    tecnico: "",
    equipo: "",
  });

  useEffect(() => {
    const load = async () => {
     let query = supabase
  .from("registros")
  .select("*")
  .eq("area", "vehiculos")
  .eq("tipo", "mantenimiento")
  .order("updated_at", { ascending: false });

if (!superAdminActivo) {
  query = query.eq("data->>tecnicoCorreo", user.email);
}

const { data, error } = await query;
      if (error) {
        console.error(error);
        setItems([]);
        return;
      }

      setItems(data || []);
    };

    load();
  }, [user?.email, superAdminActivo]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar mantenimiento?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id)
      .eq("area", "vehiculos")
      .eq("tipo", "mantenimiento");

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = useMemo(() => {
    return (items || []).filter((item) => {
      const d = item.data || {};
      const equipo = d.equipo || {};

      const cliente = (d.cliente || "").toLowerCase();
      const codigo = `${d.codInf || ""} ${d.pedidoDemanda || ""}`.toLowerCase();
      const tecnico = (d.tecnicoNombre || "").toLowerCase();
      const equipoTxt = `${equipo.marca || ""} ${equipo.modelo || ""} ${equipo.placa || ""} ${equipo.serie || ""}`.toLowerCase();

      return (
        (estado === "todos" || item.estado === estado) &&
        cliente.includes(filters.cliente.toLowerCase()) &&
        codigo.includes(filters.codigo.toLowerCase()) &&
        tecnico.includes(filters.tecnico.toLowerCase()) &&
        (filters.equipo === "" || item.subtipo === filters.equipo || equipoTxt.includes(filters.equipo.toLowerCase()))
      );
    });
  }, [items, estado, filters]);

  const renderCard = ({ type, title, desc, btn }) => (
    <div
      key={type}
      className="bg-white rounded-xl p-5 shadow border border-gray-200 space-y-4"
    >
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>

      <button
        onClick={() => navigate(`/vehiculos/mantenimiento/${type}/new`)}
        className={`w-full px-4 py-2 text-white rounded text-sm transition ${btn}`}
      >
        + Nuevo mantenimiento
      </button>
    </div>
  );

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

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tipos.map(renderCard)}
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl p-5 shadow border space-y-4">
        <div className="flex gap-2">
          {["todos", "borrador", "completado"].map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`px-4 py-2 rounded text-sm ${
                estado === e
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Buscar cliente..."
            value={filters.cliente}
            onChange={(e) =>
              setFilters((f) => ({ ...f, cliente: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm"
          />

          <input
            placeholder="Pedido / Código..."
            value={filters.codigo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, codigo: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm"
          />

          <input
            placeholder="Técnico..."
            value={filters.tecnico}
            onChange={(e) =>
              setFilters((f) => ({ ...f, tecnico: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm"
          />

          <select
            value={filters.equipo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, equipo: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Equipo</option>
            <option value="hidro">Hidrosuccionador</option>
            <option value="barredora">Barredora</option>
            <option value="vcam">Cámara V-Cam6</option>
          </select>
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-xl p-5 shadow border">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin resultados</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const d = item.data || {};
              const equipo = d.equipo || {};
              const tipoInfo = tipos.find((t) => t.type === item.subtipo);

              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {d.cliente || "Sin cliente"}
                      </h3>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.estado === "completado"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.estado || "borrador"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">
                      {tipoInfo?.title || item.subtipo} · {equipo.marca || "—"} {equipo.modelo || ""}
                    </p>

                    <p className="text-[11px] text-gray-400">
                      {new Date(item.updated_at || item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() =>
                        navigate(`/vehiculos/mantenimiento/${item.subtipo}/${item.id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Abrir
                    </button>

                    {item.estado === "completado" && (
                      <button
                        onClick={() =>
                          navigate(`/vehiculos/mantenimiento/${item.subtipo}/${item.id}/pdf`)
                        }
                        className="text-green-600 hover:underline font-semibold"
                      >
                        PDF
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
