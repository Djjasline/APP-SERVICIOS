import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");

  const handleLogin = () => {
    const ok = login(form.user, form.pass);
    if (ok) {
      navigate("/");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] to-[#0f172a]">

      <div className="glass shadow-glass rounded-2xl p-8 w-[350px] space-y-4">

        <h2 className="text-center text-xl font-bold text-white">
          ASTAP Login
        </h2>

        <input
          placeholder="Usuario"
          className="w-full p-2 rounded bg-white/10 text-white outline-none"
          onChange={(e) => setForm({ ...form, user: e.target.value })}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 rounded bg-white/10 text-white outline-none"
          onChange={(e) => setForm({ ...form, pass: e.target.value })}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
