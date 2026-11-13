import React from "react";
import PartsRowDeleteButton from "@/components/PartsRowDeleteButton";

export default function RepuestosTable({ data, onChange }) {
  const textProps = {
    spellCheck: true,
    autoCorrect: "on",
    autoCapitalize: "sentences",
  };

  const addRow = () => {
    onChange([
      ...data,
      { descripcion: "", cantidad: "", observacion: "" },
    ]);
  };

  const updateRow = (i, field, value) => {
    const updated = [...data];
    updated[i][field] = value;
    onChange(updated);
  };

  const removeRow = (i) => {
    const row = data[i];
    if ([row?.descripcion, row?.cantidad, row?.observacion].some((value) => String(value ?? "").trim()) && !window.confirm(`¿Eliminar el repuesto ${i + 1}?`)) return;
    const updated = data.filter((_, idx) => idx !== i);
    onChange(updated);
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">
        Materiales / Repuestos utilizados
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-2">Descripción</th>
              <th className="border px-2 py-2 w-24">Cantidad</th>
              <th className="border px-2 py-2">Observación</th>
              <th className="border px-2 py-2 w-16"></th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">
                  <input
                    {...textProps}
                    className="input"
                    value={row.descripcion}
                    placeholder="Ej: Filtro, empaque, aceite"
                    onChange={(e) =>
                      updateRow(i, "descripcion", e.target.value)
                    }
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="input text-center"
                    value={row.cantidad}
                    placeholder="Cant."
                    onChange={(e) =>
                      updateRow(i, "cantidad", e.target.value)
                    }
                  />
                </td>

                <td className="border px-2 py-1">
                  <input
                    {...textProps}
                    className="input"
                    value={row.observacion}
                    placeholder="Detalle adicional"
                    onChange={(e) =>
                      updateRow(i, "observacion", e.target.value)
                    }
                  />
                </td>

                <td className="border px-2 py-1 text-center">
                  <PartsRowDeleteButton label={`Eliminar repuesto ${i + 1}`} onClick={() => removeRow(i)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="text-sm px-3 py-2 rounded border hover:bg-slate-100"
      >
        + Agregar repuesto
      </button>
    </section>
  );
}
