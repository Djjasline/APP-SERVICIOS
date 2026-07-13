import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">

      {/* 🌄 FONDO */}
      <img
        src="/background-astap.png"
        alt=""
        aria-hidden="true"
        className="absolute w-full h-full object-cover"
      />

      {/* 🔥 CAPA OSCURA */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 💎 CARD GLASS */}
      <div className="relative z-10 w-[350px] p-8 rounded-2xl 
        backdrop-blur-xl bg-white/10 border border-white/20 
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        <h1 className="text-white text-xl font-semibold text-center mb-6">
          ASTAP Login
        </h1>

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
          <input
            type="password"
            aria-label="Contrasena"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg 
            bg-white/20 text-white placeholder-white/70 
            border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400
            disabled:opacity-50"
          />

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

      </div>
    </div>
  );
}
