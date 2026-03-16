import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { TECHNICIANS } from "@/data/technicians";
import {
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

  /* ================= CARGAR REGISTRO ================= */
  useEffect(() => {
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
      maxSizeMB: 0.4,          // tamaño máximo ~400KB
      maxWidthOrHeight: 1280,  // resolución suficiente para evidencia
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    const url = await uploadRegistroImage(compressedFile, id, tipo);

    if (!url) return;

    updateItem(itemId, tipo, url);
  } catch (error) {
    console.error("Error al comprimir imagen:", error);
  }
};

  /* ================= GUARDAR ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    let nuevoEstado = "salida";

    if (
      allIngresosCompletos &&
      firmaResponsable &&
      firmaAprobador
    ) {
      nuevoEstado = "completado";
    }

    await updateRegistro(id, payload, nuevoEstado);
    setEstado(nuevoEstado);

    navigate("/registro-salida");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6"
    >
      <h1 className="text-xl font-semibold">
        Control de salida e ingreso de herramientas
      </h1>

      <button
        type="button"
        onClick={addItem}
        disabled={isLocked}
        className="bg-purple-600 text-white px-3 py-2 rounded"
      >
        + Agregar herramienta
      </button>

      {/* ================= TABLA ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Estado</th>
              <th>Detalle</th>
              <th>Pedido</th>
              <th>Técnico Salida</th>
              <th>Fecha Salida</th>
              <th>Imagen Salida</th>
              <th>Fecha Ingreso</th>
              <th>Imagen Ingreso</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {formData.items.map((item) => {
              const ingresoCompleto = !!item.imagenIngresoUrl;

              return (
                <tr key={item.id}>
                  <td className="text-center">
                    {ingresoCompleto ? (
                      <span className="text-green-600 font-bold">🟢</span>
                    ) : (
                      <span className="text-red-600 font-bold">🔴</span>
                    )}
                  </td>

                  <td>
                    <input
                      value={item.detalle}
                      onChange={(e) =>
                        updateItem(item.id, "detalle", e.target.value)
                      }
                      disabled={isLocked}
                      className="border p-1"
                    />
                  </td>

                  <td>
                    <input
                      value={item.pedido}
                      onChange={(e) =>
                        updateItem(item.id, "pedido", e.target.value)
                      }
                      disabled={isLocked}
                      className="border p-1"
                    />
                  </td>

                  <td>
                    <select
                      value={item.tecnicoSalida}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "tecnicoSalida",
                          e.target.value
                        )
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

                  <td>
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
                  <td className="text-center space-y-2">
                    {item.imagenSalidaUrl && (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={item.imagenSalidaUrl}
                          alt="Salida"
                          className="h-20 border rounded cursor-pointer"
                          onClick={() =>
                            setPreviewImage(item.imagenSalidaUrl)
                          }
                        />

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, "imagenSalidaUrl", "")
                            }
                            className="text-red-600 text-xs"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    )}

                    {!isLocked && !item.imagenSalidaUrl && (
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
                                "imagenSalidaUrl"
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
                                "imagenSalidaUrl"
                              )
                            }
                          />
                        </label>
                      </div>
                    )}
                  </td>

                  <td>
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
                  <td className="text-center space-y-2">
                    {item.imagenIngresoUrl && (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={item.imagenIngresoUrl}
                          alt="Ingreso"
                          className="h-20 border rounded cursor-pointer"
                          onClick={() =>
                            setPreviewImage(item.imagenIngresoUrl)
                          }
                        />

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, "imagenIngresoUrl", "")
                            }
                            className="text-red-600 text-xs"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    )}

                    {!isLocked && !item.imagenIngresoUrl && (
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
                    )}
                  </td>

                  <td>
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
            disabled={isLocked}
            canvasProps={{ className: "border w-full h-32" }}
          />
        </div>

        <div>
          <p className="font-semibold mb-1">Firma Aprobador</p>

          <SignatureCanvas
            ref={firmaAprobadorRef}
            disabled={isLocked}
            canvasProps={{ className: "border w-full h-32" }}
          />
        </div>
      </div>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/registro-salida")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>

        {!isLocked && (
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Guardar
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
