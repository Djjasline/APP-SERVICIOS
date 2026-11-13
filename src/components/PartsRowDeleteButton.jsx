import { Trash2 } from "lucide-react";

export default function PartsRowDeleteButton({ label, onClick }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="inline-flex items-center justify-center rounded p-2 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 print:hidden">
    <Trash2 size={16} aria-hidden="true" />
  </button>;
}
