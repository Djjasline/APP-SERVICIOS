import { useTheme } from "@/context/ThemeContext";
import { ClipboardCheck, Construction, MessageSquareText, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EncuestaSatisfaccionConstruccion({ areaLabel, backPath }) {
  const { isLight } = useTheme();
  const navigate = useNavigate();

  const plannedItems = [
    "Encuesta vinculada a cada servicio de campo terminado.",
    "Enlace o código QR para que el cliente responda desde su celular.",
    "Calificación, comentarios, datos del cliente y trazabilidad por área.",
    "Panel administrativo para revisar resultados antes de ampliar el acceso.",
  ];

  const surveyModel = [
    {
      title: "1. Datos del servicio",
      fields: ["Área", "Tipo de servicio", "Código del informe", "Fecha", "Técnico responsable", "Cliente"],
    },
    {
      title: "2. Datos de quien responde",
      fields: ["Nombre", "Cargo", "Empresa", "Correo", "Teléfono", "Relación con el servicio"],
    },
    {
      title: "3. Calificación 1 a 5",
      fields: ["Satisfacción general", "Puntualidad", "Trato del personal", "Calidad técnica", "Claridad de la explicación"],
    },
    {
      title: "4. Preguntas de cierre",
      fields: ["¿El servicio cumplió lo requerido?", "¿Recomendaría a ASTAP?", "¿Autoriza seguimiento comercial?"],
    },
    {
      title: "5. Comentarios y evidencia",
      fields: ["Comentario del cliente", "Observaciones internas", "Firma opcional", "Fecha de respuesta"],
    },
    {
      title: "6. Estado administrativo",
      fields: ["Pendiente", "Enviada", "Respondida", "Revisada", "Requiere seguimiento"],
    },
  ];

  return (
    <div className={`min-h-[60vh] p-6 ${isLight ? "text-slate-900" : "text-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isLight ? "text-orange-600" : "text-orange-300"}`}>
            Módulo en construcción
          </p>
          <h1 className="mt-2 text-3xl font-bold">Encuesta de satisfacción del cliente</h1>
          <p className={`mt-2 max-w-2xl text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Acceso preliminar para {areaLabel}. Este módulo se está preparando para medir la experiencia del cliente en servicios de campo.
          </p>
        </div>

        <button type="button" onClick={() => navigate(backPath)} className="btn-volver-orange">
          Volver
        </button>
      </div>

      <section className={`mt-8 overflow-hidden rounded-3xl border shadow-sm ${isLight ? "border-orange-100 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className={`p-6 ${isLight ? "bg-orange-50" : "bg-orange-500/10"}`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/20">
                <Construction size={28} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Estamos construyendo esta función</h2>
                <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                  Primero quedará disponible en estas áreas de servicio. Cuando esté validada, la ampliamos al resto del sistema.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
              Próximamente
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-950/30"}`}>
            <Star className="text-yellow-500" size={24} />
            <h3 className="mt-3 font-semibold">Calificación del servicio</h3>
            <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Medición rápida de satisfacción, puntualidad, atención y calidad técnica.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-950/30"}`}>
            <MessageSquareText className="text-blue-500" size={24} />
            <h3 className="mt-3 font-semibold">Comentarios del cliente</h3>
            <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Registro de observaciones, recomendaciones y conformidad del servicio realizado.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-950/30"}`}>
            <ClipboardCheck className="text-green-600" size={24} />
            <h3 className="mt-3 font-semibold">Seguimiento administrativo</h3>
            <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Resultados asociados al informe, técnico, cliente, fecha y área correspondiente.
            </p>
          </div>
        </div>
      </section>

      <section className={`mt-6 rounded-2xl border p-5 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <h2 className="font-semibold">Alcance previsto</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {plannedItems.map((item) => (
            <div key={item} className={`rounded-xl border px-4 py-3 text-sm ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-slate-950/30 text-slate-200"}`}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={`mt-6 rounded-2xl border p-5 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-semibold">Modelo de estructura propuesto</h2>
            <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Así quedaría organizada la encuesta cuando se conecte a cada servicio de campo.
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-200"}`}>
            Vista de modelo
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {surveyModel.map((section) => (
            <article key={section.title} className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-950/30"}`}>
              <h3 className="font-semibold">{section.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {section.fields.map((field) => (
                  <span key={field} className={`rounded-full px-3 py-1 text-xs font-medium ${isLight ? "bg-white text-slate-700 ring-1 ring-slate-200" : "bg-white/10 text-slate-200 ring-1 ring-white/10"}`}>
                    {field}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className={`mt-5 rounded-2xl border p-4 ${isLight ? "border-orange-200 bg-orange-50 text-orange-900" : "border-orange-400/30 bg-orange-500/10 text-orange-100"}`}>
          <h3 className="font-semibold">Flujo previsto</h3>
          <p className="mt-1 text-sm leading-6">
            El técnico finaliza el informe, el sistema genera un enlace o QR, el cliente responde sin iniciar sesión y administración revisa el resultado asociado al servicio.
          </p>
        </div>
      </section>
    </div>
  );
}
