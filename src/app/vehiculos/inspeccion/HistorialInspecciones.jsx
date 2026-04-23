import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function IndexInspeccion() {
  const navigate = useNavigate();
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

  const normalize = (txt) => txt?.toLowerCase() || "";

  /* =============================
     FILTRO GLOBAL
  ============================== */
  const filtered = inspections.filter((item) => {
    const cliente = normalize(item.data?.cliente);
    const cod = normalize(item.data?.codigo);
    const tec = normalize(item.data?.tecnicoResponsable);
    const sub = normalize(item.subtipo);

    const matchSearch = cliente.includes(normalize(search));
    const matchCodigo = cod.includes(normalize(codigo));
    const matchTecnico = tec.includes(normalize(tecnico));

    const matchFecha = fecha
      ? new Date(item.created_at).toISOString().slice(0, 10) === fecha
      : true;

    const matchEstado =
      estado === "todos" ? true : item.estado === estado;

    const matchEquipo =
      equipo === "todos"
        ? true
        : normalize(item.subtipo).includes(equipo);

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
    navigate(`/inspeccion/pdf/${item.id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar inspección?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error eliminando ❌");
      return;
    }

    setInspections((prev) => prev.filter((i) => i.id !== id));
  };

  /* =============================
     CARD SIMPLE (SIN HISTORIAL)
  ============================== */
  const renderCard = (title, desc, type) => (
    <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>

      <button
        onClick={() => navigate(`/inspeccion/${type}/new`)}
        className="bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-500 transition"
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

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderCard("Hidrosuccionador", "Inspección general del equipo", "hidro")}
        {renderCard("Barredora", "Inspección de barredoras", "barredora")}
        {renderCard("Cámara", "Inspección con cámara", "camara")}
      </div>

      {/* =============================
         FILTROS (IGUAL QUE INFORMES)
      ============================== */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4">

        {/* ESTADO */}
        <div className="flex gap-2 flex-wrap">
          {["todos", "borrador", "completado"].map((s) => (
            <button
              key={s}
              onClick={() => setEstado(s)}
              className={`px-3 py-1 rounded text-sm ${
                estado === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
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
            placeholder="Código..."
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

      {/* =============================
         LISTADO
      ============================== */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2 max-h-[400px] overflow-auto">

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400">Sin resultados</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 flex justify-between items-center text-sm"
            >
              <div>
                <p className="font-medium">
                  {item.data?.cliente || "Sin cliente"}
                </p>
                <p className="text-xs text-gray-500">
                  {item.subtipo} - {item.estado}
                </p>
              </div>

              <div className="flex gap-3 text-xs">

                {item.estado === "completado" && (
                  <button
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-600"
                  >
                    PDF
                  </button>
                )}

                <button
                  onClick={() => handleOpen(item)}
                  className="text-blue-600"
                >
                  Abrir
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600"
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
