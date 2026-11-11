import ObservationImageField from "@/components/ObservationImageField";
import AutoResizeInput from "@/components/AutoResizeInput";
import { inspectionDescription } from "@/app/vehiculos/inspeccion/inspectionCriteria.mjs";

export default function InspectionChecklistRow({
  codigo,
  descripcion,
  item,
  onItemChange,
  recordId,
  newCriteria = false,
  allowObservationRotation = false,
}) {
  const current = item || {};
  const groupName = `inspection-status-${recordId || "draft"}-${codigo}`;

  return (
    <tr className="hover:bg-gray-50">
      <td className="pdf-label text-xs">{codigo}</td>
      <td style={{ border: "1px solid #d1d5db", padding: "4px 8px", fontSize: 12 }}>
        {inspectionDescription(descripcion, newCriteria)}
      </td>
      {["SI", "NO", "NA"].map((opt) => (
        <td
          key={opt}
          className={`p-0 text-center ${current.estado === opt ? (newCriteria ? ({ SI: "bg-red-100", NO: "bg-green-100", NA: "" }[opt]) : "bg-blue-50") : ""}`}
          style={{ border: "1px solid #d1d5db", width: 40 }}
        >
          <label
            htmlFor={`${groupName}-${opt}`}
            className="flex min-h-[36px] w-full cursor-pointer items-center justify-center rounded transition hover:bg-blue-100 focus-within:outline focus-within:outline-2 focus-within:outline-blue-600 focus-within:outline-offset-[-2px]"
          >
            <input
              id={`${groupName}-${opt}`}
              type="radio"
              name={groupName}
              value={opt}
              checked={current.estado === opt}
              onChange={(event) => {
                if (event.target.checked) onItemChange(codigo, "estado", event.target.value);
              }}
              className={`h-5 w-5 cursor-pointer ${newCriteria ? ({ SI: "accent-red-700", NO: "accent-green-700", NA: "accent-gray-600" }[opt]) : "accent-blue-600"}`}
              aria-label={`Marcar ${opt === "NA" ? "N/A" : opt} para el ítem ${codigo}`}
            />
            <span className="sr-only">Marcar {opt === "NA" ? "N/A" : opt}</span>
          </label>
        </td>
      ))}
      <td style={{ border: "1px solid #d1d5db", padding: "4px 6px", verticalAlign: "top" }}>
        <AutoResizeInput
          value={current.observacion || ""}
          rows={2}
          onChange={(event) => onItemChange(codigo, "observacion", event.target.value)}
          placeholder="Hallazgo observable, condición encontrada, medición o evidencia. Evite frases vagas."
          className="observation-text-input block w-full border-0 outline-none text-xs leading-snug p-1 overflow-hidden resize-none min-h-[52px]"
        />
        <ObservationImageField
          value={current.imagenes || []}
          onChange={(imagenes) => onItemChange(codigo, "imagenes", imagenes)}
          recordId={recordId}
          folder={`observacion-${codigo}`}
          allowRotation={allowObservationRotation}
        />
      </td>
    </tr>
  );
}
