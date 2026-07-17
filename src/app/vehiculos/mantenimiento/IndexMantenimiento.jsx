import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";
import {
  canAccessRecord,
  getPermittedOwnerEmails,
  getPermittedOwnerIds,
  getRecordAccessPermissionsForUser,
  mergeRecords,
} from "@/services/accessControlService";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";

const tipos = [
  {
    type: "hidro",
    title: "Hidrosuccionador",
    desc: "Mantenimiento preventivo del módulo de hidrosuccionador, no incluye servicios de chasis.",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  {
    type: "barredora",
    title: "Barredora Pelican",
    desc: "Mantenimiento del módulo de barrido incluye motor de combustión interna.",
    btn: "bg-green-600 hover:bg-green-700",
  },
  {
    type: "barredora-road-wizard",
    title: "Barredora Road Wizard",
    desc: "Mantenimiento del módulo barredora Road Wizard incluye motor auxiliar, no incluye servicio de chasis.",
    btn: "bg-teal-600 hover:bg-teal-700",
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

  const [items, setItems] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [estado, setEstado] = useState("todos");

  const [filters, setFilters] = useState({
    cliente: "",
    codigo: "",
    tecnico: "",
    equipo: "",
  });

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const permissions = await getRecordAccessPermissionsForUser(user.id);
      setAccessPermissions(permissions);

      /*
        REGLA:
        - Super admin ve todo.
        - Supervisor de proyecto ve todos los mantenimientos de vehículos.
        - Proveedor vehículos ve lo suyo y dueños autorizados.
        - Técnico normal ve solo lo suyo.
      */
      const loadBaseQuery = () =>
        supabase
          .from("registros")
          .select("*")
          .eq("area", "vehiculos")
          .eq("tipo", "mantenimiento")
          .order("updated_at", { ascending: false });

      let data = [];
      let error = null;

      if (puedeVerTodoVehiculos) {
        const response = await loadBaseQuery();
        data = response.data || [];
        error = response.error;
      } else {
        const ownerIds = getPermittedOwnerIds(permissions, "vehiculos", "mantenimiento", "view");
        const ownerEmails = getPermittedOwnerEmails(permissions, "vehiculos", "mantenimiento", "view");
        const [ownResponse, permittedResponse, permittedByTechResponse] = await Promise.all([
          loadBaseQuery().eq("data->>tecnicoCorreo", user.email),
          ownerIds.length > 0 ? loadBaseQuery().in("user_id", ownerIds) : Promise.resolve({ data: [], error: null }),
          ownerEmails.length > 0 ? loadBaseQuery().in("data->>tecnicoCorreo", ownerEmails) : Promise.resolve({ data: [], error: null }),
        ]);

        error = ownResponse.error || permittedResponse.error || permittedByTechResponse.error;
        data = mergeRecords(ownResponse.data || [], permittedResponse.data || [], permittedByTechResponse.data || []);
      }

      if (error) {
        console.error(error);
        setItems([]);
        return;
      }

      if (!puedeVerTodoVehiculos) {
        data = (data || []).filter((item) => {
          return item.user_id === user.id || item.data?.tecnicoCorreo === user.email || canAccessRecord({
            record: item,
            userId: user.id,
            permissions,
            isSuperAdmin: superAdminActivo,
            action: "view",
          });
        });
      }

      setItems(data || []);
    };

    load();
  }, [user?.id, user?.email, puedeVerTodoVehiculos]);

  const isOwnMaintenance = (item) => {
    return item.user_id === user?.id || item.data?.tecnicoCorreo === user?.email;
  };

  const canEditMaintenance = (item) => {
    return (
      puedeVerTodoVehiculos ||
      isOwnMaintenance(item) ||
      canAccessRecord({
        record: item,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "edit",
      })
    );
  };

  const canDownloadMaintenance = (item) => {
    return (
      puedeVerTodoVehiculos ||
      isOwnMaintenance(item) ||
      canAccessRecord({
        record: item,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "download",
      })
    );
  };

  const handleDelete = async (item) => {
    if (!user?.id) {
      alert("Debes iniciar sesión para realizar esta acción.");
      return;
    }

    if (!confirm("¿Eliminar mantenimiento?")) return;

    let query = supabase
      .from("registros")
      .delete()
      .eq("id", item.id)
      .eq("area", "vehiculos")
      .eq("tipo", "mantenimiento");

    /*
      Solo super admin y supervisor de proyecto pueden eliminar cualquier mantenimiento.
      Técnicos/proveedores solo eliminan lo suyo.
    */
    if (!puedeVerTodoVehiculos) {
      query = query.eq("data->>tecnicoCorreo", user.email);
    }

    const { error } = await query;

    if (error) {
      console.error(error);
      alert("No se pudo eliminar el mantenimiento. Intenta de nuevo.");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleDuplicate = async (item) => {
    if (!canEditMaintenance(item)) {
      alert("No tienes permiso para duplicar este mantenimiento.");
      return;
    }

    if (!confirm("¿Duplicar este mantenimiento como borrador sin código de informe?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(item, user);
      navigate(`/vehiculos/mantenimiento/${duplicated.subtipo}/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando mantenimiento:", error);
      alert("No se pudo duplicar el mantenimiento.");
    }
  };

  const filtered = useMemo(() => {
    return (items || []).filter((item) => {
      const d = item.data || {};
      const equipo = d.equipo || {};

      const cliente = (d.cliente || "").toLowerCase();
      const codigo = `${d.codInf || ""} ${d.pedidoDemanda || ""}`.toLowerCase();
      const tecnico = (d.tecnicoNombre || "").toLowerCase();
      return (
        (estado === "todos" || item.estado === estado) &&
        cliente.includes(filters.cliente.toLowerCase()) &&
        codigo.includes(filters.codigo.toLowerCase()) &&
        tecnico.includes(filters.tecnico.toLowerCase()) &&
        (filters.equipo === "" || item.subtipo === filters.equipo)
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
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            {VEHICULOS_TEXT.mantenimiento.title}
          </h1>
          <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            {VEHICULOS_TEXT.mantenimiento.description}
          </p>
        </div>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className="btn-volver-orange py-1"
        >
          ← Volver
        </button>
      </div>

      {superAdminActivo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          Modo super administrador: estás viendo todos los mantenimientos de vehículos.
        </div>
      )}

      {!superAdminActivo && supervisorProyectoActivo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm">
          Modo supervisor de proyecto: estás viendo todos los mantenimientos de vehículos.
        </div>
      )}

      {proveedorVehiculosActivo && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Acceso proveedor: puedes ver tus mantenimientos y los registros autorizados por administración.
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tipos.map(renderCard)}
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl p-5 shadow border space-y-4">
        <div className="flex gap-2 flex-wrap">
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
            <option value="barredora">Barredora Pelican</option>
            <option value="barredora-road-wizard">Barredora Road Wizard</option>
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
                      {tipoInfo?.title || item.subtipo} · {equipo.marca || "—"}{" "}
                      {equipo.modelo || ""}
                    </p>

                    <p className="text-xs text-gray-600">
                      Pedido: <strong>{d.pedidoDemanda || "—"}</strong> | Código:{" "}
                      <strong>{d.codInf || d.codigo || "—"}</strong>
                    </p>

                    <p className="text-xs text-gray-500">
                      Técnico: <strong>{d.tecnicoNombre || "—"}</strong>
                    </p>

                    {puedeVerTodoVehiculos && (
                      <p className="text-[11px] text-gray-400">
                        Usuario: {d.tecnicoNombre || "Sin técnico"}{" "}
                        {d.tecnicoCorreo ? `(${d.tecnicoCorreo})` : ""}
                      </p>
                    )}

                    <p className="text-[11px] text-gray-400">
                      {new Date(item.updated_at || item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() =>
                        navigate(`/vehiculos/mantenimiento/${item.subtipo}/ver/${item.id}`)
                      }
                      className="font-semibold text-slate-600 hover:underline"
                    >
                      Ver
                    </button>

                    {canEditMaintenance(item) && (
                      <button
                        onClick={() =>
                          navigate(`/vehiculos/mantenimiento/${item.subtipo}/${item.id}`)
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Abrir
                      </button>
                    )}

                    {item.estado === "completado" && canDownloadMaintenance(item) && (
                      <button
                        onClick={() =>
                          navigate(`/vehiculos/mantenimiento/${item.subtipo}/${item.id}/pdf`)
                        }
                        className="text-green-600 hover:underline font-semibold"
                      >
                        PDF
                      </button>
                    )}

                    {canEditMaintenance(item) && (
                      <button
                        onClick={() => handleDuplicate(item)}
                        className="text-amber-600 hover:underline font-semibold"
                      >
                        Duplicar
                      </button>
                    )}

                    {(puedeVerTodoVehiculos || isOwnMaintenance(item)) && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
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
