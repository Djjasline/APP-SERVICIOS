import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  canAccessRecord,
  getPermittedOwnerEmails,
  getPermittedOwnerIds,
  getRecordAccessPermissionsForUser,
  mergeRecords,
} from "@/services/accessControlService";
import { duplicateRecordAsDraft } from "@/services/duplicateRecordService";

const PROTOCOLS = [
  {
    subtipo: "hidrosuccionador-vactor",
    title: "Protocolo de hidrosuccionador Vactor",
    label: "Hidrosuccionador Vactor",
    description: "Mantenimiento semestral y anual de hidrosuccionadores Vactor Serie 2100 PD.",
    path: "vactor",
  },
  {
    subtipo: "camara-vcam6",
    title: "Protocolo de cámara V-CAM6",
    label: "Cámara V-CAM6",
    description: "Mantenimiento preventivo de cámara de inspección, cable, carrete, monitor y cabezal.",
    path: "vcam",
  },
];

const PROTOCOL_BY_SUBTIPO = PROTOCOLS.reduce((acc, item) => {
  acc[item.subtipo] = item;
  return acc;
}, {});

export default function ProtocolosHome() {
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const { user, isSuperAdmin, isSupervisorProyecto, isProveedorVehiculos } = useAuth();
  const [records, setRecords] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");

  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const supervisorProyectoActivo = typeof isSupervisorProyecto === "function" ? isSupervisorProyecto() : !!isSupervisorProyecto;
  const proveedorVehiculosActivo = typeof isProveedorVehiculos === "function" ? isProveedorVehiculos() : !!isProveedorVehiculos;
  const puedeVerTodoVehiculos = superAdminActivo || supervisorProyectoActivo;

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const userPermissions = await getRecordAccessPermissionsForUser(user.id);
      setPermissions(userPermissions);

      const baseQuery = () =>
        supabase
          .from("registros")
          .select("*")
          .eq("area", "vehiculos")
          .eq("tipo", "protocolo")
          .in("subtipo", PROTOCOLS.map((item) => item.subtipo))
          .order("created_at", { ascending: false });

      let data = [];
      let error = null;

      if (puedeVerTodoVehiculos) {
        const response = await baseQuery();
        data = response.data || [];
        error = response.error;
      } else {
        const ownerIds = getPermittedOwnerIds(userPermissions, "vehiculos", "protocolo", "view");
        const ownerEmails = getPermittedOwnerEmails(userPermissions, "vehiculos", "protocolo", "view");
        const [ownResponse, permittedResponse, permittedByTechResponse] = await Promise.all([
          baseQuery().eq("user_id", user.id),
          ownerIds.length > 0 ? baseQuery().in("user_id", ownerIds) : Promise.resolve({ data: [], error: null }),
          ownerEmails.length > 0 ? baseQuery().in("data->>tecnicoCorreo", ownerEmails) : Promise.resolve({ data: [], error: null }),
        ]);

        error = ownResponse.error || permittedResponse.error || permittedByTechResponse.error;
        data = mergeRecords(ownResponse.data || [], permittedResponse.data || [], permittedByTechResponse.data || []);
      }

      if (error) {
        console.error("Error cargando protocolos:", error);
        setRecords([]);
        return;
      }

      if (!puedeVerTodoVehiculos) {
        data = data.filter((item) => item.user_id === user.id || canAccessRecord({ record: item, userId: user.id, permissions: userPermissions, isSuperAdmin: superAdminActivo, action: "view" }));
      }

      setRecords(data);
    };

    load();
  }, [user?.id, puedeVerTodoVehiculos, superAdminActivo]);

  const isOwn = (item) => item.user_id === user?.id;
  const canEdit = (item) => puedeVerTodoVehiculos || isOwn(item) || canAccessRecord({ record: item, userId: user?.id, permissions, isSuperAdmin: superAdminActivo, action: "edit" });
  const canDownload = (item) => puedeVerTodoVehiculos || isOwn(item) || canAccessRecord({ record: item, userId: user?.id, permissions, isSuperAdmin: superAdminActivo, action: "download" });

  const filtered = records.filter((item) => {
    const text = [item.data?.cliente, item.data?.equipoNo, item.data?.codInf, item.data?.pedidoDemanda, item.data?.tecnicoNombre]
      .join(" ")
      .toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchEstado = estado === "todos" || item.estado === estado;
    return matchSearch && matchEstado;
  });

  const handleDelete = async (item) => {
    if (!confirm("¿Eliminar protocolo?")) return;

    let query = supabase
      .from("registros")
      .delete()
      .eq("id", item.id)
      .eq("area", "vehiculos")
      .eq("tipo", "protocolo")
      .eq("subtipo", item.subtipo);

    if (!puedeVerTodoVehiculos) query = query.eq("user_id", user.id);

    const { error } = await query;
    if (error) {
      console.error(error);
      alert("No se pudo eliminar el protocolo. Intenta de nuevo.");
      return;
    }

    setRecords((prev) => prev.filter((record) => record.id !== item.id));
  };

  const handleDuplicate = async (item) => {
    if (!canEdit(item)) {
      alert("No tienes permiso para duplicar este protocolo.");
      return;
    }

    if (!confirm("¿Duplicar este protocolo como borrador sin código?")) return;

    try {
      const duplicated = await duplicateRecordAsDraft(item, user);
      const protocol = PROTOCOL_BY_SUBTIPO[duplicated.subtipo] || PROTOCOLS[0];
      navigate(`/vehiculos/protocolos/${protocol.path}/${duplicated.id}`);
    } catch (error) {
      console.error("Error duplicando protocolo:", error);
      alert("No se pudo duplicar el protocolo.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Protocolos</h1>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>Protocolos técnicos para vehículos especiales.</p>
        </div>
        <button onClick={() => navigate("/area/vehiculos")} className="btn-volver-orange">Volver</button>
      </div>

      {superAdminActivo && <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">Modo super administrador: estás viendo todos los protocolos de vehículos.</div>}
      {!superAdminActivo && supervisorProyectoActivo && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">Modo supervisor de proyecto: estás viendo todos los protocolos de vehículos.</div>}
      {proveedorVehiculosActivo && <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">Acceso proveedor: puedes ver tus protocolos y los registros autorizados por administración.</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROTOCOLS.map((protocol) => (
          <div key={protocol.subtipo} className="bg-white p-5 rounded-xl shadow flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition">
            <div>
              <h2 className="font-semibold text-gray-900">{protocol.title}</h2>
              <p className="text-sm text-gray-500">{protocol.description}</p>
            </div>
            <button onClick={() => navigate(`/vehiculos/protocolos/${protocol.path}/new`)} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm transition">+ Nuevo protocolo</button>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <div className="flex gap-2 flex-wrap">
          {["todos", "borrador", "completado"].map((value) => (
            <button key={value} onClick={() => setEstado(value)} className={`px-3 py-1 rounded text-sm ${estado === value ? "bg-blue-600 text-white" : "bg-gray-200"}`}>{value}</button>
          ))}
        </div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, equipo, código, pedido o técnico..." className="w-full border p-2 rounded text-sm" />
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-2 max-h-[420px] overflow-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400">Sin resultados</p>
        ) : (
          filtered.map((item) => {
            const protocol = PROTOCOL_BY_SUBTIPO[item.subtipo] || PROTOCOLS[0];
            return (
              <div key={item.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1 uppercase">{protocol.label} - {item.estado}</p>
                  <p className="font-semibold text-gray-900">{item.data?.cliente || "Sin cliente"}</p>
                  <p className="text-xs text-gray-600">Equipo: <strong>{item.data?.equipoNo || "-"}</strong> | Código: <strong>{item.data?.codInf || "-"}</strong></p>
                  <p className="text-xs text-gray-500">Pedido: <strong>{item.data?.pedidoDemanda || "-"}</strong> | Técnico: <strong>{item.data?.tecnicoNombre || "-"}</strong></p>
                  <p className="text-xs text-gray-400">{new Date(item.updated_at || item.created_at).toLocaleString()}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded text-white text-[10px] ${item.estado === "completado" ? "bg-green-600" : "bg-yellow-500"}`}>{item.estado === "completado" ? "Completado" : "Borrador"}</span>
                </div>
                <div className="flex gap-3 text-xs shrink-0">
                  <button onClick={() => navigate(`/vehiculos/protocolos/${protocol.path}/ver/${item.id}`)} className="font-semibold text-slate-600 hover:underline">Ver</button>
                  {item.estado === "completado" && canDownload(item) && <button onClick={() => navigate(`/vehiculos/protocolos/${protocol.path}/${item.id}/pdf`)} className="text-green-600 font-semibold hover:underline">PDF</button>}
                  {canEdit(item) && <button onClick={() => navigate(`/vehiculos/protocolos/${protocol.path}/${item.id}`)} className="text-blue-600 hover:underline">Abrir</button>}
                  {canEdit(item) && <button onClick={() => handleDuplicate(item)} className="font-semibold text-amber-600 hover:underline">Duplicar</button>}
                  {(puedeVerTodoVehiculos || isOwn(item)) && <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline">Eliminar</button>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
