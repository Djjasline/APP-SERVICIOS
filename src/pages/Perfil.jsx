import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";

const DEPARTMENTS = [
  "Vehículos Especiales",
  "Agua y Saneamiento",
  "Petróleo y Energía",
  "Operaciones",
  "Administración",
];

export default function Perfil() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [perfil, setPerfil]       = useState({ full_name: "", phone: "", department: "", avatar_url: "" });
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mensaje, setMensaje]     = useState(null);

  /* ── CARGAR PERFIL ── */
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setPerfil({
          full_name:   data.full_name   || "",
          phone:       data.phone       || "",
          department:  data.department  || "",
          avatar_url:  data.avatar_url  || "",
        });
      }
      setLoading(false);
    };

    load();
  }, [user]);

  /* ── GUARDAR PERFIL ── */
  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name:  perfil.full_name,
        phone:      perfil.phone,
        department: perfil.department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setMensaje({ tipo: "error", texto: "Error al guardar. Intenta de nuevo." });
    } else {
      setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente ✅" });
    }

    setGuardando(false);
  };

  /* ── SUBIR AVATAR ── */
  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMensaje(null);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });

      const ext      = file.name.split(".").pop();
      const fileName = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("registros")
        .upload(fileName, compressed, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("registros")
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      setPerfil((p) => ({ ...p, avatar_url: avatarUrl }));
      setMensaje({ tipo: "ok", texto: "Foto actualizada ✅" });
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error subiendo la foto." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* ── UI ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Cargando perfil...
      </div>
    );
  }

  const iniciales = perfil.full_name
    ? perfil.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="max-w-lg mx-auto my-10 bg-white rounded-2xl shadow p-8 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Mi perfil</h1>
        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-1 rounded text-sm hover:bg-gray-50"
        >
          ← Volver
        </button>
      </div>

      {/* AVATAR */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {perfil.avatar_url ? (
            <img
              src={perfil.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {iniciales}
            </div>
          )}

        // DESPUÉS — cámara + galería
<div className="absolute bottom-0 right-0 flex gap-1">

  {/* CÁMARA */}
  <label className="bg-white border rounded-full p-1 cursor-pointer shadow hover:bg-gray-50" title="Tomar foto">
    {uploadingAvatar ? "⏳" : "📷"}
    <input
      type="file"
      accept="image/*"
      capture="user"
      className="hidden"
      onChange={handleAvatar}
      disabled={uploadingAvatar}
    />
  </label>

  {/* GALERÍA */}
  <label className="bg-white border rounded-full p-1 cursor-pointer shadow hover:bg-gray-50" title="Elegir de galería">
    🖼️
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleAvatar}
      disabled={uploadingAvatar}
    />
  </label>

</div>  
        </div>

        <p className="text-xs text-gray-400">Toca 📷 para cambiar la foto</p>
      </div>

      {/* EMAIL (solo lectura) */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Correo electrónico
        </label>
        <div className="border rounded-lg px-3 py-2 bg-gray-50 text-gray-600 text-sm">
          {user?.email}
        </div>
      </div>

      {/* ROL (solo lectura) */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Rol
        </label>
        <div className="border rounded-lg px-3 py-2 bg-gray-50 text-sm">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            role === "super_admin" ? "bg-purple-100 text-purple-700" :
            role === "admin"       ? "bg-blue-100 text-blue-700" :
                                     "bg-gray-100 text-gray-700"
          }`}>
            {role || "—"}
          </span>
        </div>
      </div>

      {/* NOMBRE COMPLETO */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Nombre completo
        </label>
        <input
          value={perfil.full_name}
          onChange={(e) => setPerfil((p) => ({ ...p, full_name: e.target.value }))}
          placeholder="Ej: Juan Pérez"
          className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* TELÉFONO */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Teléfono
        </label>
        <input
          value={perfil.phone}
          onChange={(e) => setPerfil((p) => ({ ...p, phone: e.target.value }))}
          placeholder="Ej: 0991234567"
          type="tel"
          className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* DEPARTAMENTO */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Área / Departamento
        </label>
        <select
          value={perfil.department}
          onChange={(e) => setPerfil((p) => ({ ...p, department: e.target.value }))}
          className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Seleccionar área...</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div className={`text-sm px-4 py-3 rounded-lg ${
          mensaje.tipo === "ok"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* GUARDAR */}
      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition"
      >
        {guardando ? "Guardando..." : "💾 Guardar cambios"}
      </button>

    </div>
  );
}
