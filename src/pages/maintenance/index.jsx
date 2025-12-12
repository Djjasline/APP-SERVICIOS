// src/pages/maintenance/index.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const MaintenanceLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Módulos de mantenimiento
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Aquí irán los formatos para control de horas/km y servicios de
              mantenimiento. De momento es una pantalla de preparación.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="ArrowLeft"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </header>

        <div className="bg-white rounded-xl shadow border p-6 space-y-4">
          <p className="text-sm text-slate-700">
            Próximamente podrás seleccionar entre:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Control de horas y kilómetros de unidades.</li>
            <li>Formato de registro de mantenimientos realizados.</li>
          </ul>

          <div className="mt-4 flex items-center text-xs text-slate-500">
            <Icon name="Info" size={14} className="mr-1" />
            Esta pantalla es solo un placeholder mientras migramos y unificamos
            los formatos existentes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLanding;
