import { mkdir, writeFile } from "node:fs/promises";
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

if (!sourceUrl) {
  console.error("Falta ONEDRIVE_MANUALS_URL o --url=<enlace de carpeta OneDrive/SharePoint>.");
  process.exit(1);
}

async function main() {
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

  const entries = files
    .filter((file) => !maxFiles || files.indexOf(file) < maxFiles)
    .map(normalizeFileEntry);

  const index = {
    generatedAt: new Date().toISOString(),
    source: "onedrive-sharepoint",
    rootName: manualsRoot.name || ROOT_FOLDER_NAME,
    totalFiles: entries.length,
    totalPdfFiles: entries.filter((item) => item.mimeType === "application/pdf").length,
    totalBytes: entries.reduce((sum, item) => sum + (Number(item.size) || 0), 0),
    entries,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`Índice generado: ${outputPath}`);
  console.log(`Archivos: ${index.totalFiles} | PDFs: ${index.totalPdfFiles} | Tamaño: ${formatBytes(index.totalBytes)}`);
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
    searchText: [file.name, file.path, folder, extension].filter(Boolean).join(" ").toLowerCase(),
    pages: [],
  };
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(2)} MB`;
  return `${value} B`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
