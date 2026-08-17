import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { resolveAuthAccess } from "@/constants/privilegedAccess.mjs";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser) => {
    if (!authUser?.id) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Error cargando perfil:", error);
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  };

  useEffect(() => {
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

  const refreshProfile = () => loadProfile(user);

  const access = resolveAuthAccess({
    email: user?.email,
    profileRole: profile?.role || user?.user_metadata?.role,
  });
  const { email, role, roles } = access;

  const department = profile?.department || "";
  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";

  const {
    isSuperAdmin,
    isSupervisorOperaciones,
    isProveedorVehiculos,
    isSupervisorProyecto,
    isTechnicalUser,
  } = access;
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
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
