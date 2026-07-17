import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicSurveyByToken, submitPublicSurvey } from "@/services/customerSurveyService";

const ratingFields = [
  ["general", "Satisfacción general"],
  ["puntualidad", "Puntualidad"],
  ["trato", "Trato del personal"],
  ["calidad", "Calidad técnica"],
  ["claridad", "Claridad de la explicación"],
];

const answerFields = [
  ["cumplio", "¿El servicio cumplió lo requerido?"],
  ["recomendaria", "¿Recomendaría a ASTAP?"],
  ["seguimiento", "¿Autoriza seguimiento comercial o técnico?"],
];

export default function CustomerSurveyPublic() {
  const { token } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [respondent, setRespondent] = useState({ name: "", role: "", company: "", email: "", phone: "" });
  const [ratings, setRatings] = useState({});
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPublicSurveyByToken(token);
        setSurvey(data);
        setSubmitted(data?.status === "respondida");
      } catch (err) {
        setError(err.message || "No se pudo cargar la encuesta.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const setRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const setAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!respondent.name.trim()) {
      setError("Ingresa el nombre de quien responde.");
      return;
    }

    if (!ratings.general) {
      setError("Selecciona la satisfacción general.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitPublicSurvey(token, { respondent, ratings, answers, comments });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar la encuesta.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">Cargando encuesta...</div>;
  }

  if (!survey) {
    return <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">Encuesta no encontrada.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <img src="/astap-logo.jpg" alt="ASTAP" className="h-14 w-14 rounded-xl object-contain" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">Encuesta de satisfacción</p>
          <h1 className="mt-2 text-2xl font-bold">Servicio técnico ASTAP</h1>
          <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm md:grid-cols-2">
            <p><strong>Área:</strong> {survey.area}</p>
            <p><strong>Informe:</strong> {survey.report_code || "-"}</p>
            <p><strong>Cliente:</strong> {survey.client_name || "-"}</p>
            <p><strong>Técnico:</strong> {survey.technician_name || "-"}</p>
          </div>
        </section>

        {submitted ? (
          <section className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-6 text-green-900">
            <h2 className="text-xl font-semibold">Gracias por su respuesta</h2>
            <p className="mt-2 text-sm">La encuesta quedó registrada y asociada al servicio realizado.</p>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <section>
              <h2 className="font-semibold">Datos de quien responde</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {[
                  ["name", "Nombre y apellido"],
                  ["role", "Cargo"],
                  ["company", "Empresa"],
                  ["email", "Correo"],
                  ["phone", "Teléfono"],
                ].map(([key, label]) => (
                  <label key={key} className="text-sm">
                    <span className="font-medium">{label}</span>
                    <input
                      value={respondent[key]}
                      onChange={(event) => setRespondent((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-semibold">Calificación del servicio</h2>
              <div className="mt-3 space-y-3">
                {ratingFields.map(([key, label]) => (
                  <div key={key} className="rounded-2xl border border-slate-200 p-3">
                    <p className="text-sm font-medium">{label}</p>
                    <div className="mt-2 flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(key, value)}
                          className={`h-9 w-9 rounded-full text-sm font-semibold ${ratings[key] === value ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-semibold">Preguntas de cierre</h2>
              <div className="mt-3 space-y-3">
                {answerFields.map(([key, label]) => (
                  <div key={key} className="rounded-2xl border border-slate-200 p-3">
                    <p className="text-sm font-medium">{label}</p>
                    <div className="mt-2 flex gap-2">
                      {[
                        ["si", "Sí"],
                        ["no", "No"],
                        ["parcial", "Parcial"],
                      ].map(([value, text]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAnswer(key, value)}
                          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${answers[key] === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <label className="block text-sm">
              <span className="font-semibold">Comentarios del cliente</span>
              <textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
                placeholder="Observaciones, recomendaciones o comentarios adicionales..."
              />
            </label>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <button disabled={submitting} className="w-full rounded-2xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
              {submitting ? "Enviando..." : "Enviar encuesta"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
