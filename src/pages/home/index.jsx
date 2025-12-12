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
        {/* Encabezado principal */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Panel de servicios ASTAP
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Selecciona el tipo de formato que deseas trabajar. Cada familia
            tiene su propio historial independiente.
          </p>
        </header>

        {/* Tarjetas de familias */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* 1. Informe general de servicios */}
          <article className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">
                1. Informe general de servicios
              </h2>
              <p className="text-xs text-slate-600">
                Formato único para registrar los informes técnicos de servicio.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                iconName="Plus"
                onClick={() => navigate("/service-report-creation")}
              >
                Nuevo informe
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="List"
                onClick={() => navigate("/servicios")}
              >
                Ver historial
              </Button>
            </div>
          </article>

          {/* 2. Inspección y valoración de equipos */}
          <article className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">
                2. Inspección y valoración de equipos
              </h2>
              <p className="text-xs text-slate-600">
                Aquí irán los 3 formatos de inspección hidráulica y demás
                evaluaciones de equipos.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                iconName="ClipboardList"
                onClick={() => navigate("/inspeccion-hidro")}
              >
                Ir a inspecciones
              </Button>
              <p className="text-[11px] text-slate-500">
                * Por ahora se muestra un placeholder. Luego conectaremos los 3
                formatos reales.
              </p>
            </div>
          </article>

          {/* 3. Servicio de mantenimientos */}
          <article className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">
                3. Servicio de mantenimientos
              </h2>
              <p className="text-xs text-slate-600">
                Familia para los formatos de control de horas / km y órdenes de
                mantenimiento.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                iconName="Wrench"
                onClick={() => navigate("/mantenimiento")}
              >
                Abrir módulo de mantenimiento
              </Button>
              <p className="text-[11px] text-slate-500">
                * En esta primera versión verás solo una pantalla informativa.
              </p>
            </div>
          </article>
        </section>

        {/* Pie de página pequeño */}
        <footer className="pt-4 border-t text-[11px] text-slate-400 flex items-center gap-1">
          <Icon name="Info" size={12} />
          <span>
            Desde este panel solo agrupamos las familias. Cada módulo mantiene
            su propio flujo y reportes.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
