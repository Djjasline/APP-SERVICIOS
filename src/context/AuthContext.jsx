import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

const SUPER_ADMIN_EMAIL = "smaviles@astap.com";
const SUPERVISOR_OPERACIONES_EMAILS = ["kamhez@astap.com"];
const SUPERVISOR_PROYECTO_EMAILS = ["abriones@astap.com"];
const TECHNICAL_USER_EMAILS = ["abriones@astap.com"];

const normalizeRole = (value) => String(value || "").trim().toLowerCase();
const COMMERCIAL_ROLES = ["ing. comercial", "ingeniero comercial", "comercial"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (authUser) => {
      if (!authUser?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error);
        setProfile(null);
        return;
      }

      setProfile(data);
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await loadProfile(authUser);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await loadProfile(authUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    setUser(data.user);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error cargando perfil en login:", profileError);
      setProfile(null);
    } else {
      setProfile(profileData);
    }

    return { success: true, user: data.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const email = user?.email?.trim().toLowerCase() || "";

  const profileRole = normalizeRole(profile?.role || user?.user_metadata?.role);
  const emailRoles = [
    email === SUPER_ADMIN_EMAIL ? "super_admin" : null,
    SUPERVISOR_OPERACIONES_EMAILS.includes(email) ? "supervisor_operaciones" : null,
    SUPERVISOR_PROYECTO_EMAILS.includes(email) ? "supervisor_proyecto" : null,
    TECHNICAL_USER_EMAILS.includes(email) ? "tecnico" : null,
  ].filter(Boolean);

  const role = emailRoles[0] || profileRole || "tecnico";
  const hasCommercialAccess = COMMERCIAL_ROLES.includes(profileRole);
  const hasTechnicalAccess = !!user?.id;

  const roles = Array.from(
    new Set([
      role,
      ...emailRoles,
      profileRole,
      ...(hasCommercialAccess ? ["comercial"] : []),
      ...(hasTechnicalAccess ? ["tecnico"] : []),
    ].filter(Boolean))
  );

  const department = profile?.department || "";
  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";

  const isSuperAdmin = roles.includes("super_admin");
  const isSupervisorOperaciones = roles.includes("supervisor_operaciones");
  const isProveedorVehiculos = roles.includes("proveedor_vehiculos");
  const isSupervisorProyecto = roles.includes("supervisor_proyecto");
  const isTechnicalUser = hasTechnicalAccess || roles.includes("tecnico");
  const isProveedorVehiculosOnly = isProveedorVehiculos && !isTechnicalUser;
  const roleLabel = roles.join(" / ");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        email,
        role,
        roles,
        roleLabel,
        department,
        fullName,
        isSuperAdmin,
        isSupervisorOperaciones,
        isProveedorVehiculos,
        isProveedorVehiculosOnly,
        isSupervisorProyecto,
        isTechnicalUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
