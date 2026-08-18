import { useDeferredValue, useEffect, useState } from "react";
import AutoResizeInput from "@/components/AutoResizeInput";
import { getClientReferenceCatalog } from "@/services/clientReferenceService";

const MIN_SEARCH_LENGTH = 3;

export default function ClientReferenceInput({ value, placeholder, className = "pdf-input w-full", onValueChange, onSelect }) {
  const [focused, setFocused] = useState(false);
  const [searchText, setSearchText] = useState(value || "");
  const deferredSearchText = useDeferredValue(searchText);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!focused) setSearchText(value || "");
  }, [focused, value]);

  useEffect(() => {
    const query = deferredSearchText.trim();
    if (!focused || query.length < MIN_SEARCH_LENGTH) {
      setMatches([]);
      setLoading(false);
      setError("");
      return;
    }

    let ignore = false;
    setLoading(true);
    setError("");

    const timeout = window.setTimeout(async () => {
      try {
        const rows = await getClientReferenceCatalog({ search: query, limit: 8 });
        if (!ignore) setMatches(rows);
      } catch (err) {
        if (!ignore) {
          setMatches([]);
          setError(err?.message || "No se pudo consultar clientes.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [deferredSearchText, focused]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setSearchText(nextValue);
    onValueChange?.(nextValue);
  };

  const handleSelect = (client) => {
    setFocused(false);
    setMatches([]);
    setSearchText(client.name || "");
    onSelect?.(client);
  };

  return (
    <div className="relative">
      <AutoResizeInput
        className={className}
        value={value}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true);
          setSearchText(value || "");
        }}
        onChange={handleChange}
      />
      {focused && (
        <ClientReferenceDropdown
          query={searchText}
          matches={matches}
          loading={loading}
          error={error}
          onSelect={handleSelect}
          onClose={() => setFocused(false)}
        />
      )}
    </div>
  );
}

function ClientReferenceDropdown({ query, matches, loading, error, onSelect, onClose }) {
  const normalizedQuery = query.trim();
  const showHint = normalizedQuery.length > 0 && normalizedQuery.length < MIN_SEARCH_LENGTH;
  const showEmpty = normalizedQuery.length >= MIN_SEARCH_LENGTH && !loading && !error && matches.length === 0;

  if (!showHint && !loading && !error && !showEmpty && matches.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white text-xs shadow-xl print:hidden">
      <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2 font-semibold text-slate-700">
        <span>Base de clientes</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">Cerrar</button>
      </div>

      {showHint && <p className="px-3 py-2 text-slate-500">Escribe al menos 3 caracteres para buscar cliente.</p>}
      {loading && <p className="px-3 py-2 text-slate-500">Buscando clientes...</p>}
      {error && <p className="px-3 py-2 text-red-600">{error}</p>}
      {showEmpty && <p className="px-3 py-2 text-slate-500">Sin coincidencias en clientes.</p>}

      {matches.map((client) => (
        <button
          key={client.id}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(client)}
          className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-blue-50"
        >
          <span className="block font-bold text-slate-900">{client.name}</span>
        </button>
      ))}
    </div>
  );
}
