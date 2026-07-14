import { supabase } from "@/lib/supabase";

const normalize = (value) => String(value || "").trim().toLowerCase();

export async function getAccessProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, department")
    .not("email", "is", null)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAllRecordAccessPermissions() {
  const { data, error } = await supabase
    .from("record_access_permissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getRecordAccessPermissionsForUser(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("record_access_permissions")
    .select("*")
    .eq("grantee_user_id", userId)
    .eq("active", true);

  if (error) throw error;
  return enrichPermissionsWithOwnerProfiles(data || []);
}

export async function getAccessibleRecordsForUser({
  userId,
  userEmail = "",
  area,
  tipo,
  subtipo = "",
  canViewAll = false,
  action = "view",
}) {
  if (!userId) return { records: [], permissions: [] };

  const permissions = await getRecordAccessPermissionsForUser(userId);
  const baseQuery = () => {
    let query = supabase
      .from("registros")
      .select("*")
      .eq("area", area)
      .eq("tipo", tipo)
      .order("created_at", { ascending: false });

    if (subtipo) query = query.eq("subtipo", subtipo);
    return query;
  };

  if (canViewAll) {
    const { data, error } = await baseQuery();
    if (error) throw error;
    return { records: data || [], permissions };
  }

  const normalizedUserEmail = normalize(userEmail);
  const { data, error } = await baseQuery();

  if (error) throw error;

  const records = (data || []).filter((record) => {
    const ownRecord = record.user_id === userId || normalize(record.data?.tecnicoCorreo) === normalizedUserEmail;
    return ownRecord || canAccessRecord({ record, userId, permissions, isSuperAdmin: false, action });
  });

  return { records, permissions };
}

export async function saveRecordAccessPermission(permission) {
  const ownerProfile = await getProfileById(permission.owner_user_id);

  const payload = {
    grantee_user_id: permission.grantee_user_id,
    owner_user_id: permission.owner_user_id,
    owner_email: ownerProfile?.email || permission.owner_email || "",
    owner_name: ownerProfile?.full_name || permission.owner_name || "",
    area: permission.area || "vehiculos",
    tipo: permission.tipo || "todos",
    can_view: !!permission.can_view,
    can_edit: !!permission.can_edit,
    can_download: !!permission.can_download,
    active: permission.active !== false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("record_access_permissions")
    .upsert(payload, {
      onConflict: "grantee_user_id,owner_user_id,area,tipo",
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteRecordAccessPermission(id) {
  const { error } = await supabase
    .from("record_access_permissions")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export function getPermittedOwnerIds(permissions, area, tipo, action = "view", subtipo = "") {
  return (permissions || [])
    .filter((permission) => permissionMatchesScope(permission, area, tipo, subtipo))
    .filter((permission) => hasPermissionAction(permission, action))
    .map((permission) => permission.owner_user_id)
    .filter(Boolean);
}

export function getPermittedOwnerEmails(permissions, area, tipo, action = "view", subtipo = "") {
  return (permissions || [])
    .filter((permission) => permissionMatchesScope(permission, area, tipo, subtipo))
    .filter((permission) => hasPermissionAction(permission, action))
    .map((permission) => normalize(permission.owner_email))
    .filter(Boolean);
}

export function canAccessRecord({ record, userId, permissions, isSuperAdmin, action = "view" }) {
  if (!record) return false;
  if (isSuperAdmin) return true;
  if (record.user_id && record.user_id === userId) return true;

  return (permissions || []).some((permission) => {
    const ownerMatches =
      permission.owner_user_id === record.user_id ||
      (permission.owner_email && normalize(record.data?.tecnicoCorreo) === normalize(permission.owner_email));

    if (!ownerMatches) return false;
    if (!permissionMatchesScope(permission, record.area, record.tipo, record.subtipo)) return false;
    return hasPermissionAction(permission, action);
  });
}

export function mergeRecords(...groups) {
  const map = new Map();
  groups.flat().filter(Boolean).forEach((record) => {
    map.set(record.id, record);
  });
  return Array.from(map.values());
}

function permissionMatchesScope(permission, area, tipo, subtipo = "") {
  const permissionArea = normalize(permission.area || "todos");
  const [permissionTipo, permissionSubtipo = ""] = normalize(permission.tipo || "todos").split(":");
  const recordArea = normalize(area || "vehiculos");
  const recordTipo = normalize(tipo || "todos");
  const recordSubtipo = normalize(subtipo || "");

  const areaMatches = permissionArea === "todos" || permissionArea === recordArea;
  const tipoMatches =
    permissionTipo === "todos" ||
    (permissionTipo === recordTipo && (!permissionSubtipo || !recordSubtipo || permissionSubtipo === recordSubtipo));

  return areaMatches && tipoMatches && permission.active !== false;
}

function hasPermissionAction(permission, action) {
  if (action === "edit") return !!permission.can_edit;
  if (action === "download") return !!permission.can_download;
  return !!permission.can_view || !!permission.can_edit || !!permission.can_download;
}

async function enrichPermissionsWithOwnerProfiles(permissions) {
  const permissionsWithEmail = (permissions || []).filter((permission) => permission.owner_email);
  if (permissionsWithEmail.length === (permissions || []).length) return permissions || [];

  const ownerIds = Array.from(new Set((permissions || []).map((permission) => permission.owner_user_id).filter(Boolean)));
  if (ownerIds.length === 0) return permissions || [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ownerIds);

  if (error) {
    console.error("Error cargando perfiles dueños de permisos:", error);
    return permissions || [];
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return (permissions || []).map((permission) => {
    const ownerProfile = profileById.get(permission.owner_user_id);

    return {
      ...permission,
      owner_email: permission.owner_email || ownerProfile?.email || "",
      owner_name: permission.owner_name || ownerProfile?.full_name || "",
    };
  });
}

async function getProfileById(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error cargando perfil de permiso:", error);
    return null;
  }

  return data;
}
