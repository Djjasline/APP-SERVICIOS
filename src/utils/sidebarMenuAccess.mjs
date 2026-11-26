const LIMITED_SIDEBAR_EMAILS = new Set(["kestevez@astap.com"]);

export function hasLimitedSidebar(email) {
  return LIMITED_SIDEBAR_EMAILS.has(String(email || "").trim().toLowerCase());
}
