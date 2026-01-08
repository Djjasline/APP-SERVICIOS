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
      { codigo: "1.2", texto: "Verificación de funcionamiento de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
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
    tecnicoAstap: "",
    responsableCliente: "",
    estadoEquipo: "",
    items: {},
  });

  const [marcas, setMarcas] = useState([]);

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
     MARCAR DAÑOS EN IMAGEN
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMarcas((prev) => [
      ...prev,
      { id: prev.length + 1, x, y },
    ]);
  };

  const handleRemoveMarca = (id) => {
    setMarcas((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...formData,
      marcas,
    });
    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-[160px_1fr_160px] items-center gap-4">
          {/* LOGO */}
          <div className="h-12">
            <img
              src="/logotipo%20de%20astap.jpg"
              alt="ASTAP"
              className="w-full h-full object-contain"
            />
          </div>

          {/* TÍTULO */}
          <h1 className="text-lg font-bold text-center">
            HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
          </h1>

          {/* VERSIÓN */}
          <div className="text-[11px] text-right leading-tight">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <input name="referenciaContrato" onChange={handleChange} placeholder="Referencia contrato" className="input" />
          <input name="descripcion" onChange={handleChange} placeholder="Descripción" className="input md:col-span-2" />
          <input name="codInf" onChange={handleChange} placeholder="Cód. INF." className="input" />
          <input type="date" name="fechaInspeccion" onChange={handleChange} className="input" />
          <input name="ubicacion" onChange={handleChange} placeholder="Ubicación" className="input" />
          <input name="cliente" onChange={handleChange} placeholder="Cliente" className="input" />
          <input name="tecnicoAstap" onChange={handleChange} placeholder="Técnico ASTAP" className="input" />
          <input name="responsableCliente" onChange={handleChange} placeholder="Cliente responsable" className="input md:col-span-2" />
        </div>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Estado del equipo</h2>

        <div className="relative border rounded-lg p-3 overflow-hidden">
          <img
            src="/estado-equipo.png"
            alt="Estado del equipo"
            onClick={handleImageClick}
            className="w-full cursor-crosshair select-none"
          />

          {/* MARCAS */}
          {marcas.map((m) => (
            <div
              key={m.id}
              onDoubleClick={() => handleRemoveMarca(m.id)}
              className="absolute bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              title="Doble click para eliminar"
            >
              {m.id}
            </div>
          ))}
        </div>

        {/* DETALLE – ancho completo */}
        <textarea
          name="estadoEquipo"
          onChange={handleChange}
          className="border rounded px-2 py-2 w-full min-h-[120px]"
          placeholder="Detalle del estado del equipo"
        />
      </section>

      {/* ================= SECCIONES ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>

          <table className="w-full border-collapse border text-xs">
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
                    <input type="radio" onChange={() => handleItemChange(item.codigo, "estado", "SI")} />
                  </td>
                  <td className="border p-1 text-center">
                    <input type="radio" onChange={() => handleItemChange(item.codigo, "estado", "NO")} />
                  </td>
                  <td className="border p-1">
                    <input className="w-full border px-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
