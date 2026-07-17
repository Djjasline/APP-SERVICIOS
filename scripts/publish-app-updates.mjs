import { execSync } from "node:child_process";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const eventPath = process.env.GITHUB_EVENT_PATH;
const repository = process.env.GITHUB_REPOSITORY || "";
const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";

if (!supabaseUrl || !serviceRoleKey) {
  console.log("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurado. No se publican boletines.");
  process.exit(0);
}

if (!eventPath) {
  console.log("GITHUB_EVENT_PATH no disponible. No se publican boletines.");
  process.exit(0);
}

const event = await readJson(eventPath);
const commits = Array.isArray(event.commits) && event.commits.length > 0 ? event.commits : [getCurrentCommit()].filter(Boolean);
const visibleCommits = commits.filter((commit) => {
  const message = String(commit.message || "");
  return !/\[(skip bulletin|skip update|no bulletin)\]/i.test(message);
});

if (visibleCommits.length === 0) {
  console.log("No hay commits para publicar como boletín.");
  process.exit(0);
}

const headSha = event.after || visibleCommits.at(-1)?.id || String(Date.now());
const title = buildTitle(visibleCommits);
const message = buildMessage(visibleCommits);
const createdAt = visibleCommits.at(-1)?.timestamp || new Date().toISOString();

const payload = [
  {
    update_key: `github-push-${headSha}`,
    title,
    message,
    active: true,
    created_at: createdAt,
    updated_at: new Date().toISOString(),
  },
];

const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/app_updates?on_conflict=update_key`;
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const text = await response.text();
  console.error(`Error publicando boletín (${response.status}): ${text}`);
  process.exit(1);
}

console.log(`Boletín publicado: ${title}`);

async function readJson(path) {
  const fs = await import("node:fs/promises");
  return JSON.parse(await fs.readFile(path, "utf8"));
}

function getCurrentCommit() {
  try {
    const raw = execSync("git log -1 --pretty=format:%H%x1f%s%x1f%cI", { encoding: "utf8" });
    const [id, message, timestamp] = raw.split("\x1f");
    return { id, message, timestamp };
  } catch (error) {
    console.warn("No se pudo leer el commit actual:", error.message);
    return null;
  }
}

function firstLine(message) {
  return String(message || "").split("\n")[0].trim();
}

const FRIENDLY_UPDATES = [
  {
    match: "remove public mobile contact",
    title: "Control de cambios: contacto público",
    message: "Se quitó el número celular del contacto visible y se dejó solo el teléfono principal de ASTAP.",
  },
  {
    match: "improve initial app paint",
    title: "Control de cambios: carga inicial",
    message: "Se mejoró la primera carga de la aplicación para mostrar contenido más rápido.",
  },
  {
    match: "improve app security and loading",
    title: "Control de cambios: seguridad y carga",
    message: "Se reforzó la privacidad de la app y se optimizó la carga de pantallas y archivos pesados.",
  },
  {
    match: "use user profiles in history filters",
    title: "Control de cambios: filtros de historial",
    message: "Los historiales ahora usan los usuarios registrados para filtrar por técnico o responsable.",
  },
  {
    match: "use technician selects in histories",
    title: "Control de cambios: filtros de técnicos",
    message: "Los historiales ahora muestran listas desplegables para seleccionar técnicos.",
  },
  {
    match: "rename repository vehicle sections",
    title: "Control de cambios: repositorios de vehículos",
    message: "Se actualizaron los nombres de las secciones técnicas y de entrenamiento de vehículos especiales.",
  },
  {
    match: "fix tool register light layout",
    title: "Control de cambios: registro de herramientas",
    message: "Se corrigió la presentación clara del registro de salida e ingreso de herramientas.",
  },
  {
    match: "align tool register light theme",
    title: "Control de cambios: registro de herramientas",
    message: "Se alineó el registro de herramientas con el estilo claro usado en Operaciones.",
  },
  {
    match: "organize admin options menu",
    title: "Control de cambios: menú administrativo",
    message: "Las opciones del administrador quedaron organizadas en un menú interno.",
  },
  {
    match: "add admin success dashboard",
    title: "Control de cambios: panel administrativo",
    message: "Se agregó un dashboard administrativo con métricas, filtros, gráficos y exportación CSV.",
  },
];

function friendlyCommit(commit) {
  const subject = firstLine(commit?.message).toLowerCase();
  return FRIENDLY_UPDATES.find((item) => subject.includes(item.match)) || null;
}

function buildTitle(commits) {
  if (commits.length === 1) {
    return friendlyCommit(commits[0])?.title || "Control de cambios: actualización publicada";
  }

  return `Control de cambios: ${commits.length} cambios publicados`;
}

function buildMessage(commits) {
  if (commits.length === 1) {
    return friendlyCommit(commits[0])?.message || "Se publicó una mejora en la aplicación.";
  }

  const lines = commits.map((commit) => `- ${friendlyCommit(commit)?.message || "Mejora publicada en la aplicación."}`);
  return `Se publicó una nueva versión de la app con estos cambios:\n${lines.join("\n")}`;
}
