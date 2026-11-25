import { formatServiceDate, isServiceDateRangeValid } from "@/utils/serviceDateRange.mjs";

export default function ServiceDateRange({ start, end, onChange, disabled = false }) {
  const valid = isServiceDateRangeValid(start, end);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0 text-xs">
          <span>Inicial</span>
          <input
            type="date"
            className="pdf-input w-full"
            value={start || ""}
            max={end || undefined}
            disabled={disabled}
            onChange={(event) => onChange(["fechaServicio"], event.target.value)}
          />
        </label>
        <label className="min-w-0 text-xs">
          <span>Final</span>
          <input
            type="date"
            className="pdf-input w-full"
            value={end || ""}
            min={start || undefined}
            disabled={disabled}
            aria-invalid={!valid}
            onChange={(event) => onChange(["fechaServicioFinal"], event.target.value)}
          />
        </label>
      </div>
      {!valid && <p role="alert" className="text-xs text-red-700">La fecha final no puede ser anterior a la inicial.</p>}
    </div>
  );
}

export function ServiceDateRangeDisplay({ start, end }) {
  return (
    <span style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <span style={{ flex: "1 1 120px" }}>Inicial: {formatServiceDate(start) || "—"}</span>
      <span style={{ flex: "1 1 120px" }}>Final: {formatServiceDate(end) || "—"}</span>
    </span>
  );
}
