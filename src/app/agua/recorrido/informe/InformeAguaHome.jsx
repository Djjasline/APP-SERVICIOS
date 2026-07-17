// ──────────────────────────────────────────────────────
//  InformeAguaHome.jsx
//  Listado / historial de Informes de Avance EPMAPS
// ──────────────────────────────────────────────────────
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";
import {
  canAccessRecord,
  getAccessibleRecordsForUser,
} from "@/services/accessControlService";


export default function InformeAguaHome() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const [registros, setRegistros] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const loadRegistros = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { records, permissions } = await getAccessibleRecordsForUser({
        userId: user.id,
        userEmail: user.email,
        area: "agua",
        tipo: "informe",
        subtipo: "avance_epmaps",
        canViewAll: superAdminActivo,
      });

      setAccessPermissions(permissions);
      setRegistros(records);
    } catch (error) {
      console.error("Error cargando informes:", error);
      setRegistros([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRegistros();
  }, [user?.id, user?.email, superAdminActivo]);

  const isOwn = (record) => record.user_id === user?.id || record.data?.tecnicoCorreo === user?.email;
  const canEdit = (record) =>
    superAdminActivo ||
    isOwn(record) ||
    canAccessRecord({ record, userId: user?.id, permissions: accessPermissions, isSuperAdmin: superAdminActivo, action: "edit" });
  const canDelete = (record) => superAdminActivo || isOwn(record);

  const filtered = registros.filter((r) => {
    const d = r.data || {};
    const texto = `${d.periodo || ""} ${d.contrato || ""} ${d.pedido || ""}`.toLowerCase();
    const matchBusqueda = texto.includes(busqueda.toLowerCase());
    const matchFilter =
      filter === "todos" ||
      (filter === "borrador" && r.estado !== "completado") ||
      (filter === "completado" && r.estado === "completado");
    return matchBusqueda && matchFilter;
  });

  const remove = async (id) => {
    if (!confirm("¿Eliminar este informe?")) return;
    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id)
      .eq("tipo", "informe")
      .eq("subtipo", "avance_epmaps");

    if (error) {
      console.error("Error eliminando informe:", error);
      alert("No se pudo eliminar el informe.");
      return;
    }
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  const duplicate = async (record) => {
    if (!user?.id) {
      alert("Debes iniciar sesión para realizar esta acción.");
      return;
    }

    if (!canEdit(record)) {
      alert("No tienes permiso para duplicar este informe de recorrido.");
      return;
    }

    if (!confirm("¿Duplicar este informe de recorrido como borrador sin código?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(record, user);
      navigate(`/agua/recorrido/informe/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando informe de recorrido:", error);
      alert("No se pudo duplicar el informe de recorrido.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">
      {/* Header */}
<div className="flex flex-wrap justify-between items-center gap-3">
  <div>
    <h1 className="text-lg font-semibold text-gray-900">
      Informe de recorrido
    </h1>
    <p className="text-sm text-gray-500 mt-0.5">
      Creación e historial de informes de recorrido de agua y saneamiento.
    </p>
  </div>

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => navigate("/area/agua")}
      className="btn-volver-orange"
    >
      Volver
    </button>

    <button
      type="button"
      onClick={() => navigate("/agua/recorrido/informe/new")}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      + Nuevo informe de recorrido
    </button>
  </div>
</div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {["todos", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize border transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar por período, contrato..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px] max-w-xs"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Período</th>
              <th className="text-left px-4 py-3 font-semibold">Contrato</th>
              <th className="text-left px-4 py-3 font-semibold">Pedido N°</th>
              <th className="text-left px-4 py-3 font-semibold">Actividades</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold">Fecha</th>
              <th className="text-right px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Cargando informes...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No hay informes registrados
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((r) => {
                const d = r.data || {};
                const fecha = r.updated_at || r.created_at;
                const numActividades = Array.isArray(d.actividades)
                  ? d.actividades.length
                  : 0;

                return (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[220px]">
                      <span className="line-clamp-2">{d.periodo || "—"}</span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {d.contrato || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {d.pedido || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {numActividades} OT{numActividades !== 1 ? "s" : ""}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          r.estado === "completado"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {r.estado === "completado" ? "Completado" : "Borrador"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {fecha ? new Date(fecha).toLocaleDateString("es-EC") : "—"}
                    </td>

                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/agua/recorrido/informe/ver/${r.id}`)}
                        className="font-semibold text-slate-600 hover:underline text-xs"
                      >
                        Ver
                      </button>

                      {canEdit(r) && (
                        <button
                          onClick={() => navigate(`/agua/recorrido/informe/${r.id}`)}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Abrir
                        </button>
                      )}

                      {canEdit(r) && (
                        <button
                          onClick={() => duplicate(r)}
                          className="text-amber-600 hover:underline text-xs font-semibold"
                        >
                          Duplicar
                        </button>
                      )}

                      <button
  onClick={() => navigate(`/agua/recorrido/informe/pdf/${r.id}`)}
  className="text-green-600 hover:underline text-xs font-medium"
>
  PDF
</button>

                      {canDelete(r) && (
                        <button
                          onClick={() => remove(r.id)}
                          className="text-red-500 hover:underline text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      {!loading && registros.length > 0 && (
        <div className="flex gap-6 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>
            Total:{" "}
            <strong className="text-gray-700">{registros.length}</strong>
          </span>
          <span>
            Completados:{" "}
            <strong className="text-green-700">
              {registros.filter((r) => r.estado === "completado").length}
            </strong>
          </span>
          <span>
            Borradores:{" "}
            <strong className="text-yellow-700">
              {registros.filter((r) => r.estado !== "completado").length}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
