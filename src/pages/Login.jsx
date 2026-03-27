import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = login(email, password);

    if (success) {
      navigate("/");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]">
      
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-lg w-80 space-y-4"
      >
        <h2 className="text-white text-lg font-semibold text-center">
          ASTAP Login
        </h2>

        {/* 🔥 AUTOFOCUS AQUÍ */}
        <input
          type="email"
          placeholder="Usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          className="w-full p-2 rounded bg-white/20 text-white outline-none"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-white/20 text-white outline-none"
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded transition"
        >
          Ingresar
        </button>
      </form>

    </div>
  );
}
