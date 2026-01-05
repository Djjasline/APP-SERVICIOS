import React from "react";
import PdfButton from "@components/pdf/PdfButton";
import { FORM_STATE_LABELS, FORM_STATE_STYLES } from "@utils/formStates";

export default function FormLayout({
  title,
  description,
  status,
  onSave,
  onFinalize,
  children,
}) {
  const pdfId = "pdf-content";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="bg-white border rounded-xl p-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-slate-500">
              {description}
            </p>

            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${FORM_STATE_STYLES[status]}`}
            >
              {FORM_STATE_LABELS[status]}
            </span>
          </div>

          <div className="flex gap-2">
            <PdfButton
              targetId={pdfId}
              filename={`${title}.pdf`}
            />

            <button
              onClick={onSave}
              className="px-3 py-2 text-sm rounded bg-slate-900 text-white"
            >
              Guardar
            </button>

            <button
              onClick={onFinalize}
              className="px-3 py-2 text-sm rounded border"
            >
              Finalizar
            </button>
          </div>
        </div>

        {/* CONTENIDO EXPORTABLE */}
        <div id={pdfId} className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
