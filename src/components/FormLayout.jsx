import React from "react";

export default function FormLayout({
  title,
  description,
  status,
  onSave,
  onFinalize,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white border rounded-xl p-6 space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="text-sm text-slate-600">
              {description}
            </p>
          )}

          {/* Estado */}
          <div className="text-xs">
            Estado actual:{" "}
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
               import {
  FORM_STATE_LABELS,
  FORM_STATE_STYLES
} from "@utils/formStates";
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="space-y-6">{children}</div>

        {/* ACCIONES */}
        <div className="bg-white border rounded-xl p-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 text-sm rounded-md border hover:bg-slate-100"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={onFinalize}
            className="px-4 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
