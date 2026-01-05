import React from "react";

export default function ActivitiesSection({ data, onChange }) {
  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  const addActivity = () => {
    onChange([
      ...data,
      { titulo: "", descripcion: "", imagenes: [] },
    ]);
  };

  const updateActivity = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Actividades realizadas
      </h2>

      {data.map((act, i) => (
        <div
          key={i}
          className="border rounded p-4 space-y-3"
        >
          <input
            {...textProps}
            placeholder={`Título actividad ${i + 1}`}
            value={act.titulo}
            onChange={(e) =>
              updateActivity(i, "titulo", e.target.value)
            }
            className="input"
          />

          <textarea
            {...textProps}
            rows={4}
            placeholder="Descripción de la actividad"
            value={act.descripcion}
            onChange={(e) =>
              updateActivity(
                i,
                "descripcion",
                e.target.value
              )
            }
            className="input resize-y"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addActivity}
        className="text-sm px-3 py-2 rounded border hover:bg-slate-100"
      >
        + Agregar actividad
      </button>
    </section>
  );
}
