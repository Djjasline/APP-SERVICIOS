import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Esperar a que Supabase resuelva la sesión antes de redirigir
  if (loading) {
    return (
      <div className="app-loading-shell min-h-screen bg-slate-950 px-4 text-white">
        <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg">
            <img src="/astap-logo.jpg" alt="ASTAP" width="56" height="56" className="mx-auto h-14 w-14 rounded-lg bg-white object-contain" />
          </div>
          <h1 className="text-xl font-semibold">APP Servicios ASTAP</h1>
          <p className="mt-2 text-sm text-white/70">Verificando acceso seguro...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
