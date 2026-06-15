import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

const SUPER_ADMIN_EMAIL = "smaviles@astap.com";
const SUPERVISOR_OPERACIONES_EMAIL = "kamhez@astap.com";

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

  const email = user?.email?.toLowerCase() || "";

  const role =
    email === SUPER_ADMIN_EMAIL
      ? "super_admin"
      : email === SUPERVISOR_OPERACIONES_EMAIL
      ? "supervisor_operaciones"
      : profile?.role || user?.user_metadata?.role || "tecnico";

  const department = profile?.department || "";
  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";

  const isSuperAdmin = role === "super_admin";
  const isSupervisorOperaciones = role === "supervisor_operaciones";
  const isProveedorVehiculos = role === "proveedor_vehiculos";
  const isSupervisorProyecto = role === "supervisor_proyecto";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        email,
        role,
        department,
        fullName,
        isSuperAdmin,
        isSupervisorOperaciones,
        isProveedorVehiculos,
        isSupervisorProyecto,
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
