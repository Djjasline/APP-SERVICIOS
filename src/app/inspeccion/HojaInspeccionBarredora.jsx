import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES BARREDORA
============================= */
const secciones = [
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)" },
      { codigo: "A.2", texto: "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?" },
      { codigo: "A.3", texto: "Fugas de aceite en motores de cepillos" },
      { codigo: "A.4", texto: "Fugas de aceite en motor de banda" },
      { codigo: "A.5", texto: "Fugas de bombas hidráulicas" },
      { codigo: "A.6", texto: "Fugas en motor John Deere" },
    ],
  },
  {
    id: "secB",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Fugas de agua (mangueras, acoples)" },
      { codigo: "B.2", texto: "Estado del filtro de agua" },
      { codigo: "B.3", texto: "Estado de válvulas check" },
      { codigo: "B.4", texto: "Estado de solenoides de apertura de agua" },
      { codigo: "B.5", texto: "Estado de la bomba eléctrica de agua" },
      { codigo: "B.6", texto: "Estado de los aspersores de cepillos" },
      { codigo: "B.7", texto: "Manguera de carga de agua (hidrante)" },
      { codigo: "B.8", texto: "Medidor de nivel del tanque" },
      { codigo: "B.9", texto: "Sistema de llenado de agua" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Conectores de bancos de control" },
      { codigo: "C.2", texto: "Funcionamiento general al encender" },
      { codigo: "C.3", texto: "Tablero de control cabina" },
      { codigo: "C.4", texto: "Batería" },
      { codigo: "C.5", texto: "Luces externas" },
      { codigo: "C.6", texto: "Diagnóstico con Service Tool (opcional)" },
      { codigo: "C.7", texto: "Limpia parabrisas" },
      { codigo: "C.8", texto: "Conexiones externas (GPS / radio)" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Estado de la banda" },
      { codigo: "D.2", texto: "Cerdas de cepillos" },
      { codigo: "D.3", texto: "Tolva" },
      { codigo: "D.4", texto: "Funcionamiento de tolva" },
      { codigo: "D.5", texto: "Funcionamiento de banda" },
      { codigo: "D.6", texto: "Zapatas de arrastre" },
    ],
  },
];

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    contactoCliente: "",
    telefonoCliente: "",
    correoCliente: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    estadoEquipoDetalle: "",
    estadoEquipoPuntos: [],
    items: {},
  });

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
     MARCADO SOBRE IMAGEN
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("barredora", id, formData);
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm">

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <h2 className="font-semibold">Estado del equipo</h2>

        <div
          className="relative border rounded overflow-hidden cursor-crosshair"
          onClick={handleImageClick}
        >
          <img
            src="/estado equipo barredora.png"
            alt="Estado del equipo barredora"
            className="w-full select-none"
            draggable={false}
          />

          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleRemovePoint(pt.id);
              }}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
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

        <textarea
          name="estadoEquipoDetalle"
          placeholder="Detalle del estado del equipo"
          value={formData.estadoEquipoDetalle}
          onChange={handleChange}
          className="w-full border rounded p-2 min-h-[90px]"
        />
      </section>

      {/* CHECKLIST */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>Sí</th>
                <th>No</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.codigo}</td>
                  <td>{item.texto}</td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(item.codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(item.codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={formData.items[item.codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(item.codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

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
