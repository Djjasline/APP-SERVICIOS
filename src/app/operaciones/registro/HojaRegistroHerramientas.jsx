import React, { useEffect, useRef, useState } from "react";
import { useAutoguardado, limpiarBorrador } from "@/hooks/useAutoguardado";
import BannerAutoguardado from "@/components/BannerAutoguardado";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { TECHNICIANS } from "@/data/technicians";
import { getRegistroById, updateRegistro, } from "@/utils/registroStorage";
import { uploadRegistroImage } from "@/utils/storage";
import imageCompression from "browser-image-compression";

export default function HojaRegistroHerramientas() {
  const { id } = useParams();
  const isEditing = !!id;
  const claveAutoguardado = `registro_herramientas_${id ?? "new"}`;
  const navigate = useNavigate();

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
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6"
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

      {/* ================= TABLA — una fila por herramienta ================= */}
      <div className="overflow-x-auto border rounded-xl">
        <BannerAutoguardado
          clave={claveAutoguardado}
          onRestaurar={(datosGuardados) => setFormData(datosGuardados)}
          isEditing={isEditing}
        />

        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-left">Herramienta / Detalle</th>
              <th className="px-3 py-2 text-left">N° Pedido</th>
              <th className="px-3 py-2 text-left">Cantidad</th>
              <th className="px-3 py-2 text-left">Estado Salida</th>
              <th className="px-3 py-2 text-left">Técnico Salida</th>
              <th className="px-3 py-2 text-left">Fecha Salida</th>
              <th className="px-3 py-2 text-center">Foto Antes 📷</th>
              <th className="px-3 py-2 text-left">Técnico Ingreso</th>
              <th className="px-3 py-2 text-left">Fecha Ingreso</th>
              <th className="px-3 py-2 text-left">Estado Ingreso</th>
              <th className="px-3 py-2 text-center">Foto Después 📷</th>
              {!isLocked && <th className="px-3 py-2"></th>}
            </tr>
          </thead>

          <tbody>
            {formData.items.length === 0 && (
              <tr>
                <td
                  colSpan={isLocked ? 12 : 13}
                  className="text-center py-8 text-gray-400"
                >
                  Sin herramientas. Haz clic en "+ Agregar herramienta".
                </td>
              </tr>
            )}

            {formData.items.map((item) => {
              const ingresoCompleto = !!item.imagenIngresoUrl;

              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">

                  {/* ESTADO */}
                  <td className="px-3 py-2 text-center text-base">
                    {ingresoCompleto ? "🟢" : "🔴"}
                  </td>

                  {/* DETALLE */}
                  <td className="px-2 py-2">
                    <input
                      value={item.detalle}
                      onChange={(e) =>
                        updateItem(item.id, "detalle", e.target.value)
                      }
                      disabled={isLocked}
                      placeholder="Descripción herramienta"
                      className="border rounded px-2 py-1 w-full min-w-[140px] disabled:bg-gray-50"
                    />
                  </td>

                  {/* PEDIDO */}
                  <td className="px-2 py-2">
                    <input
                      value={item.pedido}
                      onChange={(e) =>
                        updateItem(item.id, "pedido", e.target.value)
                      }
                      disabled={isLocked}
                      placeholder="N° Pedido"
                      className="border rounded px-2 py-1 w-full min-w-[90px] disabled:bg-gray-50"
                    />
                  </td>

                  {/* CANTIDAD */}
<td className="px-2 py-2">
  <input
    value={item.cantidad || ""}
    onChange={(e) =>
      updateItem(item.id, "cantidad", e.target.value)
    }
    disabled={isLocked}
    placeholder="Cantidad"
    className="border rounded px-2 py-1 w-full min-w-[70px] disabled:bg-gray-50"
  />
</td>

{/* ESTADO SALIDA */}
<td className="px-2 py-2">
  <input
    value={item.estadoSalida || ""}
    onChange={(e) =>
      updateItem(item.id, "estadoSalida", e.target.value)
    }
    disabled={isLocked}
    placeholder="Estado salida"
    className="border rounded px-2 py-1 w-full min-w-[110px] disabled:bg-gray-50"
  />
</td>

                  {/* TÉCNICO SALIDA */}
                  <td className="px-2 py-2">
                    <select
                      value={item.tecnicoSalida}
                      onChange={(e) =>
                        updateItem(item.id, "tecnicoSalida", e.target.value)
                      }
                      disabled={isLocked}
                      className="border rounded px-2 py-1 w-full min-w-[140px] disabled:bg-gray-50"
                    >
                      <option value="">Seleccione</option>
                      {TECHNICIANS.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* FECHA SALIDA */}
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      value={item.fechaSalida || ""}
                      onChange={(e) =>
                        updateItem(item.id, "fechaSalida", e.target.value)
                      }
                      disabled={isLocked}
                      className="border rounded px-2 py-1 disabled:bg-gray-50"
                    />
                  </td>

                  {/* FOTO ANTES */}
                  <td className="px-2 py-2 text-center">
                    <ImagenCell
                      item={item}
                      campo="imagenSalidaUrl"
                      label="Foto antes"
                    />
                  </td>

                  {/* TÉCNICO INGRESO */}
                  <td className="px-2 py-2">
                    <select
                      value={item.tecnicoIngreso || ""}
                      onChange={(e) =>
                        updateItem(item.id, "tecnicoIngreso", e.target.value)
                      }
                      disabled={isLocked}
                      className="border rounded px-2 py-1 w-full min-w-[140px] disabled:bg-gray-50"
                    >
                      <option value="">Seleccione</option>
                      {TECHNICIANS.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* FECHA INGRESO */}
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      value={item.fechaIngreso || ""}
                      onChange={(e) =>
                        updateItem(item.id, "fechaIngreso", e.target.value)
                      }
                      disabled={isLocked}
                      className="border rounded px-2 py-1 disabled:bg-gray-50"
                    />
                  </td>

                  {/* ESTADO INGRESO */}
<td className="px-2 py-2">
  <input
    value={item.estadoIngreso || ""}
    onChange={(e) =>
      updateItem(item.id, "estadoIngreso", e.target.value)
    }
    disabled={isLocked}
    placeholder="Estado ingreso"
    className="border rounded px-2 py-1 w-full min-w-[110px] disabled:bg-gray-50"
  />
</td>

                  {/* FOTO DESPUÉS */}
                  <td className="px-2 py-2 text-center">
                    <ImagenCell
                      item={item}
                      campo="imagenIngresoUrl"
                      label="Foto después"
                    />
                  </td>

                  {/* ELIMINAR */}
                  {!isLocked && (
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-base"
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= OBSERVACIONES POR HERRAMIENTA ================= */}
{formData.items.length > 0 && (
  <div className="grid md:grid-cols-2 gap-4">
    {formData.items.map((item, index) => (
      <div key={item.id} className="border rounded p-3 bg-gray-50">
        <p className="font-semibold text-sm mb-2">
          Observaciones herramienta {index + 1}
        </p>

        <label className="text-xs font-semibold">
          Observaciones salida
        </label>
        <textarea
          value={item.observacionesSalida || ""}
          onChange={(e) =>
            updateItem(item.id, "observacionesSalida", e.target.value)
          }
          disabled={isLocked}
          placeholder="Observaciones al momento de salida"
          className="w-full border rounded p-2 text-xs min-h-[70px] mb-2 disabled:bg-gray-100"
        />

        <label className="text-xs font-semibold">
          Observaciones ingreso
        </label>
        <textarea
          value={item.observacionesIngreso || ""}
          onChange={(e) =>
            updateItem(item.id, "observacionesIngreso", e.target.value)
          }
          disabled={isLocked}
          placeholder="Observaciones al momento de ingreso"
          className="w-full border rounded p-2 text-xs min-h-[70px] disabled:bg-gray-100"
        />
      </div>
    ))}
  </div>
)}

      {/* ================= FIRMAS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold mb-1 text-sm">Firma Responsable</p>
          <SignatureCanvas
            ref={firmaResponsableRef}
            canvasProps={{ className: "border w-full h-32 rounded" }}
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
            canvasProps={{ className: "border w-full h-32 rounded" }}
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
          className="border px-4 py-2 rounded hover:bg-gray-50 text-sm"
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
