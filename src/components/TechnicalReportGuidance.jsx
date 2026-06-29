const technicalReportRules = [
  "Actividad realizada: que se hizo y sobre que equipo.",
  "Hallazgos: evidencia concreta, medicion, condicion o novedad observada.",
  "Conclusion tecnica: que significa el hallazgo para la operacion del equipo.",
  "Recomendacion accionable: que se debe hacer, cuando o en que proxima intervencion.",
];

export default function TechnicalReportGuidance({ compact = false }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <p className="font-semibold">Lineamientos obligatorios para informe tecnico</p>
      {!compact && (
        <p className="mt-1 text-blue-800">
          El informe debe ser objetivo, verificable y permitir trazabilidad para que otra persona entienda que paso sin haber estado en campo.
        </p>
      )}
      <ul className="mt-2 grid gap-1 md:grid-cols-2 list-disc pl-5">
        {technicalReportRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-blue-700">
        Evitar frases vagas como "esta OK", "parece", "mas o menos" o "yo pienso". Describir que se hizo, como se verifico y que accion se recomienda.
      </p>
    </div>
  );
}
