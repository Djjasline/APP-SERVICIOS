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
      return (
  <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">

    {/* 🌄 FONDO */}
    <img
      src="/background-astap.png"
      className="absolute w-full h-full object-cover"
    />

    {/* 🔥 CAPA OSCURA */}
    <div className="absolute inset-0 bg-black/40" />

    {/* 💎 CARD GLASS */}
    <div className="relative z-10 w-[350px] p-8 rounded-2xl 
      backdrop-blur-xl bg-white/10 border border-white/20 
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

      <h2 className="text-white text-xl font-semibold text-center mb-6">
        ASTAP Login
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* USER */}
        <input
          type="text"
          placeholder="Correo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="w-full px-4 py-2 rounded-lg 
          bg-white/20 text-white placeholder-white/70 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg 
          bg-white/20 text-white placeholder-white/70 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* BOTÓN */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg 
          bg-gradient-to-r from-blue-500 to-purple-600 
          text-white font-semibold 
          hover:opacity-90 transition"
        >
          Ingresar
        </button>

      </form>

    </div>
  </div>
);
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
