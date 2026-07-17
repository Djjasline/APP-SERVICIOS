import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";
import {
  canAccessRecord,
  getAccessibleRecordsForUser,
} from "@/services/accessControlService";

export default function VisitaCampoHome() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const [records, setRecords] = useState([]);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const loadRecords = async () => {
      try {
        const { records: permittedRecords, permissions } = await getAccessibleRecordsForUser({
          userId: user.id,
          userEmail: user.email,
          area: "petroleo",
          tipo: "visita_campo",
          canViewAll: superAdminActivo,
        });

        setAccessPermissions(permissions);
        setRecords(permittedRecords);
      } catch (error) {
        console.error("Error cargando visitas de campo:", error);
        setRecords([]);
      }
    };

    loadRecords();
  }, [user?.id, user?.email, superAdminActivo]);

  const isOwn = (record) => record.user_id === user?.id || record.data?.tecnicoCorreo === user?.email;
  const canEdit = (record) =>
    superAdminActivo ||
    isOwn(record) ||
    canAccessRecord({ record, userId: user?.id, permissions: accessPermissions, isSuperAdmin: superAdminActivo, action: "edit" });
  const canDownload = (record) =>
    superAdminActivo ||
    isOwn(record) ||
    canAccessRecord({ record, userId: user?.id, permissions: accessPermissions, isSuperAdmin: superAdminActivo, action: "download" });

  const filtered = records.filter((record) => {
    const q = search.trim().toLowerCase();
    const text = [
      record.data?.codigoDocumento,
      record.data?.cliente,
      record.data?.ubicacion,
      record.data?.marca,
      record.data?.modelos,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!q || text.includes(q)) &&
      (filter === "todos" ||
        (filter === "borrador" && record.estado !== "completado") ||
        (filter === "completado" && record.estado === "completado"))
    );
  });

  const deleteRecord = async (record) => {
    if (!user?.id) return;
    if (!confirm("¿Eliminar este informe de visita en campo?")) return;

    let query = supabase.from("registros").delete().eq("id", record.id).eq("tipo", "visita_campo");
    if (!superAdminActivo) query = query.eq("user_id", user.id);

    const { error } = await query;
    if (error) {
      console.error(error);
      alert("No se pudo eliminar el informe.");
      return;
    }

    setRecords((prev) => prev.filter((item) => item.id !== record.id));
  };

  const duplicateRecord = async (record) => {
    if (!user?.id) {
      alert("Debes iniciar sesión para realizar esta acción.");
      return;
    }

    if (!canEdit(record)) {
      alert("No tienes permiso para duplicar este informe de visita.");
      return;
    }

    if (!confirm("¿Duplicar este informe de visita como borrador sin código?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(record, user);
      navigate(`/petroleo/visita-campo/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando visita de campo:", error);
      alert("No se pudo duplicar el informe de visita.");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 text-gray-900 shadow space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Informe técnico de visita en campo</h1>
          <p className="text-sm text-gray-500">Historial propio para informes de visitas técnicas de Petróleo.</p>
        </div>
        <button onClick={() => navigate("/area/petroleo")} className="btn-volver-orange py-1">Volver</button>
      </div>

      <button
        onClick={() => navigate("/petroleo/visita-campo/nuevo")}
        className="w-full rounded-lg bg-orange-600 py-2 text-white transition hover:bg-orange-700"
      >
        Nuevo informe técnico de visita en campo
      </button>

      <div className="flex flex-wrap gap-2">
        {["todos", "borrador", "completado"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded border px-3 py-1 text-sm ${filter === item ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por cliente, código, ubicación, marca o modelo..."
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-gray-50 p-6 text-sm text-gray-500">Sin registros</div>
        ) : (
          filtered.map((record) => (
            <div key={record.id} className="rounded-xl border bg-gray-50 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{record.data?.codigoDocumento || "Sin código"} - {record.data?.cliente || "Sin cliente"}</p>
                <p className="text-xs text-gray-600">
                  Ubicación: <strong>{record.data?.ubicacion || "-"}</strong> | Marca: <strong>{record.data?.marca || "-"}</strong>
                </p>
                <p className="text-xs text-gray-500">{new Date(record.updated_at || record.created_at).toLocaleString()}</p>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${record.estado === "completado" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                  {record.estado === "completado" ? "Completado" : "Borrador"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <button onClick={() => navigate(`/petroleo/visita-campo/ver/${record.id}`)} className="font-semibold text-slate-600 hover:underline">Ver</button>
                {canEdit(record) && (
                  <button onClick={() => navigate(`/petroleo/visita-campo/${record.id}`)} className="text-blue-600 hover:underline">Abrir</button>
                )}
                {canEdit(record) && (
                  <button onClick={() => duplicateRecord(record)} className="font-semibold text-amber-600 hover:underline">Duplicar</button>
                )}
                {record.estado === "completado" && canDownload(record) && (
                  <button onClick={() => navigate(`/petroleo/visita-campo/${record.id}/pdf`)} className="font-semibold text-green-600 hover:underline">PDF</button>
                )}
                {(superAdminActivo || record.user_id === user?.id) && (
                  <button onClick={() => deleteRecord(record)} className="text-red-600 hover:underline">Eliminar</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
