import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

const SUPER_ADMIN_EMAIL = "smaviles@astap.com";
const SUPERVISOR_OPERACIONES_EMAIL = "kamhez@astap.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

    return { success: true, user: data.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const email = user?.email?.toLowerCase() || "";

  const role =
  email === SUPER_ADMIN_EMAIL
    ? "super_admin"
    : email === SUPERVISOR_OPERACIONES_EMAIL
    ? "supervisor_operaciones"
    : user?.user_metadata?.role || "tecnico";

  const isSuperAdmin = role === "super_admin";
const isSupervisorOperaciones =
  role === "supervisor_operaciones";
  return (
    <AuthContext.Provider
  value={{
    user,
    email,
    role,
    isSuperAdmin,
    isSupervisorOperaciones,
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
