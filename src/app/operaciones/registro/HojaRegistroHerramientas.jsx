import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { TECHNICIANS } from "@/data/technicians";
import {
  createRegistro,
  getRegistroById,
  updateRegistro,
} from "@/utils/registroStorage";
import { uploadRegistroImage } from "@/utils/storage";
import imageCompression from "browser-image-compression";

export default function HojaRegistroHerramientas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaResponsableRef = useRef(null);
  const firmaAprobadorRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [registroId, setRegistroId] = useState(id || null);

  const baseState = {
    tecnicoSalida: "",
    tecnicoIngreso: "",
    fechaSalida: "",
    fechaIngreso: "",
    items: [],
    firmaResponsable: "",
    firmaAprobador: "",
  };

  const [formData, setFormData] = useState(baseState);
  const [estado, setEstado] = useState("salida");

  /* ================= CARGAR REGISTRO (solo si hay id) ================= */
  useEffect(() => {
    if (!id) return; // ← nuevo registro, no cargar nada

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

  const isLocked = estado === "completado";

  /* ================= AGREGAR ITEM ================= */
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          fechaSalida: new Date().toISOString().split("T")[0],
          tecnicoSalida: "",
          detalle: "",
          pedido: "",
          imagenSalidaUrl: "",
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
  const handleImageUpload = async (e, itemId, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const uploadId = registroId || "temp-" + Date.now();
      const url = await uploadRegistroImage(compressedFile, uploadId, tipo);

      if (!url) return;

      updateItem(itemId, tipo, url);
    } catch (error) {
      console.error("Error al comprimir imagen:", error);
    }
  };

  /* ================= GUARDAR ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const firmaResponsable = firmaResponsableRef.current?.isEmpty()
        ? ""
        : firmaResponsableRef.current.toDataURL();

      const firmaAprobador = firmaAprobadorRef.current?.isEmpty()
        ? ""
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
          : "borrador";

      if (registroId) {
        // ✅ ACTUALIZAR registro existente
        await updateRegistro(registroId, payload, nuevoEstado);
      } else {
        // ✅ CREAR nuevo registro
        const result = await createRegistro({ data: payload });
        if (result?.id) setRegistroId(result.id);
      }

      setEstado(nuevoEstado);
      alert("Guardado correctamente");
      navigate("/registro"); // ✅ ruta correcta
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Control de salida e ingreso de herramientas
        </h1>
        {estado === "completado" && (
          <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
            ✅ Completado
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={addItem}
        disabled={isLocked}
        className="bg-purple-600 text-white px-3 py-2 rounded disabled:opacity-50"
      >
        + Agregar herramienta
      </button>

      {/* ================= TABLA ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Estado</th>
              <th className="p-2">Detalle</th>
              <th className="p-2">Pedido</th>
              <th className="p-2">Técnico Salida</th>
              <th className="p-2">Fecha Salida</th>
              <th className="p-2">Imagen Salida</th>
              <th className="p-2">Fecha Ingreso</th>
              <th className="p-2">Imagen Ingreso</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {formData.items.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-400">
                  Sin herramientas. Haz clic en "+ Agregar herramienta".
                </td>
              </tr>
            )}

            {formData.items.map((item) => {
              const ingresoCompleto = !!item.imagenIngresoUrl;

              return (
                <tr key={item.id} className="border-t">
                  <td className="text-center p-2">
                    {ingresoCompleto ? (
                      <span className="text-green-600 font-bold">🟢</span>
                    ) : (
                      <span className="text-red-600 font-bold">🔴</span>
                    )}
                  </td>

                  <td className="p-1">
                    <input
                      value={item.detalle}
                      onChange={(e) =>
                        updateItem(item.id, "detalle", e.target.value)
                      }
                      disabled={isLocked}
                      className="border p-1 w-full"
                      placeholder="Descripción"
                    />
                  </td>

                  <td className="p-1">
                    <input
                      value={item.pedido}
                      onChange={(e) =>
                        updateItem(item.id, "pedido", e.target.value)
                      }
                      disabled={isLocked}
                      className="border p-1 w-full"
                      placeholder="N° Pedido"
                    />
                  </td>

                  <td className="p-1">
                    <select
                      value={item.tecnicoSalida}
                      onChange={(e) =>
                        updateItem(item.id, "tecnicoSalida", e.target.value)
                      }
                      disabled={isLocked}
                      className="border p-1"
                    >
                      <option value="">Seleccione</option>
                      {TECHNICIANS.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-1">
                    <input
                      type="date"
                      value={item.fechaSalida || ""}
                      onChange={(e) =>
                        updateItem(item.id, "fechaSalida", e.target.value)
                      }
                      className="border p-1 text-xs"
                      disabled={isLocked}
                    />
                  </td>

                  {/* IMAGEN SALIDA */}
                  <td className="text-center p-2 space-y-1">
                    {item.imagenSalidaUrl ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={item.imagenSalidaUrl}
                          alt="Salida"
                          className="h-20 border rounded cursor-pointer"
                          onClick={() => setPreviewImage(item.imagenSalidaUrl)}
                        />
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, "imagenSalidaUrl", "")
                            }
                            className="text-red-600 text-xs"
                          >
                            ❌ Quitar
                          </button>
                        )}
                      </div>
                    ) : (
                      !isLocked && (
                        <div className="flex flex-col gap-1">
                          <label className="bg-gray-600 text-white text-xs px-2 py-1 rounded cursor-pointer">
                            📁 Galería
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e, item.id, "imagenSalidaUrl")
                              }
                            />
                          </label>
                          <label className="bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer">
                            📷 Cámara
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e, item.id, "imagenSalidaUrl")
                              }
                            />
                          </label>
                        </div>
                      )
                    )}
                  </td>

                  <td className="p-1">
                    <input
                      type="date"
                      value={item.fechaIngreso || ""}
                      onChange={(e) =>
                        updateItem(item.id, "fechaIngreso", e.target.value)
                      }
                      className="border p-1 text-xs"
                      disabled={isLocked}
                    />
                  </td>

                  {/* IMAGEN INGRESO */}
                  <td className="text-center p-2 space-y-1">
                    {item.imagenIngresoUrl ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={item.imagenIngresoUrl}
                          alt="Ingreso"
                          className="h-20 border rounded cursor-pointer"
                          onClick={() => setPreviewImage(item.imagenIngresoUrl)}
                        />
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, "imagenIngresoUrl", "")
                            }
                            className="text-red-600 text-xs"
                          >
                            ❌ Quitar
                          </button>
                        )}
                      </div>
                    ) : (
                      !isLocked && (
                        <div className="flex flex-col gap-1">
                          <label className="bg-gray-600 text-white text-xs px-2 py-1 rounded cursor-pointer">
                            📁 Galería
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(
                                  e,
                                  item.id,
                                  "imagenIngresoUrl"
                                )
                              }
                            />
                          </label>
                          <label className="bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer">
                            📷 Cámara
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(
                                  e,
                                  item.id,
                                  "imagenIngresoUrl"
                                )
                              }
                            />
                          </label>
                        </div>
                      )
                    )}
                  </td>

                  <td className="p-1">
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= FIRMAS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold mb-1">Firma Responsable</p>
          <SignatureCanvas
            ref={firmaResponsableRef}
            canvasProps={{ className: "border w-full h-32" }}
          />
          {!isLocked && (
            <button
              type="button"
              onClick={() => firmaResponsableRef.current?.clear()}
              className="text-xs text-red-500 mt-1"
            >
              Limpiar firma
            </button>
          )}
        </div>

        <div>
          <p className="font-semibold mb-1">Firma Aprobador</p>
          <SignatureCanvas
            ref={firmaAprobadorRef}
            canvasProps={{ className: "border w-full h-32" }}
          />
          {!isLocked && (
            <button
              type="button"
              onClick={() => firmaAprobadorRef.current?.clear()}
              className="text-xs text-red-500 mt-1"
            >
              Limpiar firma
            </button>
          )}
        </div>
      </div>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/registro")} // ✅ ruta correcta
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Volver
        </button>

        {!isLocked && (
          <button
            type="submit"
            disabled={guardando}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        )}
      </div>

      {/* ================= MODAL PREVIEW ================= */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90%] max-w-[90%] rounded shadow-lg"
          />
        </div>
      )}
    </form>
  );
}
