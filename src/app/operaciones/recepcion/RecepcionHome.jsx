import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generarPDFRecepcion } from "./generarPDFRecepcion";
import { useAuth } from "@/context/AuthContext";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";
import {
  canAccessRecord,
  getAccessibleRecordsForUser,
} from "@/services/accessControlService";

export default function RecepcionHome() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isSupervisorOperaciones } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const supervisorOperacionesActivo = typeof isSupervisorOperaciones === "function" ? isSupervisorOperaciones() : !!isSupervisorOperaciones;
  const puedeVerTodoOperaciones = superAdminActivo || supervisorOperacionesActivo;

  const [registros, setRegistros] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    conductor: "",
    placa: "",
    pedido: "",
    fecha: "",
  });

  const loadRegistros = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { records, permissions } = await getAccessibleRecordsForUser({
        userId: user.id,
        userEmail: user.email,
        area: "operaciones",
        tipo: "recepcion",
        subtipo: "control_vehicular",
        canViewAll: puedeVerTodoOperaciones,
      });

      setAccessPermissions(permissions);
      setRegistros(records);
    } catch (error) {
      console.error("Error cargando bitácoras vehiculares:", error);
      setRegistros([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRegistros();
  }, [user?.id, user?.email, puedeVerTodoOperaciones]);

  const isOwn = (record) => record.user_id === user?.id || record.data?.tecnicoCorreo === user?.email;
  const canEdit = (record) =>
    puedeVerTodoOperaciones ||
    isOwn(record) ||
    canAccessRecord({ record, userId: user?.id, permissions: accessPermissions, isSuperAdmin: superAdminActivo, action: "edit" });
  const canDownload = (record) =>
    puedeVerTodoOperaciones ||
    isOwn(record) ||
    canAccessRecord({ record, userId: user?.id, permissions: accessPermissions, isSuperAdmin: superAdminActivo, action: "download" });
  const canDelete = (record) => puedeVerTodoOperaciones || isOwn(record);

  const filtered = registros.filter((r) => {
    const d = r.data || {};
    const fecha = d.fecha || r.updated_at || r.created_at || "";

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      (d.conductor || "").toLowerCase().includes(filters.conductor.toLowerCase()) &&
      (d.placa || "").toLowerCase().includes(filters.placa.toLowerCase()) &&
      (d.pedidoDemanda || "").toLowerCase().includes(filters.pedido.toLowerCase()) &&
      (!filters.fecha || fecha.startsWith(filters.fecha))
    );
  });

  const remove = async (id) => {
    if (!confirm("¿Eliminar control vehicular?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id)
      .eq("tipo", "recepcion")
      .eq("subtipo", "control_vehicular");

    if (error) {
      console.error("Error eliminando control vehicular:", error);
      alert("No se pudo eliminar el registro.");
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
      alert("No tienes permiso para duplicar esta bitácora.");
      return;
    }

    if (!confirm("¿Duplicar esta bitácora como borrador?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(record, user);
      navigate(`/operaciones/recepcion/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando bitácora:", error);
      alert("No se pudo duplicar la bitácora.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
  <h1 className="text-lg font-semibold text-gray-900">
    Bitácora y control vehicular
  </h1>

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => navigate("/operaciones")}
      className="btn-volver-orange py-1"
    >
      Volver
    </button>

    <button
      type="button"
      onClick={() => navigate("/operaciones/recepcion/new")}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
    >
      + Nueva bitácora vehicular
    </button>
  </div>
</div>

      <div className="flex flex-wrap gap-2">
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
          placeholder="Buscar conductor..."
          value={filters.conductor}
          onChange={(e) => setFilters((f) => ({ ...f, conductor: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          placeholder="Placa..."
          value={filters.placa}
          onChange={(e) => setFilters((f) => ({ ...f, placa: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          placeholder="Pedido / demanda..."
          value={filters.pedido}
          onChange={(e) => setFilters((f) => ({ ...f, pedido: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          type="date"
          value={filters.fecha}
          onChange={(e) => setFilters((f) => ({ ...f, fecha: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-2">Conductor</th>
              <th className="text-left px-4 py-2">Placa</th>
              <th className="text-left px-4 py-2">Pedido/Demanda</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Cargando bitácoras vehiculares...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No hay bitácoras vehiculares registradas
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((r) => {
                const d = r.data || {};
                const fecha = d.fecha || r.updated_at || r.created_at;

                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {d.conductor || "-"}
                    </td>

                    <td className="px-4 py-2 text-gray-600">
                      {d.placa || "-"}
                    </td>

                    <td className="px-4 py-2 text-gray-600">
                      {d.pedidoDemanda || "-"}
                    </td>

                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          r.estado === "completado"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.estado === "completado" ? "Completado" : "Borrador"}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-gray-500">
                      {fecha ? new Date(fecha).toLocaleDateString() : "-"}
                    </td>

                    <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/operaciones/recepcion/ver/${r.id}`)}
                        className="font-semibold text-slate-600 hover:underline"
                      >
                        Ver
                      </button>

                      {canEdit(r) && (
                        <button
                          onClick={() => navigate(`/operaciones/recepcion/${r.id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          Abrir
                        </button>
                      )}

                      {canEdit(r) && (
                        <button
                          onClick={() => duplicate(r)}
                          className="text-amber-600 hover:underline font-semibold"
                        >
                          Duplicar
                        </button>
                      )}

                      {canDownload(r) && (
                        <button
                          onClick={() => generarPDFRecepcion(r.data || {})}
                          className="text-green-600 hover:underline"
                        >
                          Descargar PDF
                        </button>
                      )}

                      {canDelete(r) && (
                        <button
                          onClick={() => remove(r.id)}
                          className="text-red-500 hover:underline"
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
    </div>
  );
}
