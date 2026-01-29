import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@/utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del tanque AW68"],
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
      ["B.1", "Fugas de agua"],
      ["B.2", "Estado del filtro de agua"],
      ["B.3", "Estado de válvulas check"],
      ["B.4", "Solenoides de agua"],
      ["B.5", "Bomba eléctrica de agua"],
      ["B.6", "Aspersores de cepillos"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO",
    items: [
      ["C.1", "Tablero de control"],
      ["C.2", "Batería"],
      ["C.3", "Luces externas"],
    ],
  },
];

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
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
      className="max-w-6xl mx-auto my-6 bg-white p-6 space-y-6"
    >
      {/* ESTADO DEL EQUIPO */}
      <section className="border p-4">
        <h2 className="font-semibold mb-2">Estado del equipo</h2>

        <div
          className="relative border cursor-crosshair"
          onClick={handleImageClick}
        >
          <img src="/estado-equipo-barredora.png" className="w-full" />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              className="absolute bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
          <input
            key={pt.id}
            className="w-full border mt-2 p-1"
            placeholder={`Observación punto ${pt.id}`}
            value={pt.nota}
            onChange={(e) => handleNotaChange(pt.id, e.target.value)}
          />
        ))}
      </section>

      {/* SECCIONES */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          {sec.items.map(([codigo, texto]) => (
            <div key={codigo} className="grid grid-cols-5 gap-2 mb-1">
              <span>{codigo}</span>
              <span className="col-span-2">{texto}</span>
              <input
                type="radio"
                onChange={() => handleItemChange(codigo, "estado", "SI")}
              />
              <input
                type="radio"
                onChange={() => handleItemChange(codigo, "estado", "NO")}
              />
            </div>
          ))}
        </section>
      ))}

      {/* FIRMAS */}
      <section className="grid grid-cols-2 gap-4">
        <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border h-32" }} />
        <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border h-32" }} />
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
