import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   SECCIONES – CÁMARA
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "A",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O SISTEMAS",
    items: [
      ["A.1", "Estructura del carrete"],
      ["A.2", "Pintura y acabado"],
      ["A.3", "Manivela y freno"],
      ["A.4", "Base estable"],
      ["A.5", "Ruedas"],
      ["A.6", "Cable sin cortes"],
      ["A.7", "Recubrimiento del cable"],
      ["A.8", "Longitud correcta del cable"],
      ["A.9", "Marcadores visibles"],
      ["A.10", "Enrollado uniforme"],
      ["A.11", "Cable limpio"],
      ["A.12", "Lubricación"],
      ["A.13", "Protecciones instaladas"],
      ["A.14", "Empaques"],
      ["A.15", "Sin fugas"],
      ["A.16", "Protección frontal"],
      ["A.17", "Lente sin rayaduras"],
      ["A.18", "Iluminación LED"],
      ["A.19", "Imagen estable"],
      ["A.20", "Sin interferencias"],
      ["A.21", "Control de intensidad LED"],
    ],
  },
];

/* =============================
   BASE STATE – REGLA DE ORO
============================= */
const baseState = {
  referenciaContrato: "",
  descripcion: "",
  codInf: "",

  cliente: "",
  direccion: "",
  contacto: "",
  telefono: "",
  correo: "",
  tecnicoResponsable: "",
  telefonoTecnico: "",
  correoTecnico: "",
  fechaServicio: "",

  estadoEquipoPuntos: [],

  nota: "",
  marca: "",
  modelo: "",
  serie: "",
  anioModelo: "",
  vin: "",
  placa: "",
  horasModulo: "",
  horasChasis: "",
  kilometraje: "",

  items: {},
  firmas: {
    tecnico: "",
    cliente: "",
  },
};

export default function HojaInspeccionCamara() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState(baseState);

  /* =============================
     CARGAR INSPECCIÓN (EDITAR)
  ============================= */
  useEffect(() => {
    if (!id) return;

    const stored = getInspectionById("camara", id);
    if (stored?.data) {
      setFormData({
        ...baseState,
        ...stored.data,
        estadoEquipoPuntos: stored.data.estadoEquipoPuntos || [],
        items: stored.data.items || {},
        firmas: stored.data.firmas || baseState.firmas,
      });
    }
  }, [id]);

  /* =============================
     RECARGAR FIRMAS
  ============================= */
  useEffect(() => {
    if (formData.firmas.tecnico && firmaTecnicoRef.current) {
      firmaTecnicoRef.current.clear();
      firmaTecnicoRef.current.fromDataURL(formData.firmas.tecnico);
    }
    if (formData.firmas.cliente && firmaClienteRef.current) {
      firmaClienteRef.current.clear();
      firmaClienteRef.current.fromDataURL(formData.firmas.cliente);
    }
  }, [formData.firmas]);

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

  /* =============================
     ESTADO DEL EQUIPO (PUNTOS)
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y, nota: "" },
      ],
    }));
  };

  const handleNotaChange = (id, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === id ? { ...pt, nota: value } : pt
      ),
    }));
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("camara", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });

    navigate("/inspeccion");
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      <h1 className="text-lg font-bold text-center">
        HOJA DE INSPECCIÓN CÁMARA
      </h1>

      {/* DATOS CLIENTE */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            placeholder={p}
            value={formData[n]}
            onChange={handleChange}
            className="border p-2"
          />
        ))}
        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="border p-2 md:col-span-2"
        />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4">
        <img
          src="/estado-equipo-camara.png"
          className="w-full cursor-crosshair"
          onClick={handleImageClick}
        />
        {formData.estadoEquipoPuntos.map((pt) => (
          <div key={pt.id} className="mt-1">
            <strong>{pt.id})</strong>
            <input
              className="w-full border p-1"
              value={pt.nota}
              onChange={(e) => handleNotaChange(pt.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* TABLAS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-sm border">
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
                      className="w-full border"
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

      {/* FIRMAS */}
      <section className="grid grid-cols-2 gap-4">
        <SignatureCanvas
          ref={firmaTecnicoRef}
          canvasProps={{ className: "border w-full h-32" }}
        />
        <SignatureCanvas
          ref={firmaClienteRef}
          canvasProps={{ className: "border w-full h-32" }}
        />
      </section>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")}>
          Volver
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Guardar informe
        </button>
      </div>
    </form>
  );
}
