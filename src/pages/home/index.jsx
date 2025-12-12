// src/pages/home/index.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const HomeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Encabezado */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            Panel de servicios ASTAP
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Selecciona el tipo de formulario que deseas completar. Cada familia
            mantiene su propio historial de informes.
          </p>
        </header>

        {/* Tarjetas de familias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Informe general de servicios */}
          <section className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-700 mb-1">
                <Icon name="FileText" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Informe general de servicios
              </h2>
              <p className="text-sm text-slate-600">
                Formato completo para reportar cualquier servicio realizado:
                datos del cliente, pruebas, actividades, equipo y firmas
                digitales.
              </p>
              <p className="text-xs text-slate-500">
                Formato único (flujo que ya tienes funcionando).
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                iconName="Plus"
                onClick={() => navigate("/service-report-creation")}
              >
                Crear nuevo informe
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="List"
                onClick={() => navigate("/informes-servicio")}
              >
                Ver historial de informes
              </Button>
            </div>
          </section>

          {/* 2. Inspección y valoración de equipos */}
          <section className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mb-1">
                <Icon name="ClipboardCheck" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Inspección y valoración de equipos
              </h2>
              <p className="text-sm text-slate-600">
                Familia de formatos para inspeccionar equipos, registrar
                condiciones y evaluar su estado operativo.
              </p>
              <p className="text-xs text-slate-500">
                Tendrá 3 formatos (por definir). De momento se muestra una
                pantalla de trabajo para la hoja de inspección hidráulica.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                iconName="FileSpreadsheet"
                onClick={() => navigate("/inspeccion")}
              >
                Abrir formatos de inspección
              </Button>
            </div>
          </section>

          {/* 3. Servicio de mantenimientos */}
          <section className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 mb-1">
                <Icon name="Wrench" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Servicio de mantenimientos
              </h2>
              <p className="text-sm text-slate-600">
                Para control de horas, kilómetros, mantenimientos preventivos y
                correctivos de las unidades.
              </p>
              <p className="text-xs text-slate-500">
                Tendrá 2 formatos. Por ahora verás una pantalla placeholder
                mientras definimos el flujo.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                iconName="Clock"
                onClick={() => navigate("/mantenimiento")}
              >
                Abrir módulos de mantenimiento
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
