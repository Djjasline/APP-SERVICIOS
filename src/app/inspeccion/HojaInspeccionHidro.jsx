// src/app/inspeccion/HojaInspeccionHidro.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* =============================
     ESTADO PRINCIPAL
  ============================= */
  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    tecnicoAstap: "",
    responsableCliente: "",
    detalleEstadoEquipo: "",
  });

  const [marcas, setMarcas] = useState([]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const agregarMarca = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMarcas((prev) => [...prev, { x, y }]);
  };

  const eliminarMarca = (index) => {
    setMarcas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...formData,
      marcas,
    });
    navigate("/inspeccion");
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white rounded-xl shadow p-6 space-y-8"
    >
      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-[120px_1fr_200px] items-center gap-4">
          {/* LOGO */}
          <img
            src="/logotipo-de-astap.jpg"
            alt="ASTAP"
            className="w-full object-contain"
          />

          {/* TÍTULO */}
          <h1 className="text-center font-semibold text-lg">
            HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
          </h1>

          {/* VERSION */}
          <div className="text-xs text-right">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        {/* CAMPOS */}
        <div className="grid md:grid-cols-3 gap-3">
          <input
            name="referenciaContrato"
            value={formData.referenciaContrato}
            onChange={handleChange}
            placeholder="Referencia contrato"
            className="input"
          />
          <input
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="input md:col-span-2"
          />
          <input
            name="codInf"
            value={formData.codInf}
            onChange={handleChange}
            placeholder="Cód. INF."
            className="input"
          />
          <input
            type="date"
            name="fechaInspeccion"
            value={formData.fechaInspeccion}
            onChange={handleChange}
            className="input"
          />
          <input
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ubicación"
            className="input"
          />
          <input
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            placeholder="Cliente"
            className="input"
          />
          <input
            name="tecnicoAstap"
            value={formData.tecnicoAstap}
            onChange={handleChange}
            placeholder="Técnico ASTAP"
            className="input"
          />
          <input
            name="responsableCliente"
            value={formData.responsableCliente}
            onChange={handleChange}
            placeholder="Cliente responsable"
            className="input md:col-span-2"
          />
        </div>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold text-sm">Estado del equipo</h2>

        <p className="text-xs text-gray-500">
          Haga clic sobre la imagen para marcar daños o defectos. Doble clic
          sobre un número para eliminarlo.
        </p>

        {/* IMAGEN + MARCAS */}
        <div
          className="relative border rounded-lg overflow-hidden"
          onClick={agregarMarca}
        >
          <img
            src="/estado-equipo.png"
            alt="Estado del equipo"
            className="w-full object-contain"
          />

          {marcas.map((m, i) => (
            <div
              key={i}
              onDoubleClick={() => eliminarMarca(i)}
              className="absolute bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full cursor-pointer"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* DETALLE */}
        <textarea
          name="detalleEstadoEquipo"
          value={formData.detalleEstadoEquipo}
          onChange={handleChange}
          placeholder="Detalle del estado del equipo"
          className="w-full border rounded p-2 min-h-[120px]"
        />
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
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
