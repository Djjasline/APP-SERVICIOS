import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Esperar a que Supabase resuelva la sesión antes de redirigir
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
