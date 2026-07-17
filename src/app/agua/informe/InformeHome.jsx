import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  canAccessRecord,
  getPermittedOwnerEmails,
  getPermittedOwnerIds,
  getRecordAccessPermissionsForUser,
  mergeRecords,
} from "@/services/accessControlService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";
import { getUserOptionLabel, recordMatchesUser, useUserOptions } from "@/hooks/useUserOptions";

const informeTipos = {
  bomba: {
    label: "Informe de bombas",
    description: "Informe para levantamiento de estado actual o inspección de bombas",
  },
  valvula: {
    label: "Informe de válvulas",
    description: "Informe para levantamiento de estado actual o inspección de válvulas",
  },
};

const getInformeTipo = (report) => report?.subtipo || report?.data?.tipoInforme || "bomba";

export default function InformeHome({
  tipo = null,
  area = "agua",
  areaLabel = "Agua",
  basePath = "/agua/informe",
  areaPath = "/area/agua",
}) {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { users: userOptions } = useUserOptions();
  const tipoConfig = tipo ? informeTipos[tipo] : null;
  const superAdminActivo =
    typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;

  const [reports, setReports] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [filters, setFilters] = useState({
    cliente: "",
    pedido: "",
    fecha: "",
    tecnico: "",
  });

  useEffect(() => {
    if (!user?.id) return;

    const loadReports = async () => {
      try {
        const permissions = await getRecordAccessPermissionsForUser(user.id);
        setAccessPermissions(permissions);

        const loadBaseQuery = () =>
          supabase
            .from("registros")
            .select("*")
            .eq("area", area)
            .eq("tipo", "informe")
            .order("created_at", { ascending: false });

        let data = [];
        let error = null;

        if (superAdminActivo) {
          const response = await loadBaseQuery();
          data = response.data || [];
          error = response.error;
        } else {
          const ownerIds = getPermittedOwnerIds(permissions, area, "informe", "view");
          const ownerEmails = getPermittedOwnerEmails(permissions, area, "informe", "view");
          const [ownResponse, permittedResponse, permittedByTechResponse] = await Promise.all([
            loadBaseQuery().eq("user_id", user.id),
            ownerIds.length > 0
              ? loadBaseQuery().in("user_id", ownerIds)
              : Promise.resolve({ data: [], error: null }),
            ownerEmails.length > 0
              ? loadBaseQuery().in("data->>tecnicoCorreo", ownerEmails)
              : Promise.resolve({ data: [], error: null }),
          ]);

          error = ownResponse.error || permittedResponse.error || permittedByTechResponse.error;
          data = mergeRecords(ownResponse.data || [], permittedResponse.data || [], permittedByTechResponse.data || []);
        }

        if (error) {
          console.error("Error:", error);
          setReports([]);
          return;
        }

        const filteredByType = tipo
          ? (data || []).filter((report) => getInformeTipo(report) === tipo)
          : data || [];

        setReports(filteredByType);
      } catch (err) {
        console.error("Error cargando:", err);
        setReports([]);
      }
    };

    loadReports();
  }, [user?.id, superAdminActivo, tipo, area]);

  const isOwnReport = (report) => report.user_id === user?.id;

  const canEditReport = (report) => {
    return (
      superAdminActivo ||
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
      superAdminActivo ||
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

  const selectedUser = userOptions.find((profile) => profile.id === filters.tecnico);

  const filteredReports = reports.filter((r) => {
    const cliente = r.data?.cliente?.toLowerCase() || "";
    const pedido = [
      r.data?.pedidoDemanda,
      r.data?.referenciaContrato,
      r.data?.codInf,
      r.data?.codigo,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const fecha = r.updated_at || r.created_at;

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      cliente.includes((filters.cliente || "").toLowerCase()) &&
      pedido.includes((filters.pedido || "").toLowerCase()) &&
      recordMatchesUser(r, selectedUser) &&
      (!filters.fecha || (fecha && fecha.startsWith(filters.fecha)))
    );
  });

  const openReport = (report) => {
    if (!canEditReport(report)) {
      alert("No tienes permiso para editar este informe.");
      return;
    }

    const reportTipo = getInformeTipo(report);
    navigate(`${basePath}/${reportTipo}/${report.id}`);
  };

  const duplicateReport = async (report) => {
    if (!canEditReport(report)) {
      alert("No tienes permiso para duplicar este informe.");
      return;
    }

    if (!confirm("¿Duplicar este informe como borrador sin código de informe?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(report, user);
      const reportTipo = getInformeTipo(duplicated);
      navigate(`${basePath}/${reportTipo}/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando informe:", error);
      alert("No se pudo duplicar el informe.");
    }
  };

  const deleteReport = async (id) => {
    if (!user?.id) {
      alert("Debes iniciar sesión para realizar esta acción.");
      return;
    }

    if (!confirm("¿Eliminar este informe?")) return;

    let query = supabase
      .from("registros")
      .delete()
      .eq("id", id)
      .eq("area", area)
      .eq("tipo", "informe");

    if (!superAdminActivo) {
      query = query.eq("user_id", user.id);
    }

    const { error } = await query;

    if (error) {
      console.error(error);
      alert("No se pudo eliminar el informe. Intenta de nuevo.");
      return;
    }

    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const cardClass = "bg-white text-gray-900";
  const inputClass = "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";
  const rowClass = "bg-gray-50 border-gray-200";

  return (
    <div className={`rounded-2xl p-6 shadow space-y-6 ${cardClass}`}>
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold">
            {tipoConfig?.label || `Informes ${areaLabel}`}
          </h1>
          {tipoConfig?.description && (
            <p className="text-sm text-gray-500">{tipoConfig.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(areaPath)}
            className="btn-volver-orange py-1"
          >
            Volver
          </button>
        </div>
      </div>

      {superAdminActivo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          Modo super administrador: estás viendo todos los informes de {areaLabel}.
        </div>
      )}

      <button
        onClick={() => navigate(tipo ? `${basePath}/${tipo}/nuevo` : `${basePath}/nuevo`)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg transition"
      >
        {tipoConfig ? `Nuevo ${tipoConfig.label}` : "Nuevo informe"}
      </button>

      <div className="flex gap-2 flex-wrap">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={filters.cliente}
          onChange={(e) => setFilters((f) => ({ ...f, cliente: e.target.value }))}
          className={`border px-3 py-2 rounded text-sm ${inputClass}`}
        />
        <input
          type="text"
          placeholder="Pedido / Código..."
          value={filters.pedido}
          onChange={(e) => setFilters((f) => ({ ...f, pedido: e.target.value }))}
          className={`border px-3 py-2 rounded text-sm ${inputClass}`}
        />
        <input
          type="date"
          value={filters.fecha}
          onChange={(e) => setFilters((f) => ({ ...f, fecha: e.target.value }))}
          className={`border px-3 py-2 rounded text-sm ${inputClass}`}
        />
        <select
          value={filters.tecnico}
          onChange={(e) => setFilters((f) => ({ ...f, tecnico: e.target.value }))}
          className={`border px-3 py-2 rounded text-sm ${inputClass}`}
        >
          <option value="">Todos los usuarios</option>
          {userOptions.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {getUserOptionLabel(profile)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredReports.length === 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 text-gray-500">
            Sin registros
          </div>
        )}

        {filteredReports.map((r) => (
          <div
            key={r.id}
            className={`border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${rowClass}`}
          >
            <div className="space-y-1">
              <p className="font-semibold">{r.data?.cliente || "Sin cliente"}</p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <span>Pedido: <strong>{r.data?.pedidoDemanda || "-"}</strong></span>
                <span>Informe: <strong>{r.data?.codInf || "-"}</strong></span>
                <span>Tipo: <strong>{informeTipos[getInformeTipo(r)]?.label || getInformeTipo(r)}</strong></span>
              </div>

              <p className="text-xs text-gray-500 italic">
                {r.data?.referenciaContrato || r.data?.descripcion || "Sin descripción"}
              </p>

              <div className="flex flex-wrap justify-between items-center text-xs pt-1 gap-3">
                <span className="text-gray-500">
                  {new Date(r.updated_at || r.created_at).toLocaleString()}
                </span>
                {superAdminActivo && (
                  <span className="text-[11px] text-gray-500">
                    Usuario: {r.data?.tecnicoNombre || "Sin técnico"}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.estado === "completado" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                  {r.estado === "completado" ? "Completado" : "Borrador"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 text-sm shrink-0 flex-wrap">
              <button
                onClick={() => navigate(`${basePath}/ver/${r.id}`)}
                className="text-slate-600 hover:underline font-semibold"
              >
                Ver
              </button>
              {canEditReport(r) && (
                <button onClick={() => openReport(r)} className="text-blue-600 hover:underline">
                  Abrir
                </button>
              )}
              {canEditReport(r) && (
                <button onClick={() => duplicateReport(r)} className="text-amber-600 hover:underline font-semibold">
                  Duplicar
                </button>
              )}
              {r.estado === "completado" && canDownloadReport(r) && (
                <button onClick={() => navigate(`${basePath}/pdf/${r.id}`)} className="text-green-600 hover:underline font-semibold">
                  PDF
                </button>
              )}
              {(superAdminActivo || isOwnReport(r)) && (
                <button onClick={() => deleteReport(r.id)} className="text-red-600 hover:underline">
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
