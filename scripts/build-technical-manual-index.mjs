import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const DEFAULT_OUTPUT = "public/data/technical-manual-index.json";
const ROOT_FOLDER_NAME = "MANUALES TECNICOS";
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
};

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, "").split("=");
    return [key, value.join("=") || "true"];
  })
);

const sourceUrl = args.get("url") || process.env.ONEDRIVE_MANUALS_URL;
const outputPath = args.get("out") || DEFAULT_OUTPUT;
const maxFiles = Number(args.get("max-files") || 0);
const extractText = args.has("extract-text") || args.get("extract-text") === "true";
const maxPdfTextFiles = Number(args.get("max-pdf-text-files") || 0);
const maxPdfBytes = Number(args.get("max-pdf-mb") || 0) * 1024 * 1024;
const stopAfterQuery = normalizeSearch(args.get("stop-after-query") || "");
const pathContains = normalizeSearch(args.get("path-contains") || "");
const extractOcr = args.has("ocr") || args.get("ocr") === "true";
const ocrLang = args.get("ocr-lang") || "eng";
const ocrMode = args.get("ocr-mode") || (stopAfterQuery ? "query" : "auto");
const ocrMinTextChars = Number(args.get("ocr-min-text-chars") || 40);
const ocrScale = Number(args.get("ocr-scale") || 2);
const maxOcrPages = Number(args.get("max-ocr-pages") || 0);
const maxOcrPixels = Number(args.get("ocr-max-pixels") || 4_000_000);
const ocrCachePath = args.get("ocr-cache-path") || process.env.TESSERACT_CACHE_PATH || path.join(os.tmpdir(), "app-servicios-tesseract-cache");
const checkpointPath = args.get("checkpoint") || (args.has("resume") ? "tmp/technical-manual-index.checkpoint.jsonl" : "");
const resumeCheckpoint = args.has("resume") || args.get("resume") === "true";
const publishCheckpoint = args.has("publish-checkpoint") || args.get("publish-checkpoint") === "true";
const stopAfterOcrLimit = args.has("stop-after-ocr-limit") || args.get("stop-after-ocr-limit") === "true";
let pdfjsPromise = null;
let canvasPromise = null;
let ocrWorkerPromise = null;
let extractedOcrPages = 0;

if (!sourceUrl && !publishCheckpoint) {
  console.error("Falta ONEDRIVE_MANUALS_URL o --url=<enlace de carpeta OneDrive/SharePoint>.");
  process.exit(1);
}

