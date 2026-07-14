import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";
import {
  canAccessRecord,
  getAccessibleRecordsForUser,
} from "@/services/accessControlService";

export default function LiberacionHome() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isSupervisorOperaciones } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const supervisorOperacionesActivo = typeof isSupervisorOperaciones === "function" ? isSupervisorOperaciones() : !!isSupervisorOperaciones;
  const puedeVerTodoOperaciones = superAdminActivo || supervisorOperacionesActivo;

  const [registros, setRegistros] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [filter, setFilter] = useState("todos");

  const [filters, setFilters] = useState({
    equipo: "",
    codigo: "",
    fecha: "",
  });

  // 🔄 CARGAR DATA
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const { records, permissions } = await getAccessibleRecordsForUser({
          userId: user.id,
          userEmail: user.email,
          area: "operaciones",
          tipo: "liberacion",
          subtipo: "general",
          canViewAll: puedeVerTodoOperaciones,
        });

        setAccessPermissions(permissions);
        setRegistros(records);
      } catch (error) {
        console.error("Error cargando autorizaciones:", error);
        setRegistros([]);
      }
    };

    load();
  }, [user?.id, user?.email, puedeVerTodoOperaciones]);

  const isOwn = (record) => record.user_id === user?.id || record.data?.tecnicoCorreo === user?.email;
  const canEdit = (record) =>
    puedeVerTodoOperaciones ||
    isOwn(record) ||
    canAccessRecord({ record, userId: user?.id, permissions: accessPermissions, isSuperAdmin: superAdminActivo, action: "edit" });
  const canDelete = (record) => puedeVerTodoOperaciones || isOwn(record);

  // 🎯 FILTROS
  const filtered = registros.filter((r) => {
    const equipo = r.data?.equipo?.toLowerCase() || "";
    const codigo = r.data?.codigo?.toLowerCase() || "";
    const fecha = r.updated_at || r.created_at;

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      equipo.includes(filters.equipo.toLowerCase()) &&
      codigo.includes(filters.codigo.toLowerCase()) &&
      (!filters.fecha || (fecha && fecha.startsWith(filters.fecha)))
    );
  });

  const open = (r) => navigate(`/operaciones/liberacion/${r.id}`);

  const remove = async (id) => {
    if (!confirm("¿Eliminar esta autorización?")) return;

   await supabase
  .from("registros")
  .delete()
  .eq("id", id);

    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  const duplicate = async (record) => {
    if (!user?.id) {
      alert("Usuario no autenticado");
      return;
    }

    if (!canEdit(record)) {
      alert("No tienes permiso para duplicar esta autorización.");
      return;
    }

    if (!confirm("¿Duplicar esta autorización como borrador?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(record, user);
      navigate(`/operaciones/liberacion/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando autorización:", error);
      alert("No se pudo duplicar la autorización.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">

      {/* HEADER */}
      {/* HEADER */}
<div className="flex flex-wrap justify-between items-center gap-3">
  <h1 className="text-lg font-semibold text-gray-900">
    Historial de autorizaciones de uso de vehículo para refinería
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
      onClick={() => navigate("/operaciones/liberacion/nuevo")}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
    >
      + Nueva autorización
    </button>
  </div>
</div>
      {/* FILTROS */}
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

      {/* INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          placeholder="Buscar equipo..."
          value={filters.equipo}
          onChange={(e) =>
            setFilters((f) => ({ ...f, equipo: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          placeholder="Código..."
          value={filters.codigo}
          onChange={(e) =>
            setFilters((f) => ({ ...f, codigo: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          type="date"
          value={filters.fecha}
          onChange={(e) =>
            setFilters((f) => ({ ...f, fecha: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-2">Equipo</th>
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No hay autorizaciones registradas
                </td>
              </tr>
            )}

            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">

                <td className="px-4 py-2 font-medium text-gray-900">
                  {r.data?.equipo || "—"}
                </td>

                <td className="px-4 py-2 text-gray-600">
                  {r.data?.codigo || "—"}
                </td>

                {/* ESTADO */}
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      r.estado === "completado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.estado === "completado"
                      ? "Completado"
                      : "Borrador"}
                  </span>
                </td>

                <td className="px-4 py-2 text-gray-500">
                  {new Date(
                    r.updated_at || r.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => open(r)}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </button>

                  {canEdit(r) && (
                    <button
                      onClick={() => duplicate(r)}
                      className="text-amber-600 hover:underline font-semibold"
                    >
                      Duplicar
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
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
