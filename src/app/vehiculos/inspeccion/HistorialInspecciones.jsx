import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  const [inspections, setInspections] = useState([]);

  /* =============================
     FILTROS
  ============================== */
  const [search, setSearch] = useState("");
  const [codigo, setCodigo] = useState("");
  const [fecha, setFecha] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [estado, setEstado] = useState("todos");
  const [equipo, setEquipo] = useState("todos");

  /* =============================
     CARGAR INSPECCIONES
  ============================== */
  useEffect(() => {
    if (!user?.id) return;

    const loadInspections = async () => {
let query = supabase
  .from("registros")
  .select("*")
  .eq("area", "vehiculos")
  .eq("tipo", "inspeccion")
  .order("created_at", { ascending: false });

      if (!isSuperAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setInspections([]);
        return;
      }

      setInspections(data || []);
    };

    loadInspections();
  }, [user?.id, isSuperAdmin]);

  const normalize = (txt) => String(txt || "").toLowerCase();

  /* =============================
     FILTRO GLOBAL
  ============================== */
  const filtered = inspections.filter((item) => {
    const cliente = normalize(item.data?.cliente);

    const cod = normalize(
      item.data?.codInf ||
        item.data?.codigo ||
        item.data?.pedidoDemanda
    );

    const tec = normalize(
      item.data?.tecnicoNombre ||
        item.data?.tecnicoResponsable ||
        item.data?.tecnico
    );

    const sub = normalize(item.subtipo);

    const matchSearch = cliente.includes(normalize(search));
    const matchCodigo = cod.includes(normalize(codigo));
    const matchTecnico = tec.includes(normalize(tecnico));

    const matchFecha = fecha
      ? new Date(item.updated_at || item.created_at)
          .toISOString()
          .slice(0, 10) === fecha
      : true;

    const matchEstado =
      estado === "todos" ? true : item.estado === estado;

    const matchEquipo =
      equipo === "todos" ? true : sub.includes(equipo);

    return (
      matchSearch &&
      matchCodigo &&
      matchTecnico &&
      matchFecha &&
      matchEstado &&
      matchEquipo
    );
  });

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (item) => {
    navigate(`/inspeccion/${item.subtipo}/${item.id}`);
  };

  const handleGeneratePdf = (item) => {
    navigate(`/inspeccion/${item.subtipo}/${item.id}/pdf`);
  };

  const handleDelete = async (item) => {
    if (!user?.id) {
      alert("Usuario no autenticado");
      return;
    }

    if (!confirm("¿Eliminar inspección?")) return;

 let query = supabase
  .from("registros")
  .delete()
  .eq("id", item.id)
  .eq("area", "vehiculos")
  .eq("tipo", "inspeccion");

    if (!isSuperAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { error } = await query;

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setInspections((prev) => prev.filter((i) => i.id !== item.id));
  };

  /* =============================
     CARD SIMPLE
  ============================== */
  const renderCard = (
  title,
  desc,
  type,
  colorBtn = "bg-blue-600 hover:bg-blue-700"
) => (
  <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>

      <button
        onClick={() => navigate(`/inspeccion/${type}/new`)}
        className={`${colorBtn} text-white py-2 rounded-lg text-sm transition`}
      >
        + Nueva inspección
      </button>
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

      {isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          Modo super administrador: estás viendo todas las inspecciones.
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {renderCard(
  "Hidrosuccionador",
  "Inspección general del equipo",
  "hidro",
  "bg-blue-600 hover:bg-blue-700"
)}

{renderCard(
  "Barredora",
  "Inspección de barredoras",
  "barredora",
  "bg-green-600 hover:bg-green-700"
)}

{renderCard(
  "Cámara",
  "Inspección con cámara",
  "camara",
  "bg-yellow-500 hover:bg-yellow-600"
)}      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        {/* ESTADO */}
        <div className="flex gap-2 flex-wrap">
          {["todos", "borrador", "completado"].map((s) => (
            <button
              key={s}
              onClick={() => setEstado(s)}
              className={`px-3 py-1 rounded text-sm ${
                estado === s ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* INPUTS */}
        <div className="grid md:grid-cols-5 gap-2">
          <input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded text-sm"
          />

          <input
            placeholder="Pedido / Código..."
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="border p-2 rounded text-sm"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border p-2 rounded text-sm"
          />

          <input
            placeholder="Técnico..."
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className="border p-2 rounded text-sm"
          />

          <select
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="todos">Equipo</option>
            <option value="hidro">Hidro</option>
            <option value="barredora">Barredora</option>
            <option value="cam">Cámara</option>
          </select>
        </div>
      </div>

      {/* LISTADO */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2 max-h-[400px] overflow-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400">Sin resultados</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-sm"
            >
              <div>
                <p className="text-[10px] text-gray-400 mb-1 uppercase">
                  {item.subtipo} - {item.estado}
                </p>

                <p className="font-semibold text-gray-900">
                  {item.data?.cliente || "Sin cliente"}
                </p>

                <p className="text-xs text-gray-600">
                  Pedido:{" "}
                  <strong>{item.data?.pedidoDemanda || "—"}</strong>{" "}
                  | Código:{" "}
                  <strong>
                    {item.data?.codInf || item.data?.codigo || "—"}
                  </strong>
                </p>

                <p className="text-xs text-gray-500 italic">
                  {item.data?.descripcion || "Sin descripción"}
                </p>

                <p className="text-xs text-gray-500">
                  Técnico:{" "}
                  <strong>
                    {item.data?.tecnicoNombre ||
                      item.data?.tecnicoResponsable ||
                      "—"}
                  </strong>
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(item.updated_at || item.created_at).toLocaleString()}
                </p>

                {isSuperAdmin && (
                  <p className="text-[10px] text-gray-400">
                    Usuario: {item.user_id || "—"}
                  </p>
                )}

                <p className="mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-white text-[10px] ${
                      item.estado === "completado"
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {item.estado === "completado" ? "Completado" : "Borrador"}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 text-xs shrink-0">
                {item.estado === "completado" && (
                  <button
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    PDF
                  </button>
                )}

                <button
                  onClick={() => handleOpen(item)}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </button>

                <button
                  onClick={() => handleDelete(item)}
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
}
