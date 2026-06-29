const technicalReportRules = [
  "Actividad realizada: qué se hizo y sobre qué equipo.",
  "Hallazgos: evidencia concreta, medición, condición o novedad observada.",
  "Conclusión técnica: qué significa el hallazgo para la operación del equipo.",
  "Recomendación accionable: qué se debe hacer, cuándo o en qué próxima intervención.",
];

export default function TechnicalReportGuidance({ compact = false }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <p className="font-semibold">Lineamientos obligatorios para informe técnico</p>
      {!compact && (
        <p className="mt-1 text-blue-800">
          El informe debe ser objetivo, verificable y permitir trazabilidad para que otra persona entienda qué pasó sin haber estado en campo.
        </p>
      )}
      <ul className="mt-2 grid gap-1 md:grid-cols-2 list-disc pl-5">
        {technicalReportRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-blue-700">
        Evitar frases vagas como "está OK", "parece", "más o menos" o "yo pienso". Describir qué se hizo, cómo se verificó y qué acción se recomienda.
      </p>
    </div>
  );
}
