// src/app/inspeccion/HojaInspeccionHidro.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      { codigo: "1.2", texto: "Verificación de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES – SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico" },
      { codigo: "A.6", texto: "Filtro hidráulico retorno" },
      { codigo: "A.7", texto: "Filtros succión tanque" },
      { codigo: "A.8", texto: "Cilindros hidráulicos" },
      { codigo: "A.9", texto: "Tapones drenaje" },
      { codigo: "A.10", texto: "Bancos hidráulicos" },
    ],
  },
];

export default function HojaInspeccionHidro() {
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
    danios: [],
    items: {},
  });

  /* =============================
     HANDLERS GENERALES
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
     MARCADO DE DAÑOS
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((prev) => ({
      ...prev,
      danios: [
        ...prev.danios,
        {
          id: prev.danios.length + 1,
          x,
          y,
          descripcion: "",
        },
      ],
    }));
  };

  const removeDanio = (id) => {
    setFormData((prev) => ({
      ...prev,
      danios: prev.danios
        .filter((d) => d.id !== id)
        .map((d, i) => ({ ...d, id: i + 1 })),
    }));
  };

  const updateDanioDesc = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      danios: prev.danios.map((d) =>
        d.id === id ? { ...d, descripcion: value } : d
      ),
    }));
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, formData);
    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ================= HEADER ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="h-14 object-contain"
          />
          <div className="text-center font-semibold">
            HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
          </div>
          <div className="text-xs text-right">
            <p>Fecha versión: 015-01-2026</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input name="referenciaContrato" onChange={handleChange} placeholder="Referencia contrato" className="input" />
          <input name="descripcion" onChange={handleChange} placeholder="Descripción" className="input" />
          <input name="codInf" onChange={handleChange} placeholder="Cód. INF." className="input" />
          <input type="date" name="fechaInspeccion" onChange={handleChange} className="input" />
          <input name="ubicacion" onChange={handleChange} placeholder="Ubicación" className="input" />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input name="cliente" onChange={handleChange} placeholder="Cliente" className="input" />
          <input name="contactoCliente" onChange={handleChange} placeholder="Contacto cliente" className="input" />
          <input name="telefonoCliente" onChange={handleChange} placeholder="Teléfono cliente" className="input" />
          <input name="correoCliente" onChange={handleChange} placeholder="Correo cliente" className="input" />
          <input name="tecnicoResponsable" onChange={handleChange} placeholder="Técnico responsable" className="input" />
          <input name="telefonoTecnico" onChange={handleChange} placeholder="Teléfono técnico" className="input" />
          <input name="correoTecnico" onChange={handleChange} placeholder="Correo técnico" className="input md:col-span-2" />
        </div>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold">Estado del equipo</h2>

        <div className="relative border rounded overflow-hidden">
          <img
            src="/estado-equipo.png"
            alt="Estado equipo"
            onClick={handleImageClick}
            className="w-full cursor-crosshair"
          />

          {formData.danios.map((d) => (
            <div
              key={d.id}
              onDoubleClick={() => removeDanio(d.id)}
              className="absolute bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {d.id}
            </div>
          ))}
        </div>

        {formData.danios.map((d) => (
          <div key={d.id} className="flex gap-2">
            <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">
              {d.id}
            </span>
            <input
              value={d.descripcion}
              onChange={(e) => updateDanioDesc(d.id, e.target.value)}
              placeholder="Detalle del daño"
              className="flex-1 border rounded px-2 py-1"
            />
          </div>
        ))}

        <textarea
          name="estadoEquipoDetalle"
          onChange={handleChange}
          placeholder="Detalle general del estado del equipo"
          className="w-full border rounded px-2 py-2 min-h-[80px]"
        />
      </section>

      {/* ================= SECCIONES ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded-xl p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
          <table className="w-full border text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Ítem</th>
                <th className="border p-1">Detalle</th>
                <th className="border p-1">Sí</th>
                <th className="border p-1">No</th>
                <th className="border p-1">Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td className="border p-1">{item.codigo}</td>
                  <td className="border p-1">{item.texto}</td>
                  <td className="border p-1 text-center">
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(item.codigo, "estado", "SI")}
                    />
                  </td>
                  <td className="border p-1 text-center">
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(item.codigo, "estado", "NO")}
                    />
                  </td>
                  <td className="border p-1">
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
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
