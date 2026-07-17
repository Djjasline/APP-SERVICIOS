import { useEffect, useState } from "react";
import {
  getOrCreateSurveyForRecord,
  getSurveyForRecord,
  getSurveyPublicUrl,
  markSurveySent,
  SURVEY_STATUS_LABELS,
} from "@/services/customerSurveyService";

function getSetupMessage(error) {
  if (!error) return "";
  if (String(error.message || "").includes("customer_satisfaction_surveys")) {
    return "Ejecuta el SQL customer_satisfaction_surveys.sql en Supabase para activar encuestas.";
  }
  return error.message || "No se pudo preparar la encuesta.";
}

export default function CustomerSurveyLink({ record, userId }) {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isCompleted = record?.estado === "completado";
  const publicUrl = survey?.token ? getSurveyPublicUrl(survey.token) : "";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!record?.id || !isCompleted) return;

      try {
        const data = await getSurveyForRecord(record.id);
        if (mounted) setSurvey(data);
      } catch (err) {
        if (mounted) setError(getSetupMessage(err));
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [record?.id, isCompleted]);

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getOrCreateSurveyForRecord(record, userId);
      setSurvey(data);
      setMessage("Encuesta vinculada al informe.");
    } catch (err) {
      setError(getSetupMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      const updated = survey.status === "pendiente" ? await markSurveySent(survey.id) : survey;
      if (updated) setSurvey(updated);
      setMessage("Enlace copiado para enviar al cliente.");
      setError("");
    } catch (err) {
      setError(err.message || "No se pudo copiar el enlace.");
    }
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <div className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs text-orange-900">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Encuesta del cliente</p>
          <p className="text-orange-700">
            Estado: {SURVEY_STATUS_LABELS[survey?.status] || "No generada"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!survey ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="rounded bg-orange-600 px-3 py-1.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {loading ? "Generando..." : "Generar enlace"}
            </button>
          ) : (
            <>
              <button type="button" onClick={handleCopy} className="rounded bg-orange-600 px-3 py-1.5 font-semibold text-white hover:bg-orange-700">
                Copiar enlace
              </button>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="rounded border border-orange-300 px-3 py-1.5 font-semibold text-orange-700 hover:bg-orange-100">
                Ver formulario
              </a>
            </>
          )}
        </div>
      </div>

      {message && <p className="mt-2 text-green-700">{message}</p>}
      {error && <p className="mt-2 text-red-700">{error}</p>}
    </div>
  );
}