async function main() {
  if (publishCheckpoint) {
    await publishCheckpointIndex();
    return;
  }

  let session = await openSharedFolder(sourceUrl, { browserHeaders: true });
  let driveId = extractDriveId(session.html);

  if (!driveId) {
    session = await openSharedFolder(sourceUrl, { browserHeaders: false });
    driveId = extractDriveId(session.html);
  }

  driveId = driveId || args.get("drive-id") || process.env.ONEDRIVE_DRIVE_ID;
  if (!driveId) throw new Error("No se pudo detectar el drive de SharePoint. Vuelve a ejecutar con --drive-id=<id> si el enlace redirige a login.");

  const rootChildren = await getChildren(session, driveId, "root");
  const manualsRoot = findManualsRoot(rootChildren) || rootChildren[0];
  if (!manualsRoot?.id) throw new Error("No se encontró la carpeta de manuales técnicos.");

  const files = [];
  await walkFolder({
    session,
    driveId,
    folderId: manualsRoot.id,
    folderPath: manualsRoot.name || ROOT_FOLDER_NAME,
    files,
  });

  const selectedFiles = files
    .filter((file) => !pathContains || normalizeSearch(file.path).includes(pathContains))
    .slice(0, maxFiles || undefined)
  const entries = checkpointPath && resumeCheckpoint ? await loadCheckpointEntries(checkpointPath) : [];
  const completedKeys = new Set(entries.map(entryKey));
  extractedOcrPages = countOcrPages(entries);
  let extractedPdfFiles = entries.filter(isPdfEntry).length;
  let foundStopAfterQuery = false;

  if (checkpointPath && !resumeCheckpoint) {
    await mkdir(path.dirname(checkpointPath), { recursive: true });
    await writeFile(checkpointPath, "", "utf8");
  }

  for (const file of selectedFiles) {
    if (stopAfterOcrLimit && maxOcrPages && extractedOcrPages >= maxOcrPages) {
      console.log(`Límite OCR alcanzado: ${extractedOcrPages} páginas. Reanuda con --resume y un límite mayor.`);
      break;
    }

    const entry = normalizeFileEntry(file);
    const key = entryKey(entry);

    if (completedKeys.has(key)) continue;

    if (extractText && isPdfEntry(entry) && shouldExtractPdf(entry, extractedPdfFiles)) {
      extractedPdfFiles += 1;
      try {
        entry.pages = await extractPdfPages({ session, driveId, file, query: stopAfterQuery });
        entry.extractedText = entry.pages.length > 0;
        entry.ocrText = entry.pages.some((page) => page.ocr);
        entry.searchText = buildEntrySearchText(entry);
        if (stopAfterQuery && entry.pages.some((page) => pageSearchText(page).includes(stopAfterQuery))) {
          foundStopAfterQuery = true;
        }
        console.log(`Texto PDF${entry.ocrText ? "/OCR" : ""}: ${entry.name} | páginas con referencias: ${entry.pages.length}`);
      } catch (error) {
        entry.extractionError = error.message;
        console.warn(`No se pudo extraer texto de PDF: ${entry.path} (${error.message})`);
      }
    }

    entries.push(entry);
    completedKeys.add(key);
    if (checkpointPath) await appendCheckpointEntry(checkpointPath, entry);

    if (foundStopAfterQuery) {
      console.log(`Consulta encontrada: ${args.get("stop-after-query")}`);
      if (args.has("stop-after-query")) break;
    }
  }

  await writeIndex(entries, manualsRoot.name || ROOT_FOLDER_NAME);
}

async function writeIndex(entries, rootName) {
  const index = {
    generatedAt: new Date().toISOString(),
    source: "onedrive-sharepoint",
    rootName,
    totalFiles: entries.length,
    totalPdfFiles: entries.filter((item) => item.mimeType === "application/pdf").length,
    totalPdfTextFiles: entries.filter((item) => item.extractedText).length,
    totalPdfOcrFiles: entries.filter((item) => item.ocrText).length,
    totalBytes: entries.reduce((sum, item) => sum + (Number(item.size) || 0), 0),
    entries,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`Índice generado: ${outputPath}`);
  console.log(`Archivos: ${index.totalFiles} | PDFs: ${index.totalPdfFiles} | PDFs con texto: ${index.totalPdfTextFiles} | PDFs con OCR: ${index.totalPdfOcrFiles} | Tamaño: ${formatBytes(index.totalBytes)}`);
}

async function publishCheckpointIndex() {
  if (!checkpointPath) throw new Error("Falta --checkpoint=<archivo jsonl> para publicar avance.");

  const currentIndex = JSON.parse(await readFile(outputPath, "utf8"));
  const checkpointEntries = await loadCheckpointEntries(checkpointPath);
  const checkpointByKey = new Map(checkpointEntries.map((entry) => [entryKey(entry), entry]));
  const mergedEntries = (currentIndex.entries || []).map((entry) => checkpointByKey.get(entryKey(entry)) || entry);
  const existingKeys = new Set(mergedEntries.map(entryKey));

  for (const entry of checkpointEntries) {
    if (!existingKeys.has(entryKey(entry))) mergedEntries.push(entry);
  }

  await writeIndex(mergedEntries, currentIndex.rootName || ROOT_FOLDER_NAME);
}

