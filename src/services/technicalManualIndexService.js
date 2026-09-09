const DEFAULT_INDEX_URL = "/data/technical-manual-index.json";

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function termsFromQuery(query) {
  return normalize(query)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function pageText(page) {
  return [page.page, page.text, page.context, page.system, page.partNumber].filter(Boolean).join(" ");
}

function scoreEntry(entry, terms) {
  const base = normalize([entry.name, entry.path, entry.folder, entry.searchText].filter(Boolean).join(" "));
  const pageMatches = (entry.pages || []).filter((page) => {
    const haystack = normalize(pageText(page));
    return terms.every((term) => haystack.includes(term));
  });

  const baseScore = terms.reduce((score, term) => score + (base.includes(term) ? 1 : 0), 0);
  const exactNameScore = terms.some((term) => normalize(entry.name).includes(term)) ? 2 : 0;

  return {
    score: baseScore + exactNameScore + pageMatches.length * 3,
    pageMatches,
  };
}

export async function loadTechnicalManualIndex() {
  const url = import.meta.env.VITE_TECH_MANUAL_INDEX_URL || DEFAULT_INDEX_URL;

  try {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) {
      return {
        available: false,
        reason: response.status === 404 ? "missing" : "error",
        entries: [],
        totalFiles: 0,
        totalPdfFiles: 0,
        generatedAt: null,
      };
    }

    const payload = await response.json();
    return {
      available: true,
      ...payload,
      entries: Array.isArray(payload.entries) ? payload.entries : [],
    };
  } catch (error) {
    console.error("Error cargando índice técnico:", error);
    return {
      available: false,
      reason: "error",
      entries: [],
      totalFiles: 0,
      totalPdfFiles: 0,
      generatedAt: null,
    };
  }
}

export function searchTechnicalManualIndex(index, query, { limit = 50 } = {}) {
  const terms = termsFromQuery(query);
  if (!index?.available || terms.length === 0) return [];

  return (index.entries || [])
    .map((entry) => ({ entry, ...scoreEntry(entry, terms) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || String(a.entry.name).localeCompare(String(b.entry.name)))
    .slice(0, limit);
}

export function formatManualFileSize(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(2)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}
