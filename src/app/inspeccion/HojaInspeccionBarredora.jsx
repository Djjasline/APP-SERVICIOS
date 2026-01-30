import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)"],
      ["A.2", "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?"],
      ["A.3", "Fugas de aceite en motores de cepillos"],
      ["A.4", "Fugas de aceite en motor de banda"],
      ["A.5", "Fugas de bombas hidráulicas"],
      ["A.6", "Fugas en motor John Deere"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      ["B.1", "Inspección de fugas de agua (mangueras, acoples)"],
      ["B.2", "Estado del filtro para agua"],
      ["B.3", "Estado de válvulas check"],
      ["B.4", "Estado de solenoides de apertura de agua"],
      ["B.5", "Estado de la bomba eléctrica de agua"],
      ["B.6", "Estado de los aspersores de cepillos"],
      ["B.7", "Estado de la manguera de carga de agua hidrante"],
      ["B.8", "Inspección del medidor de nivel del tanque"],
      ["B.9", "Inspección del sistema de llenado de agua"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Inspección visual de conectores de bancos de control"],
      ["C.2", "Evaluar funcionamiento al encender el equipo"],
      ["C.3", "Estado del tablero de control de cabina"],
      ["C.4", "Inspección de batería"],
      ["C.5", "Inspección de luces externas"],
      ["C.6", "Diagnóstico con service tool (opcional)"],
      ["C.7", "Estado del limpia parabrisas"],
      ["C.8", "Conexiones externas (GPS / radio)"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Estado de la banda"],
      ["D.2", "Estado de las cerdas de los cepillos"],
      ["D.3", "Estado de la tolva"],
      ["D.4", "Funcionamiento de la tolva"],
      ["D.5", "Funcionamiento de la banda"],
      ["D.6", "Estado de zapatas de arrastre"],
    ],
  },
  {
    id: "E",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      ["E.1", "Estado de filtros de aire 1° y 2°"],
      ["E.2", "Filtro combustible trampa de agua"],
      ["E.3", "Filtro de combustible"],
      ["E.4", "Filtro de aceite"],
      ["E.5", "Nivel de aceite de motor"],
      ["E.6", "Estado y nivel del refrigerante"],
      ["E.7", "Filtro A/C cabina"],
    ],
  },
];

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
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
  });

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
     PUNTOS ROJOS – ESTADO EQUIPO
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

  const handleRemovePoint = (id) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== id)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const clearAllPoints = () => {
    setFormData((p) => ({ ...p, estadoEquipoPuntos: [] }));
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

    markInspectionCompleted("barredora", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });

    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ================= TABLAS ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-sm border">
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
                  <td className="text-center">
                    <input
                      type="radio"
                      name={`estado-${codigo}`}
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(codigo, "estado", "SI")}
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="radio"
                      name={`estado-${codigo}`}
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={formData.items[codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
