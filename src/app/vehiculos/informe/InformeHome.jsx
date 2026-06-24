import SyncStatus from "@/components/SyncStatus";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  canAccessRecord,
  getPermittedOwnerIds,
  getRecordAccessPermissionsForUser,
  mergeRecords,
} from "@/services/accessControlService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();

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

  const [reports, setReports] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [filter, setFilter] = useState("todos");

  const [filters, setFilters] = useState({
    cliente: "",
    pedido: "",
    fecha: "",
    tecnico: "",
  });

  /* ===========================
     CARGAR DATA
  =========================== */
  useEffect(() => {
    if (!user?.id) return;

    const loadReports = async () => {
      try {
        const permissions = await getRecordAccessPermissionsForUser(user.id);
        setAccessPermissions(permissions);

        /*
          REGLA:
          - Super admin ve todo.
          - Supervisor de proyecto ve todos los informes de vehículos.
          - Proveedor vehículos ve lo creado/asignado a su correo y dueños autorizados.
          - Técnico normal ve solo lo suyo.
        */
        const loadBaseQuery = () =>
          supabase
            .from("registros")
            .select("*")
            .eq("tipo", "informe")
            .order("created_at", { ascending: false });

        let data = [];
        let error = null;

        if (puedeVerTodoVehiculos) {
          const response = await loadBaseQuery();
          data = response.data || [];
          error = response.error;
        } else {
          const ownerIds = getPermittedOwnerIds(permissions, "vehiculos", "informe", "view");
          const [ownResponse, permittedResponse] = await Promise.all([
            loadBaseQuery().eq("data->>tecnicoCorreo", user.email),
            ownerIds.length > 0 ? loadBaseQuery().in("user_id", ownerIds) : Promise.resolve({ data: [], error: null }),
          ]);

          error = ownResponse.error || permittedResponse.error;
          data = mergeRecords(ownResponse.data || [], permittedResponse.data || []);
        }

        if (error) {
          console.error("Error:", error);
          setReports([]);
          return;
        }

        const soloVehiculos = (data || []).filter((r) => {
          const area = r.area || r.data?.area || "";

          return (
            area === "vehiculos" ||
            area === "" ||
            area === null ||
            area === undefined
          );
        });

        setReports(soloVehiculos);
      } catch (err) {
        console.error("Error cargando:", err);
        setReports([]);
      }
    };

    loadReports();
  }, [user?.id, user?.email, puedeVerTodoVehiculos]);

  const isOwnReport = (report) => {
    return report.user_id === user?.id || report.data?.tecnicoCorreo === user?.email;
  };

  const canEditReport = (report) => {
    return (
      puedeVerTodoVehiculos ||
      isOwnReport(report) ||
      canAccessRecord({
        record: report,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "edit",
      })
    );
  };

  const canDownloadReport = (report) => {
    return (
      puedeVerTodoVehiculos ||
      isOwnReport(report) ||
      canAccessRecord({
        record: report,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "download",
      })
    );
  };

  /* ===========================
     FILTROS
  =========================== */
  const filteredReports = reports.filter((r) => {
    const cliente = r.data?.cliente?.toLowerCase() || "";

    const pedido =
      r.data?.pedidoDemanda?.toLowerCase() ||
      r.data?.codInf?.toLowerCase() ||
      "";

    const tecnico = r.data?.tecnicoNombre?.toLowerCase() || "";
    const fecha = r.updated_at || r.created_at;

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      cliente.includes((filters.cliente || "").toLowerCase()) &&
      pedido.includes((filters.pedido || "").toLowerCase()) &&
      tecnico.includes((filters.tecnico || "").toLowerCase()) &&
      (!filters.fecha || (fecha && fecha.startsWith(filters.fecha)))
    );
  });

  /* ===========================
     ABRIR
  =========================== */
  const openReport = (report) => {
    if (!canEditReport(report)) {
      alert("No tienes permiso para editar este informe.");
      return;
    }

    navigate(`/vehiculos/informe/${report.id}`);
  };

  /* ===========================
     ELIMINAR
  =========================== */
  const deleteReport = async (id) => {
    if (!user?.id) {
      alert("Usuario no autenticado");
      return;
    }

    if (!confirm("¿Eliminar este informe?")) return;

    let query = supabase.from("registros").delete().eq("id", id);

    /*
      Solo super admin y supervisor de proyecto pueden eliminar cualquier informe de vehículos.
      Técnicos/proveedores solo pueden eliminar lo suyo.
    */
    if (!puedeVerTodoVehiculos) {
      query = query.eq("data->>tecnicoCorreo", user.email);
    }

    const { error } = await query;

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          Informe General de Servicio Técnico
        </h1>

        <div className="flex items-center gap-3">
          <SyncStatus />

          <button
            onClick={() => navigate("/area/vehiculos")}
            className="border border-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 transition"
          >
            Volver
          </button>
        </div>
      </div>

      {/* AVISO SUPER ADMIN / SUPERVISOR */}
      {superAdminActivo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          Modo super administrador: estás viendo todos los informes de vehículos.
        </div>
      )}

      {!superAdminActivo && supervisorProyectoActivo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm">
          Modo supervisor de proyecto: estás viendo todos los informes de vehículos.
        </div>
      )}

      {proveedorVehiculosActivo && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Acceso proveedor: puedes ver tus informes y los registros autorizados por administración.
        </div>
      )}

      {/* NUEVO */}
      <button
        onClick={() => navigate("/vehiculos/informe/nuevo")}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg transition"
      >
        Nuevo Informe General de Servicio Técnico
      </button>

      {/* FILTRO ESTADO */}
      <div className="flex gap-2">
        {["todos", "borrador", "completado"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border rounded text-sm ${
              filter === f
                ? "bg-gray-200 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* FILTROS INPUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={filters.cliente}
          onChange={(e) =>
            setFilters((f) => ({ ...f, cliente: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />

        <input
          type="text"
          placeholder="Pedido / Código..."
          value={filters.pedido}
          onChange={(e) =>
            setFilters((f) => ({ ...f, pedido: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />

        <input
          type="date"
          value={filters.fecha}
          onChange={(e) =>
            setFilters((f) => ({ ...f, fecha: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />

        <input
          type="text"
          placeholder="Técnico..."
          value={filters.tecnico}
          onChange={(e) =>
            setFilters((f) => ({ ...f, tecnico: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />
      </div>

      {/* LISTADO */}
      <div className="space-y-3">
        {filteredReports.length === 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 text-gray-500">
            Sin registros
          </div>
        )}

        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="bg-gray-50 border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
          >
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">
                {r.data?.cliente || "Sin cliente"}
              </p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <span>
                  Pedido:{" "}
                  <strong className="text-gray-800">
                    {r.data?.pedidoDemanda || "—"}
                  </strong>
                </span>

                <span>
                  Informe:{" "}
                  <strong className="text-gray-800">
                    {r.data?.codInf || "—"}
                  </strong>
                </span>
              </div>

              <p className="text-xs text-gray-500 italic">
                {r.data?.referenciaContrato || "Sin descripción"}
              </p>

              <div className="flex flex-wrap justify-between items-center text-xs pt-1 gap-3">
                <span className="text-gray-500">
                  {new Date(r.updated_at || r.created_at).toLocaleString()}
                </span>

                {puedeVerTodoVehiculos && (
                  <span className="text-[11px] text-gray-500">
                    Usuario: {r.data?.tecnicoNombre || "Sin técnico"}{" "}
                    {r.data?.tecnicoCorreo ? `(${r.data.tecnicoCorreo})` : ""}
                  </span>
                )}

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    r.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {r.estado === "completado" ? "Completado" : "Borrador"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 text-sm shrink-0">
              <button
                onClick={() => navigate(`/vehiculos/informe/ver/${r.id}`)}
                className="text-slate-600 hover:underline font-semibold"
              >
                Ver
              </button>

              {canEditReport(r) && (
                <button
                  onClick={() => openReport(r)}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </button>
              )}

              {r.estado === "completado" && canDownloadReport(r) && (
                <button
                  onClick={() => navigate(`/vehiculos/informe/pdf/${r.id}`)}
                  className="text-green-600 hover:underline font-semibold"
                >
                  PDF
                </button>
              )}

              {(puedeVerTodoVehiculos || isOwnReport(r)) && (
                <button
                  onClick={() => deleteReport(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