async function loadCheckpointEntries(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    const entriesByKey = new Map();

    for (const line of content.split("\n")) {
      const value = line.trim();
      if (!value) continue;
      const record = JSON.parse(value);
      const entry = record.entry || record;
      entriesByKey.set(entryKey(entry), entry);
    }

    const entries = [...entriesByKey.values()];
    console.log(`Checkpoint cargado: ${entries.length} archivos procesados`);
    return entries;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return [];
  }
}

async function appendCheckpointEntry(filePath, entry) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify({ key: entryKey(entry), entry })}\n`, "utf8");
}

function entryKey(entry) {
  return `${entry.id || ""}|${entry.path || ""}`;
}

function countOcrPages(entries) {
  return entries.reduce((total, entry) => total + (entry.pages || []).filter((page) => page.ocr).length, 0);
}

async function openSharedFolder(url, { browserHeaders = true } = {}) {
  const cookies = new Map();
  let currentUrl = url;
  let response;

  for (let redirects = 0; redirects < 8; redirects += 1) {
    response = await fetch(currentUrl, {
      redirect: "manual",
      headers: {
        ...(browserHeaders ? BROWSER_HEADERS : {}),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(cookieHeader(cookies) ? { Cookie: cookieHeader(cookies) } : {}),
      },
    });

    collectCookies(response.headers, cookies);

    if (![301, 302, 303, 307, 308].includes(response.status)) break;

    const location = response.headers.get("location");
    if (!location) break;
    currentUrl = new URL(location, currentUrl).toString();
  }

  if (!response?.ok) throw new Error(`No se pudo abrir OneDrive (${response?.status || "sin respuesta"}).`);

  return {
    html: await response.text(),
    cookies,
    finalUrl: currentUrl,
  };
}

function collectCookies(headers, cookies) {
  const values = typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : splitSetCookie(headers.get("set-cookie"));

  values.forEach((cookie) => {
    const [pair] = String(cookie).split(";");
    const separator = pair.indexOf("=");
    if (separator <= 0) return;
    cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
  });
}

function splitSetCookie(value) {
  if (!value) return [];
  return String(value).split(/,(?=\s*[^;,]+=)/g);
}

function cookieHeader(cookies) {
  return [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

function extractDriveId(html) {
  const match = String(html).match(/https:\/\/[^"'<>\\ ]+\/_api\/v2\.0\/drives\/([^"'<>\\/? ]+)/i);
  return match?.[1] || null;
}

function findManualsRoot(children) {
  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return children.find((item) => normalize(item.name) === ROOT_FOLDER_NAME) || children.find((item) => normalize(item.name).includes("MANUALES"));
}

async function getChildren(session, driveId, itemId) {
  const encodedDriveId = encodeURIComponent(driveId);
  const encodedItemId = itemId === "root" ? "root" : `items/${encodeURIComponent(itemId)}`;
  const url = `https://astap1-my.sharepoint.com/_api/v2.0/drives/${encodedDriveId}/${encodedItemId}/children`;
  const items = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await fetchWithRetry(nextUrl, {
      headers: {
        ...BROWSER_HEADERS,
        Accept: "application/json",
        Cookie: cookieHeader(session.cookies),
        Referer: session.finalUrl,
      },
    });

    collectCookies(response.headers, session.cookies);

    if (!response.ok) throw new Error(`No se pudo listar carpeta (${response.status}) ${nextUrl}`);

    const payload = await response.json();
    items.push(...(payload.value || []));
    nextUrl = payload["@odata.nextLink"] || null;
  }

  return items;
}

async function fetchWithRetry(url, options, attempts = 3) {
  let lastResponse = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastResponse = await fetch(url, options);
    if (![429, 500, 502, 503, 504].includes(lastResponse.status)) return lastResponse;
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }

  return lastResponse;
}

