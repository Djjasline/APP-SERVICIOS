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

function buildTitle(commits) {
  if (commits.length === 1) return `Actualización: ${firstLine(commits[0].message)}`;
  return `Actualización de la app: ${commits.length} cambios publicados`;
}

function buildMessage(commits) {
  const lines = commits.map((commit) => {
    const subject = firstLine(commit.message) || "Cambio publicado";
    const shortSha = String(commit.id || "").slice(0, 7);
    const commitUrl = repository && commit.id ? `${serverUrl}/${repository}/commit/${commit.id}` : commit.url;
    return `- ${subject}${shortSha ? ` (${shortSha})` : ""}${commitUrl ? `\n  ${commitUrl}` : ""}`;
  });

  return `Se publicó una nueva versión de la app con estos cambios:\n${lines.join("\n")}`;
}
