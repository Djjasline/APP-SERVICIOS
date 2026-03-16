import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { TECHNICIANS } from "@/data/technicians";
import {
  getRegistroById,
  updateRegistro,
} from "@/utils/registroStorage";
import { uploadRegistroImage } from "@/utils/storage";

export default function HojaRegistroHerramientas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaResponsableRef = useRef(null);
  const firmaAprobadorRef = useRef(null);

  const baseState = {
    items: [],
    firmas: {
      responsable: "",
      aprobador: "",
    },
  };

  const [formData, setFormData] = useState(baseState);
  const [estado, setEstado] = useState("salida");

  /* ================= CARGA ================= */
  useEffect(() => {
    const load = async () => {
      const registro = await getRegistroById(id);
      if (registro?.data) {
        setFormData(registro.data);
        setEstado(registro.estado);
      }
    };
    load();
  }, [id]);

  const isLocked = estado === "completado";

  /* ================= AGREGAR FILA ================= */
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          fechaSalida: new Date().toISOString(),
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

  /* ================= ELIMINAR FILA ================= */
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

    const url = await uploadRegistroImage(file, id, tipo);
    if (!url) return;

    updateItem(itemId, tipo, url);
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

    // 🔥 REGLA DE ESTADO
    const allIngresosCompletos = payload.items.every(
      (item) => item.imagenIngresoUrl
    );

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
        Control de salida e ingreso
      </h1>

      <button
        type="button"
        onClick={addItem}
        disabled={isLocked}
        className="bg-purple-600 text-white px-3 py-2 rounded"
      >
        + Agregar herramienta
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Detalle</th>
              <th>Pedido</th>
              <th>Técnico Salida</th>
              <th>Imagen Despacho</th>
              <th>Imagen Ingreso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item) => (
              <tr key={item.id}>
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
                    type="file"
                    accept="image/*"
                    disabled={isLocked}
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        item.id,
                        "imagenSalidaUrl"
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLocked}
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        item.id,
                        "imagenIngresoUrl"
                      )
                    }
                  />
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
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= FIRMAS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold">Firma Responsable</p>
          <SignatureCanvas
            ref={firmaResponsableRef}
            canvasProps={{ className: "border w-full h-32" }}
          />
        </div>

        <div>
          <p className="font-semibold">Firma Aprobador</p>
          <SignatureCanvas
            ref={firmaAprobadorRef}
            canvasProps={{ className: "border w-full h-32" }}
          />
        </div>
      </div>

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
    </form>
  );
}
