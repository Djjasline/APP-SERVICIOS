import { useEffect, useState } from "react";
import { isConfiguratorOwner } from "@/constants/accessControl";
import { useAuth } from "@/context/AuthContext";
import { getSpecialModulePermissionsForUser } from "@/services/accessControlService";

export function useSpecialModuleAccess() {
  const { user, email, loading, isSuperAdmin } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [checking, setChecking] = useState(true);
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const userEmail = email || user?.email;

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      setChecking(true);

      if (!user?.id || superAdminActivo) {
        if (mounted) {
          setPermissions({});
          setChecking(false);
        }
        return;
      }

      try {
        const access = await getSpecialModulePermissionsForUser(user.id);
        if (mounted) setPermissions(access || {});
      } catch (error) {
        console.error("Error cargando permisos especiales:", error);
        if (mounted) setPermissions({});
      } finally {
        if (mounted) setChecking(false);
      }
    }

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, [superAdminActivo, user?.id]);

  const hasSpecialModuleAccess = (moduleKey) => {
    if (superAdminActivo) return true;
    if (moduleKey === "configurador" && isConfiguratorOwner(userEmail)) return true;
    return !!permissions[moduleKey];
  };

  return {
    checkingSpecialModules: loading || checking,
    hasSpecialModuleAccess,
    specialModulePermissions: permissions,
    superAdminActivo,
  };
}
