import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   PRUEBAS PREVIAS
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES – HIDRO
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros de agua"],
      ["B.2", "Fugas de agua"],
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const baseState = {
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    items: {},
    firmas: {},
  };

  const [formData, setFormData] = useState(baseState);

  /* =============================
     CARGAR INSPECCIÓN
  ============================= */
  useEffect(() => {
    const stored = getInspectionById("hidro", id);
    if (stored?.data) {
      setFormData({
        ...baseState,
        ...stored.data,
        items: stored.data.items || {},
        firmas: stored.data.firmas || {},
      });
    }
  }, [id]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: {
          ...p.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico:
          formData.firmas?.tecnico ||
          firmaTecnicoRef.current?.toDataURL(),
        cliente:
          formData.firmas?.cliente ||
          firmaClienteRef.current?.toDataURL(),
      },
    });

    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ================= DATOS ================= */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
        ].map(([n, l]) => (
          <input
            key={n}
            name={n}
            placeholder={l}
            value={formData[n]}
            onChange={handleChange}
            className="border p-1"
          />
        ))}
        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="border p-1 md:col-span-2"
        />
      </section>

      {/* ================= PRUEBAS PREVIAS ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">
          1. PRUEBAS DE ENCENDIDO
        </h2>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Ítem</th>
              <th>Detalle</th>
              <th>SI</th>
              <th>NO</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {pruebasPrevias.map(([codigo, texto]) => (
              <tr key={codigo}>
                <td>{codigo}</td>
                <td>{texto}</td>
                <td>
                  <input
                    type="radio"
                    checked={formData.items[codigo]?.estado === "SI"}
                    onChange={() =>
                      handleItemChange(codigo, "estado", "SI")
                    }
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    checked={formData.items[codigo]?.estado === "NO"}
                    onChange={() =>
                      handleItemChange(codigo, "estado", "NO")
                    }
                  />
                </td>
                <td>
                  <input
                    className="w-full border px-1"
                    value={formData.items[codigo]?.observacion || ""}
                    onChange={(e) =>
                      handleItemChange(
                        codigo,
                        "observacion",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= SECCIONES ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>SI</th>
                <th>NO</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "NO")
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={formData.items[codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(
                          codigo,
                          "observacion",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= FIRMAS ================= */}
      <section className="border rounded p-4 grid md:grid-cols-2 gap-6 text-center">
        <div>
          <p className="font-semibold mb-1">FIRMA TÉCNICO</p>
          {formData.firmas?.tecnico ? (
            <img
              src={formData.firmas.tecnico}
              className="mx-auto max-h-32 border"
            />
          ) : (
            <SignatureCanvas
              ref={firmaTecnicoRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
          )}
        </div>

        <div>
          <p className="font-semibold mb-1">FIRMA CLIENTE</p>
          {formData.firmas?.cliente ? (
            <img
              src={formData.firmas.cliente}
              className="mx-auto max-h-32 border"
            />
          ) : (
            <SignatureCanvas
              ref={firmaClienteRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
          )}
        </div>
      </section>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar inspección
        </button>
      </div>
    </form>
  );
}