async function walkFolder({ session, driveId, folderId, folderPath, files }) {
  if (maxFiles && files.length >= maxFiles) return;

  let children = [];
  try {
    children = await getChildren(session, driveId, folderId);
  } catch (error) {
    console.warn(`No se pudo leer carpeta, se omite: ${folderPath} (${error.message})`);
    return;
  }

  for (const item of children) {
    if (maxFiles && files.length >= maxFiles) return;

    const itemPath = `${folderPath}/${item.name}`;

    if (item.folder) {
      await walkFolder({ session, driveId, folderId: item.id, folderPath: itemPath, files });
      continue;
    }

    if (item.file) {
      files.push({ ...item, path: itemPath });
      if (maxFiles && files.length >= maxFiles) return;
    }
  }
}

function normalizeFileEntry(file) {
  const extension = path.extname(file.name || "").replace(/^\./, "").toLowerCase();
  const folder = String(file.path || "").split("/").slice(0, -1).join("/");

  return {
    id: file.id,
    name: file.name,
    path: file.path,
    folder,
    extension,
    mimeType: file.file?.mimeType || "",
    size: file.size || 0,
    webUrl: file.webUrl || "",
    lastModifiedDateTime: file.lastModifiedDateTime || null,
    searchText: normalizeSearch([file.name, file.path, folder, extension].filter(Boolean).join(" ")),
    pages: [],
  };
}

function isPdfEntry(entry) {
  return entry.mimeType === "application/pdf" || entry.extension === "pdf";
}

function shouldExtractPdf(entry, extractedPdfFiles) {
  if (maxPdfTextFiles && extractedPdfFiles >= maxPdfTextFiles) return false;
  if (maxPdfBytes && Number(entry.size || 0) > maxPdfBytes) return false;
  return true;
}

async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsPromise;
}

async function getCanvas() {
  if (!canvasPromise) {
    canvasPromise = import("@napi-rs/canvas");
  }
  return canvasPromise;
}

async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const tesseractModule = await import("tesseract.js");
      const tesseract = tesseractModule.default || tesseractModule;
      const workerOptions = {
        cachePath: ocrCachePath,
        ...(args.has("ocr-progress") ? { logger: (message) => console.log(`OCR ${message.status}: ${Math.round((message.progress || 0) * 100)}%`) } : {}),
      };
      const worker = await tesseract.createWorker(ocrLang, undefined, workerOptions);
      await worker.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: tesseract.PSM?.SPARSE_TEXT || "11",
        user_defined_dpi: String(Math.round(72 * Math.max(1, ocrScale))),
      });
      return worker;
    })();
  }

  return ocrWorkerPromise;
}

async function cleanupOcrWorker() {
  if (!ocrWorkerPromise) return;
  const worker = await ocrWorkerPromise;
  await worker.terminate();
}

