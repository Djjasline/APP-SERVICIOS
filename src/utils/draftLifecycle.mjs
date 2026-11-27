export function pendingDraftForFlush(pending, key, clearVersion) {
  return pending?.key === key && pending.version === clearVersion ? pending.datos : undefined;
}

// Only new forms need a deliberate edit before their first autosave.
export function createDraftStartGate({ requireInteraction, actionWindowMs = 5000 } = {}) {
  let started = !requireInteraction;
  let action = null;
  const serialize = (value) => {
    try { return JSON.stringify(value); } catch { return null; }
  };
  return {
    input() {
      started = true;
      action = null;
    },
    action(value, now = Date.now()) {
      if (!started) action = { value: serialize(value), at: now };
    },
    canSave(value, now = Date.now()) {
      if (started) return true;
      if (!action || now - action.at > actionWindowMs) {
        action = null;
        return false;
      }
      const current = serialize(value);
      if (current !== null && action.value !== null && current !== action.value) {
        started = true;
        action = null;
      }
      return started;
    },
  };
}

export function isDraftStartingInput(target) {
  if (!target || target.disabled || target.readOnly) return false;
  const tag = String(target.tagName || "").toLowerCase();
  if (tag === "select") return true;
  if (tag === "textarea" || (tag === "input" && !["button", "submit", "reset", "hidden"].includes(String(target.type || "").toLowerCase()))) {
    const type = String(target.type || "").toLowerCase();
    if (["checkbox", "radio"].includes(type)) return true;
    if (type === "file") return Boolean(target.files?.length);
    return String(target.value ?? "").trim().length > 0;
  }
  return Boolean(target.isContentEditable && String(target.textContent || "").trim());
}
