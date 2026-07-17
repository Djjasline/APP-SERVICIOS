export const CONFIGURADOR_OWNER_EMAIL = "smaviles@astap.com";

export function isConfiguratorOwner(email) {
  return String(email || "").trim().toLowerCase() === CONFIGURADOR_OWNER_EMAIL;
}
