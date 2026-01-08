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
  {
    id: "secA",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES – A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Aceite caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico" },
      { codigo: "A.6", texto: "Filtro hidráulico de retorno" },
      { codigo: "A.7", texto: "Filtros de succión tanque hidráulico" },
      { codigo: "A.8", texto: "Cilindros hidráulicos" },
      { codigo: "A.9", texto: "Tapones de drenaje" },
      { codigo: "A.10", texto: "Bancos hidráulicos" },
    ],
  },
  {
    id: "secB",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Empaques filtros de agua" },
      { codigo: "B.2", texto: "Tapón expansión tanques" },
      { codigo: "B.3", texto: "Fugas tanque aluminio" },
      { codigo: "B.4", texto: "Sistema de trinquete y seguros" },
      { codigo: "B.5", texto: "Sellos tanque desperdicios" },
      { codigo: "B.6", texto: "Filtros malla agua" },
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
    markInspectionCompleted("hidro", id, formData);
    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <img
            src="/logotipo de astap.jpg"
            alt="ASTAP"
            className="h-10 object-contain"
          />

          <h1 className="text-lg font-bold text-center flex-1">
            HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
          </h1>

          <div className="text-[11px] text-right leading-tight">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <input name="referenciaContrato" value={formData.referenciaContrato} onChange={handleChange} placeholder="Referencia contrato" className="input" />
          <input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" className="input md:col-span-2" />
          <input name="codInf" value={formData.codInf} onChange={handleChange} placeholder="Cód. INF." className="input" />
          <input type="date" name="fechaInspeccion" value={formData.fechaInspeccion} onChange={handleChange} className="input" />
          <input name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ubicación" className="input" />
          <input name="cliente" value={formData.cliente} onChange={handleChange} placeholder="Cliente" className="input" />
          <input name="tecnicoAstap" value={formData.tecnicoAstap} onChange={handleChange} placeholder="Técnico ASTAP" className="input" />
          <input name="responsableCliente" value={formData.responsableCliente} onChange={handleChange} placeholder="Cliente responsable" className="input md:col-span-2" />
        </div>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Estado del equipo</h2>

        <div className="border rounded-lg p-3 flex justify-center">
          <img
            src="/estado-equipo.png"
            alt="Estado del equipo"
            className="max-w-full h-auto"
          />
        </div>

        <textarea
          name="estadoEquipo"
          value={formData.estadoEquipo}
          onChange={handleChange}
          className="border rounded px-2 py-2 min-h-[100px]"
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
