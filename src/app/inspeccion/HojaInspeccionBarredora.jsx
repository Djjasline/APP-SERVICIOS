import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN BARREDORA
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
    items: [
      { codigo: "1.1", texto: "Encendido general del equipo" },
      { codigo: "1.2", texto: "Funcionamiento de controles" },
      { codigo: "1.3", texto: "Alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.3", texto: "Estado de mangueras y acoples" },
      { codigo: "A.4", texto: "Cilindros hidráulicos" },
    ],
  },
  {
    id: "secB",
    titulo: "B) SISTEMA ELÉCTRICO",
    items: [
      { codigo: "B.1", texto: "Tablero de control" },
      { codigo: "B.2", texto: "Luces y accesorios" },
      { codigo: "B.3", texto: "Cableado general" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA DE BARREDO",
    items: [
      { codigo: "C.1", texto: "Cepillos principales" },
      { codigo: "C.2", texto: "Cepillos laterales" },
      { codigo: "C.3", texto: "Sistema de aspiración" },
      { codigo: "C.4", texto: "Tolva de residuos" },
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
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    placa: "",
    horasEquipo: "",
    kilometraje: "",
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
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ENCABEZADO (IGUAL A HIDRO) */}
      <section className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b">
              <td
                rowSpan={4}
                className="w-32 border-r p-3 text-center align-middle"
              >
                <img
                  src="/logotipo de astap.jpg"
                  alt="ASTAP"
                  className="mx-auto max-h-20"
                />
              </td>
              <td colSpan={2} className="border-r text-center font-bold py-2">
                HOJA DE INSPECCIÓN BARREDORA
              </td>
              <td className="w-48 p-2 text-right">
                <div>Fecha de versión: <strong>01-01-2026</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="w-56 border-r p-2 font-semibold">
                REFERENCIA DE CONTRATO
              </td>
              <td colSpan={2} className="p-2">
                <input
                  name="referenciaContrato"
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                />
              </td>
            </tr>

            <tr className="border-b">
              <td className="border-r p-2 font-semibold">DESCRIPCIÓN</td>
              <td colSpan={2} className="p-2">
                <input
                  name="descripcion"
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                />
              </td>
            </tr>

            <tr>
              <td className="border-r p-2 font-semibold">COD. INF.</td>
              <td colSpan={2} className="p-2">
                <input
                  name="codInf"
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* DATOS DEL SERVICIO (IGUAL A HIDRO) */}
      <section className="border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <input type="date" name="fechaInspeccion" onChange={handleChange} className="border rounded p-2" />
          <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} className="border rounded p-2" />

          <input name="cliente" placeholder="Cliente" onChange={handleChange} className="border rounded p-2" />
          <input name="contactoCliente" placeholder="Contacto con el cliente" onChange={handleChange} className="border rounded p-2" />

          <input name="telefonoCliente" placeholder="Teléfono cliente" onChange={handleChange} className="border rounded p-2" />
          <input name="correoCliente" placeholder="Correo cliente" onChange={handleChange} className="border rounded p-2" />

          <input name="tecnicoResponsable" placeholder="Técnico responsable" onChange={handleChange} className="border rounded p-2" />
          <input name="telefonoTecnico" placeholder="Teléfono técnico" onChange={handleChange} className="border rounded p-2" />

          <input name="correoTecnico" placeholder="Correo técnico" onChange={handleChange} className="border rounded p-2 col-span-2" />
        </div>
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <p className="font-semibold">Estado del equipo</p>
        <div
          className="relative border rounded overflow-hidden cursor-crosshair"
          onClick={handleImageClick}
        >
          <img src="/estado-equipo-barredora.png" className="w-full" draggable={false} />
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
          onChange={handleChange}
          className="w-full border rounded p-2 min-h-[80px]"
        />
      </section>

      {/* CHECKLISTS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
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
