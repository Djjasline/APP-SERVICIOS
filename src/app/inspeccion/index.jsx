// src/app/inspeccion/index.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const InspeccionHidro = () => {
  const navigate = useNavigate();

  // Puntos marcados sobre la imagen del equipo
  const [marks, setMarks] = useState([]);

  // Añadir punto con un clic
  const handleImageClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    setMarks((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: xPercent,
        y: yPercent,
      },
    ]);
  };

  // Eliminar punto con doble clic sobre el número
  const handleMarkDoubleClick = (id, event) => {
    event.stopPropagation();
    setMarks((prev) => prev.filter((m) => m.id !== id));
  };

  const handleBackToPanel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ENCABEZADO CON LOGO Y TÍTULO */}
        <section className="bg-white rounded-xl shadow border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  HOJA DE INSPECCIÓN HIDROSUCCIONADORA
                </h1>
                <p className="text-xs text-slate-500">
                  Reporte de inspección de equipos Vactor / hidrosuccionadora.
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 space-y-0.5">
              <div>
                <span className="font-medium">Fecha de versión:</span>{" "}
                01-01-2026
              </div>
              <div>
                <span className="font-medium">Versión:</span> 01
              </div>
            </div>
          </div>
        </section>

        {/* 1. DATOS DEL REPORTE */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              1. Datos del reporte
            </h2>
            <p className="text-xs text-slate-500">
              Información básica de la inspección: contrato, ubicación, cliente
              y técnico ASTAP.
            </p>
          </div>

          {/* Línea 1: contrato + descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Referencia de contrato
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Número o referencia del contrato"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Descripción
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Breve descripción de la inspección"
              />
            </div>
          </div>

          {/* Línea 2: Cód. INF */}
          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-medium text-slate-700">
              Cód. INF.
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Código interno del informe"
            />
          </div>

          {/* Línea 3: Fecha + Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Fecha de inspección
              </label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Ubicación
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Ciudad, planta, dirección, etc."
              />
            </div>
          </div>

          {/* Línea 4: Cliente + Técnico ASTAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Cliente
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Técnico ASTAP
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre del técnico ASTAP"
              />
            </div>
          </div>

          {/* Línea 5: Cliente responsable */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Cliente responsable
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Persona responsable por parte del cliente"
            />
          </div>
        </section>

        {/* 2. ESTADO DEL EQUIPO */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              2. Estado del equipo
            </h2>
            <p className="text-xs text-slate-500">
              Haga clic sobre la imagen para marcar puntos con daños o
              defectos. Haga doble clic sobre un número para eliminarlo.
            </p>
          </div>

          <div className="mt-3">
            <div
              className="relative border rounded-xl bg-slate-50 overflow-hidden max-w-4xl mx-auto cursor-crosshair"
              onClick={handleImageClick}
            >
              {/* Imagen única con las 4 vistas del equipo */}
              <img
                src="/estado-equipo.png"
                alt="Estado del equipo"
                className="w-full h-auto select-none pointer-events-none"
              />

              {/* Puntos numerados */}
              {marks.map((mark, index) => (
                <button
                  key={mark.id}
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => handleMarkDoubleClick(mark.id, e)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                  style={{
                    left: `${mark.x}%`,
                    top: `${mark.y}%`,
                  }}
                  title="Doble clic para eliminar"
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Barra inferior de acciones */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              iconName="ArrowLeft"
              onClick={handleBackToPanel}
            >
              Volver al panel
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="FileText"
            iconPosition="right"
            onClick={() => alert("En una siguiente fase generaremos el PDF.")}
          >
            Generar borrador de informe
          </Button>
        </section>
      </div>
    </div>
  );
};

export default InspeccionHidro;
