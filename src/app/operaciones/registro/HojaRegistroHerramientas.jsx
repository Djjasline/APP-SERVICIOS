import React, { useEffect, useRef, useState } from "react";
import { useAutoguardado, limpiarBorrador } from "@/hooks/useAutoguardado";
import BannerAutoguardado from "@/components/BannerAutoguardado";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { TECHNICIANS } from "@/data/technicians";
import { getRegistroById, updateRegistro, } from "@/utils/registroStorage";
import { uploadRegistroImage } from "@/utils/storage";
import imageCompression from "browser-image-compression";
import { useTheme } from "@/context/ThemeContext";

export default function HojaRegistroHerramientas() {
  const { id } = useParams();
  const isEditing = !!id;
  const claveAutoguardado = `registro_herramientas_${id ?? "new"}`;
  const navigate = useNavigate();
  const { isLight } = useTheme();

  const firmaResponsableRef = useRef(null);
  const firmaAprobadorRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const baseState = {
  items: [],
  firmas: {
    responsable: "",
    aprobador: "",
  },
};

const [formData, setFormData] = useState(baseState); const [estado, setEstado] = useState("salida"); const isLocked = estado === "completado";

// Autoguardado automático cada 15 segundos
useAutoguardado(claveAutoguardado, formData, !isLocked);
  /* ================= CARGAR REGISTRO ================= */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const registro = await getRegistroById(id);

      if (registro?.data) {
        setFormData({
          items: registro.data.items || [],
          firmas: registro.data.firmas || {
            responsable: "",
            aprobador: "",
          },
        });

        setEstado(registro.estado || "salida");
      }
    };

    load();
  }, [id]);

  /* ================= AGREGAR ITEM ================= */
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
       {
  id: Date.now(),
  detalle: "",
  pedido: "",
  cantidad: "",
  estadoSalida: "",
  observacionesSalida: "",
  tecnicoSalida: "",
  fechaSalida: new Date().toISOString().split("T")[0],
  imagenSalidaUrl: "",
  estadoIngreso: "",
  observacionesIngreso: "",
  fechaIngreso: "",
  tecnicoIngreso: "",
  imagenIngresoUrl: "",
},
      ],
    }));
  };

  /* ================= ELIMINAR ITEM ================= */
  const removeItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  /* ================= ACTUALIZAR ITEM ================= */
  const updateItem = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  /* ================= SUBIR IMAGEN ================= */
  const handleImageUpload = async (e, itemId, campo) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      const url = await uploadRegistroImage(compressedFile, id, campo);
      if (!url) return;

      updateItem(itemId, campo, url);
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  /* ================= GUARDAR ================= */
const handleSubmit = async (e) => {
  e.preventDefault();
  setGuardando(true);

  try {
    const firmaResponsable = firmaResponsableRef.current?.isEmpty()
      ? formData.firmas?.responsable || ""
      : firmaResponsableRef.current.toDataURL();

    const firmaAprobador = firmaAprobadorRef.current?.isEmpty()
      ? formData.firmas?.aprobador || ""
      : firmaAprobadorRef.current.toDataURL();

    const payload = {
      ...formData,
      firmas: {
        responsable: firmaResponsable,
        aprobador: firmaAprobador,
      },
    };

    const allIngresosCompletos =
      payload.items.length > 0 &&
      payload.items.every((item) => item.imagenIngresoUrl);

    const nuevoEstado =
      allIngresosCompletos && firmaResponsable && firmaAprobador
        ? "completado"
        : "salida";

    await updateRegistro(id, payload, nuevoEstado);
    setEstado(nuevoEstado);

    alert("Guardado correctamente");

    limpiarBorrador(claveAutoguardado);
    navigate("/operaciones/registro");
  } catch (error) {
    console.error("Error guardando:", error);
    alert("Error al guardar. Intenta de nuevo.");
  } finally {
    setGuardando(false);
  }
};
  /* ================= BOTÓN DE IMAGEN ================= */
  const ImagenCell = ({ item, campo, label }) => {
    const url = item[campo];

    if (url) {
      return (
        <div className="flex flex-col items-center gap-1">
          <img
            src={url}
            alt={label}
            className="h-16 border rounded cursor-pointer object-cover"
            onClick={() => setPreviewImage(url)}
          />
          {!isLocked && (
            <button
              type="button"
              onClick={() => updateItem(item.id, campo, "")}
              className="text-red-500 text-[10px] hover:underline"
            >
              ❌ Quitar
            </button>
          )}
        </div>
      );
    }

    if (isLocked) return <span className="text-gray-400 text-xs">—</span>;

    return (
      <div className="flex flex-col gap-1">
        <label className="bg-gray-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer text-center">
          📁 Galería
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, item.id, campo)}
          />
        </label>
        <label className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer text-center">
          📷 Cámara
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleImageUpload(e, item.id, campo)}
          />
        </label>
      </div>
    );
  };

  /* ================= RENDER ================= */
  const pageClass = isLight
    ? "bg-white text-slate-900"
    : "bg-slate-900/95 text-white border border-white/10";

  const cardClass = isLight
    ? "bg-white border-slate-200"
    : "bg-white/10 border-white/10";

  const sectionClass = isLight
    ? "bg-slate-50 border-slate-200"
    : "bg-slate-950/40 border-white/10";

  const inputClass = isLight
    ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
    : "bg-slate-950/70 border-white/20 text-white placeholder:text-white/40 disabled:bg-white/5 disabled:text-white/40";

  const labelClass = isLight ? "text-slate-700" : "text-white/80";
  const mutedClass = isLight ? "text-slate-500" : "text-white/60";

  const Field = ({ label, children }) => (
    <label className="space-y-1 text-xs">
      <span className={`font-semibold ${labelClass}`}>{label}</span>
      {children}
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`max-w-5xl mx-auto my-6 shadow rounded-xl p-6 space-y-6 ${pageClass}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-semibold">
          Registro de salida e ingreso de herramientas
        </h1>

        {estado === "completado" && (
          <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
            ✅ Registro cerrado
          </span>
        )}
        {estado !== "completado" && (
          <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
            🔴 En campo
          </span>
        )}
      </div>

      {/* BOTÓN AGREGAR */}
      {!isLocked && (
        <button
          type="button"
          onClick={addItem}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
        >
          + Agregar herramienta
        </button>
      )}

      {/* ================= HERRAMIENTAS — formato vertical ================= */}
      <div className="space-y-4">
        <BannerAutoguardado
          clave={claveAutoguardado}
          onRestaurar={(datosGuardados) => setFormData(datosGuardados)}
          isEditing={isEditing}
        />

        {formData.items.length === 0 && (
          <div className={`rounded-xl border p-8 text-center text-sm ${sectionClass} ${mutedClass}`}>
            Sin herramientas. Haz clic en "+ Agregar herramienta".
          </div>
        )}

        {formData.items.map((item, index) => {
          const ingresoCompleto = !!item.imagenIngresoUrl;

          return (
            <div key={item.id} className={`rounded-2xl border p-4 shadow-sm space-y-4 ${cardClass}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Herramienta {index + 1}
                  </p>
                  <p className={`text-xs ${mutedClass}`}>
                    {ingresoCompleto ? "Ingreso completo" : "Pendiente de ingreso"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ingresoCompleto ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {ingresoCompleto ? "Completo" : "Pendiente"}
                  </span>

                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${sectionClass}`}>
                <h2 className="mb-3 text-sm font-semibold">Datos de herramienta</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Herramienta / Detalle">
                    <input
                      value={item.detalle}
                      onChange={(e) => updateItem(item.id, "detalle", e.target.value)}
                      disabled={isLocked}
                      placeholder="Descripción herramienta"
                      className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                    />
                  </Field>

                  <Field label="N° Pedido">
                    <input
                      value={item.pedido}
                      onChange={(e) => updateItem(item.id, "pedido", e.target.value)}
                      disabled={isLocked}
                      placeholder="N° Pedido"
                      className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                    />
                  </Field>

                  <Field label="Cantidad">
                    <input
                      value={item.cantidad || ""}
                      onChange={(e) => updateItem(item.id, "cantidad", e.target.value)}
                      disabled={isLocked}
                      placeholder="Cantidad"
                      className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                    />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`rounded-xl border p-4 ${sectionClass}`}>
                  <h2 className="mb-3 text-sm font-semibold">Salida</h2>
                  <div className="space-y-3">
                    <Field label="Estado salida">
                      <input
                        value={item.estadoSalida || ""}
                        onChange={(e) => updateItem(item.id, "estadoSalida", e.target.value)}
                        disabled={isLocked}
                        placeholder="Estado salida"
                        className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      />
                    </Field>

                    <Field label="Técnico salida">
                      <select
                        value={item.tecnicoSalida}
                        onChange={(e) => updateItem(item.id, "tecnicoSalida", e.target.value)}
                        disabled={isLocked}
                        className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      >
                        <option value="">Seleccione</option>
                        {TECHNICIANS.map((t) => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Fecha salida">
                      <input
                        type="date"
                        value={item.fechaSalida || ""}
                        onChange={(e) => updateItem(item.id, "fechaSalida", e.target.value)}
                        disabled={isLocked}
                        className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      />
                    </Field>

                    <Field label="Foto antes">
                      <div className={`rounded border p-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-950/60 border-white/10"}`}>
                        <ImagenCell item={item} campo="imagenSalidaUrl" label="Foto antes" />
                      </div>
                    </Field>

                    <Field label="Observaciones salida">
                      <textarea
                        value={item.observacionesSalida || ""}
                        onChange={(e) => updateItem(item.id, "observacionesSalida", e.target.value)}
                        disabled={isLocked}
                        placeholder="Observaciones al momento de salida"
                        className={`min-h-[90px] w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      />
                    </Field>
                  </div>
                </div>

                <div className={`rounded-xl border p-4 ${sectionClass}`}>
                  <h2 className="mb-3 text-sm font-semibold">Ingreso</h2>
                  <div className="space-y-3">
                    <Field label="Estado ingreso">
                      <input
                        value={item.estadoIngreso || ""}
                        onChange={(e) => updateItem(item.id, "estadoIngreso", e.target.value)}
                        disabled={isLocked}
                        placeholder="Estado ingreso"
                        className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      />
                    </Field>

                    <Field label="Técnico ingreso">
                      <select
                        value={item.tecnicoIngreso || ""}
                        onChange={(e) => updateItem(item.id, "tecnicoIngreso", e.target.value)}
                        disabled={isLocked}
                        className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      >
                        <option value="">Seleccione</option>
                        {TECHNICIANS.map((t) => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Fecha ingreso">
                      <input
                        type="date"
                        value={item.fechaIngreso || ""}
                        onChange={(e) => updateItem(item.id, "fechaIngreso", e.target.value)}
                        disabled={isLocked}
                        className={`w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      />
                    </Field>

                    <Field label="Foto después">
                      <div className={`rounded border p-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-950/60 border-white/10"}`}>
                        <ImagenCell item={item} campo="imagenIngresoUrl" label="Foto después" />
                      </div>
                    </Field>

                    <Field label="Observaciones ingreso">
                      <textarea
                        value={item.observacionesIngreso || ""}
                        onChange={(e) => updateItem(item.id, "observacionesIngreso", e.target.value)}
                        disabled={isLocked}
                        placeholder="Observaciones al momento de ingreso"
                        className={`min-h-[90px] w-full rounded border px-3 py-2 text-sm ${inputClass}`}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FIRMAS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold mb-1 text-sm">Firma Responsable</p>
          <SignatureCanvas
            ref={firmaResponsableRef}
            canvasProps={{ className: "border w-full h-32 rounded bg-white" }}
          />
          {!isLocked && (
            <button
              type="button"
              onClick={() => firmaResponsableRef.current?.clear()}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>

        <div>
          <p className="font-semibold mb-1 text-sm">Firma Aprobador</p>
          <SignatureCanvas
            ref={firmaAprobadorRef}
            canvasProps={{ className: "border w-full h-32 rounded bg-white" }}
          />
          {!isLocked && (
            <button
              type="button"
              onClick={() => firmaAprobadorRef.current?.clear()}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate("/operaciones/registro")} // ✅ ruta correcta
          className="btn-volver-orange"
        >
          ← Volver
        </button>

        {!isLocked && (
          <button
            type="submit"
            disabled={guardando}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
        )}
      </div>

      {/* ================= MODAL PREVIEW ================= */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Vista previa"
            className="max-h-[90vh] max-w-[90vw] rounded shadow-2xl"
          />
        </div>
      )}
    </form>
  );
}
