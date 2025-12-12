// src/app/inspeccion/index.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

/**
 * Placeholder de la Hoja de Inspección Hidráulica.
 * Más adelante pegaremos aquí la lógica real del proyecto
 * "hoja-de-inspecci-n-hidro".
 */
const InspeccionHidro = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Barra superior */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Hoja de inspección hidráulica
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Aquí irá el formulario completo de inspección y valoración
              hidráulica. De momento es una pantalla de prueba para integrar
              este módulo dentro de la APP-SERVICIOS.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="Home"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </header>

        {/* Contenido temporal */}
        <section className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Módulo en integración
          </h2>
          <p className="text-sm text-slate-600">
            Esta pantalla representa la familia{" "}
            <span className="font-semibold">
              2. Inspección y valoración de equipos
            </span>{" "}
            (formato hidráulico). El siguiente paso será copiar aquí los
            componentes del proyecto{" "}
            <code className="font-mono text-xs bg-slate-100 px-1 rounded">
              hoja-de-inspecci-n-hidro
            </code>{" "}
            y adaptarlos para que funcionen como parte de esta aplicación.
          </p>

          <div className="mt-4 border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 text-sm text-slate-500">
            <p className="mb-2">
              ✅ La integración básica ya está lista:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ruta <code>/inspeccion-hidro</code> conectada al Router.</li>
              <li>Pantalla visible desde el panel de inicio.</li>
              <li>Botón para volver al inicio sin romper el flujo principal.</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            En la siguiente etapa reemplazaremos este contenido por el
            formulario real de inspección, copiando los archivos necesarios
            desde el otro repositorio.
          </p>
        </section>
      </div>
    </div>
  );
};

export default InspeccionHidro;
