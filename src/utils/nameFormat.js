function capitalizeWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/(^|[-'’])([a-záéíóúñü])/g, (_, separator, letter) => `${separator}${letter.toUpperCase()}`);
}

export function formatPersonName(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  if (!clean) return "";
  if (clean.includes("@")) return clean.toLowerCase();

  return clean.split(" ").map(capitalizeWord).join(" ");
}

export function formatUserDisplayName(user, fallback = "Usuario") {
  const name = formatPersonName(user?.full_name || user?.name || user?.nombre);
  if (name) return name;
  return user?.email || user?.id || fallback;
}
