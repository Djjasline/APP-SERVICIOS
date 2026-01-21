import React from "react";

export default function ChecklistSection({
  title,
  items,
  data = [],
  onChange,
}) {
  const handleChange = (codigo, field, value) => {
    const updated = [...data];
    const index = updated.findIndex(
      (i) => i.codigo === codigo
    );

    if (index >= 0) {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    } else {
      updated.push({
        codigo,
        estado: field === "estado" ? value : "",
        observacion: field === "observacion" ? value : "",
      });
    }

    onChange(updated);
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>

      <table className="w-full border border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-1 w-20">Ítem</th>
            <th className="border p-1">Detalle</th>
            <th className="border p-1 w-16">SI</th>
            <th className="border p-1 w-16">NO</th>
            <th className="border p-1">Observación</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const row =
              data.find((d) => d.codigo === item.codigo) ||
              {};

            return (
              <tr key={item.codigo}>
                <td className="border p-1">
                  {item.codigo}
                </td>

                <td className="border p-1">
                  {item.descripcion}
                </td>

                <td className="border p-1 text-center">
                  <input
                    type="radio"
                    name={`${item.codigo}-estado`}
                    checked={row.estado === "SI"}
                    onChange={() =>
                      handleChange(
                        item.codigo,
                        "estado",
                        "SI"
                      )
                    }
                  />
                </td>

                <td className="border p-1 text-center">
                  <input
                    type="radio"
                    name={`${item.codigo}-estado`}
                    checked={row.estado === "NO"}
                    onChange={() =>
                      handleChange(
                        item.codigo,
                        "estado",
                        "NO"
                      )
                    }
                  />
                </td>

                <td className="border p-1">
                  <input
                    className="w-full border px-1"
                    value={row.observacion || ""}
                    onChange={(e) =>
                      handleChange(
                        item.codigo,
                        "observacion",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
