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
                  HOJA DE INSPECCIÓN HIDROSUCCIONADOR
                </h1>
                <p className="text-xs text-slate-500">
                  Reporte de inspección de equipos  / hidrosuccionador.
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

        {/* 1. DATOS DEL REPORTE (mismo modelo que el general) */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              1. Datos del reporte
            </h2>
            <p className="text-xs text-slate-500">
              Datos del cliente, contacto, servicio y técnico responsable.
            </p>
          </div>

          <div className="space-y-4">
            {/* Cliente (empresa) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Cliente (empresa) *
              </label>
              <input
                type="text"
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre de la empresa cliente"
              />
            </div>

            {/* Contacto + cargo del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Contacto del cliente
                </label>
                <input
                  type="text"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Nombre de la persona de contacto"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Cargo del cliente
                </label>
                <input
                  type="text"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Cargo o rol de la persona de contacto"
                />
              </div>
            </div>

            {/* Correo del cliente */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Correo del cliente
              </label>
              <input
                type="email"
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="correo@cliente.com"
              />
            </div>

            {/* Fecha de servicio + Código interno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Fecha de servicio
                </label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Código interno
                </label>
                <input
                  type="text"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Identificador interno del servicio"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Dirección
              </label>
              <input
                type="text"
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Dirección donde se realiza el servicio"
              />
            </div>

            {/* Referencia */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Referencia
              </label>
              <textarea
                rows={2}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                placeholder="Puntos de referencia para llegar al sitio"
              />
            </div>

            {/* Datos del técnico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Técnico responsable
                </label>
                <input
                  type="text"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Nombre del técnico ASTAP"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Teléfono del técnico
                </label>
                <input
                  type="tel"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="+593..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Correo del técnico
                </label>
                <input
                  type="email"
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="tecnico@astap.com"
                />
              </div>
            </div>
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
