const DEFAULT_INDEX_URL = "/data/technical-manual-index.json";
const INDEX_FILE = "technical-manual-index.json";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildIndexUrls() {
  const configuredUrl = import.meta.env.VITE_TECH_MANUAL_INDEX_URL;
  const baseUrl = import.meta.env.BASE_URL || "/";
  const relativeBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return unique([
    configuredUrl,
    `${relativeBaseUrl}data/${INDEX_FILE}`,
    DEFAULT_INDEX_URL,
    `data/${INDEX_FILE}`,
  ]);
}

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
  return [page.page, page.text, page.context, page.system, page.partNumber, ...(page.partNumbers || [])].filter(Boolean).join(" ");
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
  const urls = buildIndexUrls();
  const cacheBuster = Date.now().toString(36);
  const attempts = [];

  for (const url of urls) {
    try {
      const requestUrl = new URL(url, window.location.href);
      requestUrl.searchParams.set("v", cacheBuster);
      const response = await fetch(requestUrl.toString(), { cache: "reload" });
      attempts.push({ url, status: response.status });

      if (!response.ok) continue;

      const payload = await response.json();
      const entries = Array.isArray(payload.entries) ? payload.entries : [];
      return {
        available: entries.length > 0,
        reason: entries.length > 0 ? null : "empty",
        loadedFrom: url,
        attempts,
        ...payload,
        entries,
      };
    } catch (error) {
      attempts.push({ url, status: "error" });
      console.error("Error cargando índice técnico:", error);
    }
  }

  return {
    available: false,
    reason: attempts.some((attempt) => attempt.status === 404) ? "missing" : "error",
    attempts,
    entries: [],
    totalFiles: 0,
    totalPdfFiles: 0,
    generatedAt: null,
  };
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

export function getMatchingPartNumbers(page, query) {
  const terms = termsFromQuery(query);
  if (terms.length === 0) return [];

  return (page?.partNumbers || []).filter((partNumber) => {
    const value = normalize(partNumber);
    return terms.some((term) => value.includes(term));
  });
}

export function formatManualFileSize(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(2)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}
