import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  canAccessRecord,
  getRecordAccessPermissionsForUser,
} from "@/services/accessControlService";

export default function RecordPermissionRoute({ children, action = "view", fallback = "/" }) {
  const { id } = useParams();
  const { user, isSuperAdmin, isSupervisorProyecto, isSupervisorOperaciones } = useAuth();
  const [allowed, setAllowed] = useState(null);

  const superAdminActivo =
    typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const supervisorProyectoActivo =
    typeof isSupervisorProyecto === "function" ? isSupervisorProyecto() : !!isSupervisorProyecto;
  const supervisorOperacionesActivo =
    typeof isSupervisorOperaciones === "function" ? isSupervisorOperaciones() : !!isSupervisorOperaciones;

  useEffect(() => {
    if (!id || id === "new") {
      setAllowed(true);
      return;
    }

    if (!user?.id) {
      setAllowed(false);
      return;
    }

    const loadAccess = async () => {
      const { data: record, error } = await supabase
        .from("registros")
        .select("id, user_id, area, tipo, subtipo, data")
        .eq("id", id)
        .maybeSingle();

      if (error || !record) {
        console.error("Error validando acceso al registro:", error);
        setAllowed(false);
        return;
      }

      const area = record.area || record.data?.area || "vehiculos";
      const ownRecord =
        record.user_id === user.id ||
        (record.data?.tecnicoCorreo && record.data.tecnicoCorreo === user.email);

      if (
        superAdminActivo ||
        (area === "vehiculos" && supervisorProyectoActivo) ||
        (area === "operaciones" && supervisorOperacionesActivo) ||
        ownRecord
      ) {
        setAllowed(true);
        return;
      }

      const permissions = await getRecordAccessPermissionsForUser(user.id);
      setAllowed(
        canAccessRecord({
          record,
          userId: user.id,
          permissions,
          isSuperAdmin: superAdminActivo,
          action,
        })
      );
    };

    loadAccess();
  }, [action, id, user?.id, user?.email, superAdminActivo, supervisorProyectoActivo, supervisorOperacionesActivo]);

  if (allowed === null) {
    return <div className="p-6 text-sm text-slate-500">Validando permisos...</div>;
  }

  if (!allowed) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
