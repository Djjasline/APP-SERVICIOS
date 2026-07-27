import ObservationImageField from "@/components/ObservationImageField";
import AutoResizeInput from "@/components/AutoResizeInput";

export default function InspectionChecklistRow({
  codigo,
  descripcion,
  item,
  onItemChange,
  recordId,
}) {
  const current = item || {};

  return (
    <tr className="hover:bg-gray-50">
      <td className="pdf-label text-xs">{codigo}</td>
      <td style={{ border: "1px solid #d1d5db", padding: "4px 8px", fontSize: 12 }}>
        {descripcion}
      </td>
      {["SI", "NO", "NA"].map((opt) => (
        <td key={opt} className="text-center" style={{ border: "1px solid #d1d5db", padding: "4px", width: 40 }}>
          <input
            type="radio"
            name={`chk-${codigo}`}
            checked={current.estado === opt}
            onChange={() => onItemChange(codigo, "estado", opt)}
          />
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
        />
      </td>
    </tr>
  );
}
