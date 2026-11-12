import { formatHistoryDate } from "@/utils/recordHistoryDates.mjs";

export default function RecordHistoryDates({ record, className = "", updateLabel = "Última actualización registrada" }) {
  return (
    <div className={`space-y-0.5 text-xs text-slate-500 ${className}`}>
      <div>Creación: {formatHistoryDate(record?.created_at ?? record?.createdAt)}</div>
      <div title="Fecha de última actualización registrada; puede incluir cambios administrativos.">
        {updateLabel}: {formatHistoryDate(record?.updated_at ?? record?.updatedAt)}
      </div>
    </div>
  );
}
