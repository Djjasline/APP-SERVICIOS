import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  canAccessRecord,
  getRecordAccessPermissionsForUser,
} from "@/services/accessControlService";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";
import { createRegistro, deleteRegistro, getAllRegistros } from "@/utils/registroStorage";

const StatusBadge = ({ estado }) => {
  const styles = {
    salida: "bg-yellow-100 text-yellow-800",
    completado: "bg-green-100 text-green-800",
    borrador: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[estado] || "bg-gray-100 text-gray-700"}`}>
      {estado || "-"}
    </span>
  );
};

export default function RegistroHome() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isSupervisorOperaciones } = useAuth();
  const { isLight } = useTheme();
  const [registros, setRegistros] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [filter, setFilter] = useState("todas");
  const [loading, setLoading] = useState(true);

  const superAdminActivo =
    typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const supervisorOperacionesActivo =
    typeof isSupervisorOperaciones === "function"
      ? isSupervisorOperaciones()
      : !!isSupervisorOperaciones;
  const puedeVerTodoOperaciones = superAdminActivo || supervisorOperacionesActivo;

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setLoading(true);
      const [data, permissions] = await Promise.all([
        getAllRegistros(),
        getRecordAccessPermissionsForUser(user.id),
      ]);
      setRegistros(Array.isArray(data) ? data : []);
      setAccessPermissions(permissions);
      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  const filtered = registros
    .filter((r) => (filter === "todas" ? true : r.estado === filter))
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    );

  const isOwnRegistro = (item) => item.user_id === user?.id;

  const canEditRegistro = (item) => {
    return (
      puedeVerTodoOperaciones ||
      isOwnRegistro(item) ||
      canAccessRecord({
        record: item,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "edit",
      })
    );
  };

  const canDownloadRegistro = (item) => {
    return (
      puedeVerTodoOperaciones ||
      isOwnRegistro(item) ||
      canAccessRecord({
        record: item,
        userId: user?.id,
        permissions: accessPermissions,
        isSuperAdmin: superAdminActivo,
        action: "download",
      })
    );
  };

  const crearNuevoRegistro = async () => {
    const result = await createRegistro({ data: { items: [] } });
    if (!result?.id) return;
    navigate(`/operaciones/registro/${result.id}`);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;

    const ok = await deleteRegistro(id);
    if (ok) {
      setRegistros((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleDuplicar = async (item) => {
    if (!canEditRegistro(item)) {
      alert("No tienes permiso para duplicar este registro.");
      return;
    }

    if (!window.confirm("¿Duplicar este registro como borrador?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(item, user);
      navigate(`/operaciones/registro/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando registro:", error);
      alert("No se pudo duplicar el registro.");
    }
  };

  return (
    <div className={`min-h-screen px-4 py-8 ${isLight ? "bg-slate-50" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <h1 className={`text-2xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            Registro de salida e ingreso de herramientas
          </h1>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/operaciones")}
              className="btn-volver-orange"
            >
              Volver
            </button>

            <button
              type="button"
              onClick={crearNuevoRegistro}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              + Nuevo registro de herramientas
            </button>
          </div>
        </div>

        <div className="flex gap-2 text-xs flex-wrap">
          {["todas", "salida", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded border ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : isLight
                  ? "bg-white text-slate-600 hover:bg-slate-100"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className={`text-sm ${isLight ? "text-gray-400" : "text-white/60"}`}>Cargando registros...</p>
        ) : filtered.length === 0 ? (
          <p className={`text-sm ${isLight ? "text-gray-500" : "text-white/60"}`}>No hay registros aún.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => {
              const items = item.data?.items || [];
              const total = items.length;
              const ingresadas = items.filter((i) => i.imagenIngresoUrl).length;
              const pendientes = total - ingresadas;
              const tecnico = items[0]?.tecnicoSalida || "Sin técnico";
              const pedido = items[0]?.pedido;

              return (
                <li
                  key={item.id}
                  className={`border rounded-lg p-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-start shadow-sm hover:shadow-md transition-shadow ${
                    isLight
                      ? "bg-white border-slate-200"
                      : "bg-white/10 border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`font-medium text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span className={`font-semibold ${item.estado === "completado" ? "text-green-700" : "text-yellow-700"}`}>
                        {item.estado === "completado" ? "REGISTRO CERRADO" : "EN CAMPO"}
                      </span>
                      {" - "}
                      {tecnico}
                    </p>

                    {pedido && (
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>
                        Pedido: {pedido}
                      </p>
                    )}

                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>
                      {total} herramienta{total !== 1 ? "s" : ""}
                    </p>

                    {total > 0 && (
                      <p className="text-xs mt-1">
                        <span className="text-green-600">
                          {ingresadas} ingresada{ingresadas !== 1 ? "s" : ""}
                        </span>
                        {"  "}
                        <span className="text-red-600">
                          {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
                        </span>
                      </p>
                    )}

                    <p className={`text-xs ${isLight ? "text-gray-400" : "text-white/50"}`}>
                      {new Date(item.created_at || item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:ml-4 flex-shrink-0">
                    <StatusBadge estado={item.estado} />

                    <button
                      onClick={() => navigate(`/operaciones/registro/ver/${item.id}`)}
                      className={`text-xs font-semibold hover:underline ${isLight ? "text-slate-600" : "text-white/70"}`}
                    >
                      Ver
                    </button>

                    {canEditRegistro(item) && (
                      <button
                        onClick={() => navigate(`/operaciones/registro/${item.id}`)}
                        className="text-blue-600 text-xs hover:underline"
                      >
                        Abrir
                      </button>
                    )}

                    {canDownloadRegistro(item) && (
                      <button
                        onClick={() => navigate(`/operaciones/registro/pdf/${item.id}`)}
                        className="text-green-600 text-xs hover:underline"
                      >
                        PDF
                      </button>
                    )}

                    {canEditRegistro(item) && (
                      <button
                        onClick={() => handleDuplicar(item)}
                        className="text-amber-600 text-xs font-semibold hover:underline"
                      >
                        Duplicar
                      </button>
                    )}

                    {(superAdminActivo || isOwnRegistro(item)) && (
                      <button
                        onClick={() => handleEliminar(item.id)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
