import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { user, role, roles, loading, isSuperAdmin, isTechnicalUser } = useAuth();

  /*
    Esperar a que Supabase resuelva la sesión.
    Esto evita redirecciones falsas al refrescar la página.
  */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-sm text-white/70">
          Verificando acceso...
        </div>
      </div>
    );
  }

  /*
    Si no hay usuario autenticado,
    enviamos al login y guardamos desde dónde venía.
  */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
    Super admin tiene acceso total.
    Esto protege aunque alguna ruta olvide agregar "super_admin"
    en allowedRoles.
  */
  if (isSuperAdmin || role === "super_admin") {
    return children;
  }

  /*
    Si una ruta no define roles permitidos,
    por seguridad se bloquea.
  */
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    console.warn("RoleRoute: allowedRoles no definido para esta ruta.");
    return <Navigate to="/" replace />;
  }

  /*
    Validación normal por rol.
  */
  const userRoles = Array.isArray(roles) && roles.length > 0 ? roles : [role];

  if (allowedRoles.includes("tecnico") && isTechnicalUser) {
    return children;
  }

  if (!allowedRoles.some((allowedRole) => userRoles.includes(allowedRole))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
