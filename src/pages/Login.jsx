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
    <div className="login-bg relative min-h-screen w-full flex items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-6">
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-5 lg:flex-row lg:items-stretch">
      {/* 💎 CARD GLASS */}
      <main id="acceso" className="w-[350px] p-8 rounded-2xl
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
              className="absolute inset-y-0 right-0 flex items-center px-3 text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.9)] hover:text-lime-300 disabled:opacity-50"
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

      <aside className="w-[350px] rounded-2xl border border-white/25 bg-white/90 p-5 text-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="h-12 w-12 rounded-lg bg-white object-contain shadow-sm"
          />

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-900">
              ASTAP CIA. LTDA.
            </p>
            <p className="text-xs text-slate-500">
              Servicios técnicos especializados
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <a
            href="https://www.astap.com"
            target="_blank"
            rel="noreferrer"
            className="relative rounded-xl bg-white p-2 shadow-md transition hover:scale-[1.02]"
            aria-label="Abrir sitio web ASTAP"
          >
            <img
              src="/astap-qr.svg"
              alt="Código QR del sitio web ASTAP"
              className="h-32 w-32"
            />
            <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
              <img src="/astap-logo.jpg" alt="" className="h-5 w-5 rounded-full object-contain" />
            </span>
          </a>

          <address className="not-italic text-sm leading-6 text-slate-700">
            <strong className="block text-slate-900">Contacto ASTAP</strong>
            Naciones Unidas 1084 y Amazonas<br />
            Quito, Ecuador<br />
            Cel: 099 851 1717<br />
            Teléfono: 02-22262154<br />
            <a href="https://www.astap.com" target="_blank" rel="noreferrer" className="font-semibold text-red-600 hover:underline">
              www.astap.com
            </a>
          </address>
        </div>
      </aside>
      </div>
    </div>
  );
}
