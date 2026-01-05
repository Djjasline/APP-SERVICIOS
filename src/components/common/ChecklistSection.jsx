import React from "react";

export default function ChecklistSection({
  title,
  items,
  data,
  onChange,
}) {
  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  const updateItem = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.codigo}
            className="border rounded p-3 space-y-2"
          >
            <p className="text-sm font-medium text-slate-800">
              {item.codigo} — {item.descripcion}
            </p>

            <div className="flex gap-4 text-sm">
              {["si", "no"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-1"
                >
                  <input
                    type="radio"
                    name={`${title}-${i}`}
                    checked={data[i]?.resultado === opt}
                    onChange={() =>
                      updateItem(i, "resultado", opt)
                    }
                  />
                  {opt.toUpperCase()}
                </label>
              ))}
            </div>

            <textarea
              {...textProps}
              rows={2}
              placeholder="Observación / novedad"
              value={data[i]?.observacion || ""}
              onChange={(e) =>
                updateItem(
                  i,
                  "observacion",
                  e.target.value
                )
              }
              className="input resize-y"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
