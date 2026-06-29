import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  canAccessRecord,
  getPermittedOwnerIds,
  getRecordAccessPermissionsForUser,
  mergeRecords,
} from "@/services/accessControlService";

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const { isLight } = useTheme();

  const {
    user,
    isSuperAdmin,
    isSupervisorProyecto,
    isProveedorVehiculos,
  } = useAuth();

  const superAdminActivo =
    typeof isSuperAdmin === "function"
      ? isSuperAdmin()
      : !!isSuperAdmin;

  const supervisorProyectoActivo =
    typeof isSupervisorProyecto === "function"
      ? isSupervisorProyecto()
      : !!isSupervisorProyecto;

  const proveedorVehiculosActivo =
    typeof isProveedorVehiculos === "function"
      ? isProveedorVehiculos()
      : !!isProveedorVehiculos;

  const puedeVerTodoVehiculos =
    superAdminActivo || supervisorProyectoActivo;

  const [inspections, setInspections] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);

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
      const permissions = await getRecordAccessPermissionsForUser(user.id);
      setAccessPermissions(permissions);

      /*
        REGLA:
        - Super admin ve todo.
        - Supervisor de proyecto ve todas las inspecciones de vehículos.
        - Proveedor vehículos ve lo suyo y dueños autorizados.
        - Técnico normal ve solo lo suyo.
      */
      const loadBaseQuery = () =>
        supabase
          .from("registros")
          .select("*")
          .eq("tipo", "inspeccion")
          .or("area.eq.vehiculos,area.is.null")
          .order("created_at", { ascending: false });

      let data = [];
      let error = null;

      if (puedeVerTodoVehiculos) {
        const response = await loadBaseQuery();
        data = response.data || [];
        error = response.error;
      } else {
        const ownerIds = getPermittedOwnerIds(permissions, "vehiculos", "inspeccion", "view");
        const [ownResponse, permittedResponse] = await Promise.all([
          loadBaseQuery().eq("user_id", user.id),
          ownerIds.length > 0 ? loadBaseQuery().in("user_id", ownerIds) : Promise.resolve({ data: [], error: null }),
        ]);

        error = ownResponse.error || permittedResponse.error;
        data = mergeRecords(ownResponse.data || [], permittedResponse.data || []);
      }

      if (error) {
        console.error(error);
        setInspections([]);
        return;
      }

      setInspections(data || []);
    };

    loadInspections();
  }, [user?.id, puedeVerTodoVehiculos]);

  const isOwnInspection = (item) => item.user_id === user?.id;

  const canEditInspection = (item) => {
    return (
      puedeVerTodoVehiculos ||
      isOwnInspection(item) ||
      canAccessRecord({
        record: item,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "edit",
      })
    );
  };

  const canDownloadInspection = (item) => {
    return (
      puedeVerTodoVehiculos ||
      isOwnInspection(item) ||
      canAccessRecord({
        record: item,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "download",
      })
    );
  };

  const normalize = (txt) => String(txt || "").toLowerCase();
  const subtipoLabels = {
    hidro: "Hidrosuccionador",
    barredora: "Barredora Pelican",
    "barredora-road-wizard": "Barredora Road Wizard",
    camara: "Cámara",
  };

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
      equipo === "todos"
        ? true
        : equipo === "barredora" || equipo === "barredora-road-wizard"
        ? sub === equipo
        : sub.includes(equipo);

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
    if (!canEditInspection(item)) {
      alert("No tienes permiso para editar esta inspección.");
      return;
    }

    navigate(`/vehiculos/inspeccion/${item.subtipo}/${item.id}`);
  };

  const handleGeneratePdf = (item) => {
    if (!canDownloadInspection(item)) {
      alert("No tienes permiso para descargar esta inspección.");
      return;
    }

    navigate(`/vehiculos/inspeccion/${item.subtipo}/${item.id}/pdf`);
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
      .eq("tipo", "inspeccion");

    /*
      Solo super admin y supervisor de proyecto pueden eliminar cualquier inspección de vehículos.
      Técnicos/proveedores solo eliminan lo suyo.
    */
    if (!puedeVerTodoVehiculos) {
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
        onClick={() => navigate(`/vehiculos/inspeccion/${type}/new`)}
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
        <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
          Inspección y valoración
        </h1>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className={`border px-4 py-1 rounded text-sm transition ${
            isLight
              ? "border-slate-300 text-slate-700 hover:bg-slate-100"
              : "border-white/20 text-white hover:bg-white/10"
          }`}
        >
          ← Volver
        </button>
      </div>

      {superAdminActivo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          Modo super administrador: estás viendo todas las inspecciones de vehículos.
        </div>
      )}

      {!superAdminActivo && supervisorProyectoActivo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm">
          Modo supervisor de proyecto: estás viendo todas las inspecciones de vehículos.
        </div>
      )}

      {proveedorVehiculosActivo && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Acceso proveedor: puedes ver tus inspecciones y los registros autorizados por administración.
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {renderCard(
          "Hidrosuccionador",
          "Inspección general del equipo",
          "hidro",
          "bg-blue-600 hover:bg-blue-700"
        )}

        {renderCard(
          "Barredora Pelican",
          "Inspección de barredora Pelican",
          "barredora",
          "bg-green-600 hover:bg-green-700"
        )}

        {renderCard(
          "Barredora Road Wizard",
          "Inspección de barredora Road Wizard",
          "barredora-road-wizard",
          "bg-teal-600 hover:bg-teal-700"
        )}

        {renderCard(
          "Cámara",
          "Inspección con cámara",
          "camara",
          "bg-yellow-500 hover:bg-yellow-600"
        )}
      </div>

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
            <option value="barredora">Barredora Pelican</option>
            <option value="barredora-road-wizard">Barredora Road Wizard</option>
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
                  {subtipoLabels[item.subtipo] || item.subtipo} - {item.estado}
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

                {puedeVerTodoVehiculos && (
                  <p className="text-[10px] text-gray-400">
                    Usuario:{" "}
                    {item.data?.tecnicoNombre ||
                      item.data?.tecnicoResponsable ||
                      "Sin técnico"}{" "}
                    {item.data?.tecnicoCorreo
                      ? `(${item.data.tecnicoCorreo})`
                      : ""}
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
                {item.estado === "completado" && canDownloadInspection(item) && (
                  <button
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    PDF
                  </button>
                )}

                {canEditInspection(item) && (
                  <button
                    onClick={() => handleOpen(item)}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </button>
                )}

                {(puedeVerTodoVehiculos || isOwnInspection(item)) && (
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