async function downloadFileBytes(session, driveId, fileId) {
  const encodedDriveId = encodeURIComponent(driveId);
  const url = `https://astap1-my.sharepoint.com/_api/v2.0/drives/${encodedDriveId}/items/${encodeURIComponent(fileId)}/content`;
  const response = await fetchWithRetry(url, {
    redirect: "follow",
    headers: {
      ...BROWSER_HEADERS,
      Accept: "application/pdf,*/*;q=0.8",
      Cookie: cookieHeader(session.cookies),
      Referer: session.finalUrl,
    },
  });

  collectCookies(response.headers, session.cookies);
  if (!response.ok) throw new Error(`descarga ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function extractPdfPages({ session, driveId, file, query }) {
  const pdfjs = await getPdfjs();
  const bytes = await downloadFileBytes(session, driveId, file.id);
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    disableFontFace: true,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent({ disableCombineTextItems: false });
      const text = content.items.map((item) => item.str).filter(Boolean).join(" ");
      let fullText = text;
      let usedOcr = false;
      let normalizedText = normalizeSearch(fullText);

      if (shouldOcrPage({ text: fullText, normalizedText, query })) {
        try {
          const ocrText = await extractPageOcrText(page);
          if (ocrText) {
            extractedOcrPages += 1;
            usedOcr = true;
            fullText = [fullText, ocrText].filter(Boolean).join(" ");
            normalizedText = normalizeSearch(fullText);
          }
        } catch (error) {
          console.warn(`OCR omitido: ${file.path} página ${pageNumber} (${error.message})`);
        }
      }

      const partNumbers = extractPartNumbers(fullText);
      const matchesQuery = query && normalizedText.includes(query);

      if (partNumbers.length > 0 || matchesQuery) {
        pages.push({
          page: pageNumber,
          text: buildPageSnippet(fullText, partNumbers, query),
          partNumbers,
          ...(usedOcr ? { ocr: true } : {}),
        });
      }
    }
  } finally {
    await document.destroy?.();
    await loadingTask.destroy?.();
  }

  return pages;
}

function shouldOcrPage({ text, normalizedText, query }) {
  if (!extractOcr) return false;
  if (maxOcrPages && extractedOcrPages >= maxOcrPages) return false;
  if (ocrMode === "all") return true;
  if (ocrMode === "query" && query) return !normalizedText.includes(query);
  return String(text || "").replace(/\s+/g, "").length < ocrMinTextChars;
}

async function extractPageOcrText(page) {
  const worker = await getOcrWorker();
  const image = await renderPageToPng(page);
  const result = await worker.recognize(image, {}, { text: true, blocks: false, hocr: false, tsv: false });
  return String(result?.data?.text || "").replace(/\s+/g, " ").trim();
}

async function renderPageToPng(page) {
  const { createCanvas } = await getCanvas();
  const baseViewport = page.getViewport({ scale: Math.max(1, ocrScale) });
  const pixels = baseViewport.width * baseViewport.height;
  const safeScale = maxOcrPixels && pixels > maxOcrPixels
    ? Math.max(1, Math.max(1, ocrScale) * Math.sqrt(maxOcrPixels / pixels))
    : Math.max(1, ocrScale);
  const viewport = page.getViewport({ scale: safeScale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const canvasContext = canvas.getContext("2d");

  await page.render({ canvasContext, viewport }).promise;
  return canvas.toBuffer("image/png");
}

function extractPartNumbers(text) {
  const normalized = String(text || "")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ");
  const matches = normalized.match(/\b[A-Z]{0,6}\d{2,}[A-Z0-9]*(?:[-./][A-Z0-9]{1,})+\b|\b[A-Z]{1,8}-?\d{3,}[A-Z0-9]*(?:[-./][A-Z0-9]{1,})*\b|\b\d{5,}\b/gi) || [];
  const ignored = new Set(["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]);

  return [...new Set(matches.map((match) => match.toUpperCase()).filter((match) => !ignored.has(match) && !isDateLike(match)))].slice(0, 120);
}

function isDateLike(value) {
  return /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(String(value || ""));
}

function buildPageSnippet(text, partNumbers, query) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  const needles = [...partNumbers.slice(0, 5), query].filter(Boolean);
  const snippets = [];

  for (const needle of needles) {
    const normalizedNeedle = normalizeSearch(needle);
    const normalizedValue = normalizeSearch(value);
    const index = normalizedValue.indexOf(normalizedNeedle);
    if (index < 0) continue;

    const start = Math.max(0, index - 90);
    const end = Math.min(value.length, index + String(needle).length + 140);
    snippets.push(value.slice(start, end).trim());
  }

  return [...new Set(snippets)].join(" ... ").slice(0, 600) || value.slice(0, 360);
}

function pageSearchText(page) {
  return normalizeSearch([page.text, ...(page.partNumbers || [])].filter(Boolean).join(" "));
}

function buildEntrySearchText(entry) {
  return normalizeSearch([
    entry.name,
    entry.path,
    entry.folder,
    entry.extension,
    ...(entry.pages || []).flatMap((page) => page.partNumbers || []),
  ].filter(Boolean).join(" "));
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—−]/g, "-")
    .toLowerCase();
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(2)} MB`;
  return `${value} B`;
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await cleanupOcrWorker();
}
