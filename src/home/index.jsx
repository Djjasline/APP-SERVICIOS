// src/pages/home/index.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Encabezado */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            ASTAP – Panel de formatos de servicio
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Selecciona la familia de formatos que necesitas completar. Cada
            módulo mantiene su propio historial de informes.
          </p>
        </header>

        {/* Tarjetas de familias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Informe general de servicios */}
          <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">
                <Icon name="FileText" size={14} />
                <span>Formato único</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                1. Informe general de servicios
              </h2>
              <p className="text-xs text-slate-600">
                Registro estándar de servicios realizados: información general,
                pruebas antes/después, actividades, datos del equipo y firmas.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                size="sm"
                iconName="List"
                onClick={() => navigate("/report-history-management")}
              >
                Ver historial
              </Button>
              <Button
                size="sm"
                variant="outline"
                iconName="Plus"
                onClick={() => navigate("/service-report-creation")}
              >
                Nuevo informe
              </Button>
            </div>
          </section>

          {/* 2. Inspección y valoración de equipos */}
          <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                <Icon name="ClipboardList" size={14} />
                <span>Hasta 3 formatos</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                2. Inspección y valoración de equipos
              </h2>
              <p className="text-xs text-slate-600">
                Formatos para inspección visual, pruebas hidráulicas y
                valoración general de equipos. Actualmente disponible:
                inspección hidráulica.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                size="sm"
                iconName="FilePlus"
                onClick={() => navigate("/inspeccion-hidro")}
              >
                Abrir formato
              </Button>

              {/* Más adelante, aquí podríamos poner un botón "Submenú" */}
            </div>
          </section>

          {/* 3. Servicio de mantenimientos */}
          <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                <Icon name="Wrench" size={14} />
                <span>Próximamente</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                3. Servicio de mantenimientos
              </h2>
              <p className="text-xs text-slate-600">
                Planificado para incluir formatos de mantenimiento preventivo y
                correctivo, con control de horas de uso y kilometrajes.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                disabled
                iconName="Lock"
              >
                En construcción
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
