// src/pages/maintenance/index.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const Maintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Encabezado */}
        <header className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="ArrowLeft"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>

          <h1 className="text-2xl font-semibold text-slate-900">
            Módulo de mantenimiento
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Aquí agruparemos los formatos de{" "}
            <strong>control de horas y km</strong> y otros formularios de
            mantenimiento. Por ahora es una pantalla de prueba para integrar
            la familia 3 de tu esquema.
          </p>
        </header>

        {/* Cuerpo / placeholder */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Icon name="Wrench" size={20} className="text-sky-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Familia 3: Servicio de mantenimientos
              </h2>
              <p className="text-xs text-slate-600">
                Más adelante conectaremos aquí tus formatos:
                <br />
                • Control de horas y km <br />
                • Orden de mantenimiento (u otros que definamos)
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-slate-50 text-xs text-slate-600 space-y-2">
            <p>
              <strong>Estado actual:</strong> módulo en construcción. La idea es
              que mantenga su propio listado de formularios, igual que el
              módulo de informes de servicio.
            </p>
            <p>
              Cuando tengamos listos los formatos, aquí aparecerán botones del
              estilo:
            </p>
            <ul className="list-disc ml-4">
              <li>📄 Nuevo control de horas / km</li>
              <li>📄 Nuevo informe de mantenimiento</li>
              <li>📚 Ver historial de mantenimientos</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Home"
              onClick={() => navigate("/")}
            >
              Volver al panel principal
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Maintenance;
