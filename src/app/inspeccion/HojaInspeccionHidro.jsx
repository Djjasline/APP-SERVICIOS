import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES – HIDROSUCCIONADOR
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras - acoples - bancos)"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite en la caja de transferencia"],
      ["A.5", "Manómetro de filtro hidráulico de retorno"],
      ["A.6", "Filtro hidráulico de retorno, presenta fugas o daños"],
      ["A.7", "Filtros de succión del tanque hidráulico"],
      ["A.8", "Cilindros hidráulicos, presentan fugas o daños"],
      ["A.9", "Tapones de drenaje de lubricantes"],
      ["A.10", "Bancos hidráulicos, presentan fugas o daños"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros malla de agua 2” y 3”"],
      ["B.2", "Empaques de tapa de filtros de agua"],
      ["B.3", "Fugas de agua (mangueras / acoples)"],
      ["B.4", "Válvula de alivio de la pistola"],
      ["B.5", "Golpes o fugas en tanque de aluminio"],
      ["B.6", "Medidor de nivel del tanque"],
      ["B.7", "Tapón de expansión del tanque"],
      ["B.8", "Drenaje de la bomba Rodder"],
      ["B.9", "Válvulas check internas"],
      ["B.10", "Manómetros de presión"],
      ["B.11", "Carrete de manguera de agua"],
      ["B.12", "Soporte del carrete"],
      ["B.13", "Codo giratorio del carrete"],
      ["B.14", "Sistema de trinquete y seguros"],
      ["B.15", "Válvula de alivio de bomba de agua"],
      ["B.16", "Válvulas de 1”"],
      ["B.17", "Válvulas de 3/4”"],
      ["B.18", "Válvulas de 1/2”"],
      ["B.19", "Boquillas"],
    ],
  },
];

export default function HojaInspeccionHidro() {
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
     HELPERS
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
     ESTADO DEL EQUIPO – PUNTOS
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        {
          id: p.estadoEquipoPuntos.length + 1,
          x,
          y,
          nota: "",
        },
      ],
    }));
  };

  const handleRemovePoint = (id) => {
    const nuevos = formData.estadoEquipoPuntos
      .filter((pt) => pt.id !== id)
      .map((pt, i) => ({ ...pt, id: i + 1 }));

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: nuevos,
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

    markInspectionCompleted("hidro", id, {
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
      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-3">
        <p className="font-semibold">Estado del equipo</p>

        <div
          className="relative border rounded cursor-crosshair"
          onClick={handleImageClick}
        >
          <img
            src="/estado-equipo.png"
            className="w-full"
            draggable={false}
          />

          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              title="Doble click para eliminar"
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer"
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

        {/* OBSERVACIONES POR PUNTO */}
        <div className="space-y-2">
          {formData.estadoEquipoPuntos.map((pt) => (
            <div key={pt.id} className="flex gap-2 items-start">
              <span className="font-semibold">{pt.id})</span>
              <input
                className="flex-1 border p-1"
                placeholder="Descripción del punto"
                value={pt.nota}
                onChange={(e) =>
                  handleNotaChange(pt.id, e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* FIRMAS */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">FIRMA TÉCNICO ASTAP</p>
            <SignatureCanvas
              ref={firmaTecnicoRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
          </div>
          <div>
            <p className="font-semibold mb-1">FIRMA CLIENTE</p>
            <SignatureCanvas
              ref={firmaClienteRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
          </div>
        </div>
      </section>

      {/* BOTONES */}
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
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
