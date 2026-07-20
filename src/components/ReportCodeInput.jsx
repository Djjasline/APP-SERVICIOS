import { useEffect, useState } from "react";
import { getSuggestedReportCode } from "@/services/reportCodeService";
import AutoResizeInput from "@/components/AutoResizeInput";

export default function ReportCodeInput({
  value,
  onChange,
  placeholder,
  className = "pdf-input w-full",
  disabled = false,
}) {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const inputCode = value || "";
    setSuggestion("");
    setError("");

    if (!inputCode.trim() || disabled) return undefined;

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const nextCode = await getSuggestedReportCode(inputCode);
        setSuggestion(nextCode && nextCode !== inputCode ? nextCode : "");
      } catch (err) {
        console.error("Error sugiriendo codigo de informe:", err);
        setError("No se pudo consultar la secuencia.");
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [value, disabled]);

  return (
    <div className="space-y-1">
      <AutoResizeInput
        className={className}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={() => {
          if (suggestion) onChange(suggestion);
        }}
        onChange={(event) => onChange(event.target.value)}
      />

      {(loading || suggestion || error) && (
        <div className="no-print text-[11px] leading-tight text-gray-600 dark:text-gray-300">
          {loading && <span>Consultando secuencia...</span>}
          {!loading && suggestion && (
            <button
              type="button"
              className="text-blue-700 underline dark:text-blue-300"
              onClick={() => onChange(suggestion)}
            >
              Codigo permitido por secuencia: {suggestion}. Usar este codigo
            </button>
          )}
          {!loading && error && <span className="text-red-600">{error}</span>}
        </div>
      )}
    </div>
  );
}
