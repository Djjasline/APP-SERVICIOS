import React, { useState } from "react";

export default function ServiceReportCreation() {
  const [report, setReport] = useState({
    generalInfo: {},
    equipment: {},
    serviceDetail: {},
    materials: [],
    conclusion: {},
    signatures: {},
    status: "draft",
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6 space-y-8">

        {/* HEADER */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            Reporte de Servicio
          </h1>
          <p className="text-sm text-slate-600">
            Formato general para equipos y vehículos especiales
          </p>
        </header>

        {/* SECCIÓN 1 */}
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-slate-800">
            1. Datos del reporte
          </h2>
          <p className="text-sm text-slate-500">
            Información general del cliente y servicio
          </p>
        </section>

        {/* SECCIÓN 2 */}
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-slate-800">
            2. Datos del equipo
          </h2>
          <p className="text-sm text-slate-500">
            Información técnica del equipo o vehículo
          </p>
        </section>

        {/* SECCIÓN 3 */}
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-slate-800">
            3. Detalle del servicio realizado
          </h2>
        </section>

        {/* SECCIÓN 4 */}
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-slate-800">
            4. Materiales / Repuestos
          </h2>
        </section>

        {/* SECCIÓN 5 */}
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-slate-800">
            5. Conclusión
          </h2>
        </section>

        {/* SECCIÓN 6 */}
        <section className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-slate-800">
            6. Firmas
          </h2>
        </section>

        {/* ACCIONES */}
        <div className="flex justify-end gap-3 pt-4">
          <button className="px-4 py-2 rounded-md border">
            Guardar borrador
          </button>
          <button className="px-4 py-2 rounded-md bg-slate-900 text-white">
            Finalizar reporte
          </button>
        </div>

      </div>
    </div>
  );
}
