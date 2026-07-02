export async function setAppBadgeCount(count) {
  if (typeof navigator === "undefined" || !("setAppBadge" in navigator)) return;

  try {
    const value = Number(count) || 0;

    if (value > 0) {
      await navigator.setAppBadge(value);
    } else if ("clearAppBadge" in navigator) {
      await navigator.clearAppBadge();
    }
  } catch (error) {
    console.warn("No se pudo actualizar el indicador de la app:", error);
  }
}

export async function clearAppBadge() {
  if (typeof navigator === "undefined" || !("clearAppBadge" in navigator)) return;

  try {
    await navigator.clearAppBadge();
  } catch (error) {
    console.warn("No se pudo limpiar el indicador de la app:", error);
  }
}
