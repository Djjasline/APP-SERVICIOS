export function createDefaultPartsAnnexRows(count = 5) {
  return Array.from({ length: count }, () => ({
    descripcion: "",
    numeroParte: "",
    cantidad: "",
  }));
}

export function normalizePartsAnnexRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return createDefaultPartsAnnexRows();

  return rows.map((row) => ({
    descripcion: row?.descripcion || "",
    numeroParte: row?.numeroParte || row?.nParte || "",
    cantidad: row?.cantidad || "",
  }));
}

export default function InspectionPartsAnnex({ rows, onChange }) {
  const items = normalizePartsAnnexRows(rows);

  const updateRow = (index, field, value) => {
    onChange(items.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    onChange([...items, { descripcion: "", numeroParte: "", cantidad: "" }]);
  };

  const removeLastRow = () => {
    if (items.length <= 1) return;
    onChange(items.slice(0, -1));
  };

  return (
    <section className="space-y-2">
      <h3 className="font-bold text-sm border-b pb-1">ANEXO DE ÍTEMS / REPORTE DE PIEZAS</h3>

      <table className="pdf-table w-full">
        <thead>
          <tr>
            <th style={{ width: 45 }}>ÍTEM</th>
            <th>DESCRIPCIÓN</th>
            <th style={{ width: 170 }}>N° PARTE</th>
            <th style={{ width: 110 }}>CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={index}>
              <td className="text-center font-semibold">{index + 1}</td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={row.descripcion}
                  placeholder="Descripción de la pieza o ítem requerido"
                  onChange={(event) => updateRow(index, "descripcion", event.target.value)}
                />
              </td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={row.numeroParte}
                  placeholder="N° parte"
                  onChange={(event) => updateRow(index, "numeroParte", event.target.value)}
                />
              </td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={row.cantidad}
                  placeholder="Cant."
                  onChange={(event) => updateRow(index, "cantidad", event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRow}
          className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded"
        >
          + Agregar más ítems
        </button>
        <button
          type="button"
          onClick={removeLastRow}
          disabled={items.length <= 1}
          className="border border-red-200 px-4 py-1.5 text-xs rounded text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Eliminar último
        </button>
      </div>
    </section>
  );
}

export function InspectionPartsAnnexPdf({ rows, styles }) {
  const items = normalizePartsAnnexRows(rows).filter(
    (row) => row.descripcion || row.numeroParte || row.cantidad
  );

  if (items.length === 0) return null;

  const S = styles;

  return (
    <div className="no-break">
      <p style={S.sectionTitle}>ANEXO DE ÍTEMS / REPORTE DE PIEZAS</p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 45 }}>ÍTEM</th>
            <th style={{ ...S.th, textAlign: "left" }}>DESCRIPCIÓN</th>
            <th style={{ ...S.th, width: 130 }}>N° PARTE</th>
            <th style={{ ...S.th, width: 90 }}>CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={index}>
              <td style={{ ...S.cell, textAlign: "center", fontWeight: 700 }}>{index + 1}</td>
              <td style={{ ...S.cell, whiteSpace: "pre-wrap" }}>{row.descripcion || "—"}</td>
              <td style={S.cell}>{row.numeroParte || "—"}</td>
              <td style={{ ...S.cell, textAlign: "center" }}>{row.cantidad || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
