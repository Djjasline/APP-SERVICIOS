import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getLoginErrorMessage(message = "") {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "El correo del usuario no está confirmado.";
  }

  if (normalized.includes("too many requests")) {
    return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "No se pudo conectar con el servidor. Revisa la conexión.";
  }

  return message || "No se pudo iniciar sesión.";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(getLoginErrorMessage(result.message));
    }
  };

  return (
    <div className="login-bg relative h-screen w-full flex items-center justify-center overflow-hidden px-4">
      {/* 💎 CARD GLASS */}
      <main id="acceso" className="relative z-10 w-[350px] p-8 rounded-2xl 
        backdrop-blur-xl bg-white/10 border border-white/20 
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        <h1 className="text-white text-xl font-semibold text-center mb-6">
          ASTAP Login
        </h1>

        <h2 id="seguridad" className="text-white/90 text-sm font-medium text-center mb-4">
          Acceso seguro a servicios tecnicos
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL */}
          <input
            type="email"
            aria-label="Correo electronico"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg 
            bg-white/20 text-white placeholder-white/70 
            border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400
            disabled:opacity-50"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              aria-label="Contrasena"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 pr-11 rounded-lg 
              bg-white/20 text-white placeholder-white/70 
              border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400
              disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={loading}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-white/80 hover:text-white disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg 
            bg-gradient-to-r from-blue-500 to-purple-600 
            text-white font-semibold 
            hover:opacity-90 transition
            disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <nav className="mt-5 flex justify-center gap-4 text-xs text-white/80" aria-label="Enlaces internos">
          <a href="#acceso" className="hover:text-white hover:underline">
            Acceso
          </a>
          <a href="#seguridad" className="hover:text-white hover:underline">
            Seguridad
          </a>
        </nav>

      </main>
    </div>
  );
}
