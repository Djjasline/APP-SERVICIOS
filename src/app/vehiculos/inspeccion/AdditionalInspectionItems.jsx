import InspectionChecklistRow from "@/components/InspectionChecklistRow";
import InspectionCriteriaLegend from "./InspectionCriteriaLegend";
import { getAdditionalRows } from "./additionalInspectionItems.mjs";

const EMPTY_ROW_ID = "additional-initial";

export default function AdditionalInspectionItems({ data, setData, recordId, newCriteria, allowObservationRotation = false }) {
  const savedRows = getAdditionalRows(data?.elementosAdicionales);
  const rows = savedRows.length ? savedRows : [{ id: EMPTY_ROW_ID }];

  const changeRow = (id, field, value) => {
    setData((previous) => {
      const current = getAdditionalRows(previous.elementosAdicionales);
      const next = current.some((row) => row.id === id)
        ? current.map((row) => row.id === id ? { ...row, [field]: value } : row)
        : [...current, { id, [field]: value }];
      return { ...previous, elementosAdicionales: next };
    });
  };

  const addRow = () => {
    const id = `additional-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    setData((previous) => {
      const current = getAdditionalRows(previous.elementosAdicionales);
      return { ...previous, elementosAdicionales: [...(current.length ? current : [{ id: EMPTY_ROW_ID }]), { id }] };
    });
  };

  const removeRow = (row) => {
    if ((row.descripcion || row.estado || row.observacion || row.imagenes?.length) && !window.confirm("¿Eliminar este elemento adicional y sus observaciones?")) return;
    setData((previous) => ({ ...previous, elementosAdicionales: getAdditionalRows(previous.elementosAdicionales).filter((item) => item.id !== row.id) }));
  };

  return <section className="space-y-2">
    <h3 className="font-bold text-xs border-b pb-1">ELEMENTOS ADICIONALES EN MAL ESTADO</h3>
    <p className="text-[11px] text-gray-500">{newCriteria ? <InspectionCriteriaLegend /> : "SI = Sin anomalías | NO = Presenta anomalía (describa en observación) | N/A = No aplica al equipo"}</p>
    <div className="overflow-x-auto">
      <table className="pdf-table w-full">
        <thead><tr><th style={{ width: 50 }}>ÍTEM</th><th className="text-left">DESCRIPCIÓN</th><th style={{ width: 40 }}>SÍ</th><th style={{ width: 40 }}>NO</th><th style={{ width: 40 }}>N/A</th><th className="text-left">OBSERVACIÓN</th><th>ACCIÓN</th></tr></thead>
        {rows.map((row, index) => <tbody key={row.id}>
          <InspectionChecklistRow codigo={row.id} displayCode={`AD.${index + 1}`} descripcion={row.descripcion || ""} onDescriptionChange={(value) => changeRow(row.id, "descripcion", value)} item={row} onItemChange={changeRow} recordId={recordId} newCriteria={newCriteria} allowObservationRotation={allowObservationRotation} action={<button type="button" onClick={() => removeRow(row)} className="px-2 py-1 text-xs text-red-700 underline" aria-label={`Eliminar elemento adicional ${index + 1}`}>Eliminar</button>} />
        </tbody>)}
      </table>
    </div>
    <button type="button" onClick={addRow} className="rounded border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">+ Agregar elemento adicional</button>
  </section>;
}
