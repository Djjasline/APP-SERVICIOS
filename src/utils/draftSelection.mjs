export function toDraftPayload(datos, guardadoEn = new Date().toISOString()) {
  return { datos, guardadoEn };
}

export function getDraftTime(draft) {
  const time = draft?.guardadoEn ? new Date(draft.guardadoEn).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function pickNewestDraft(localDraft, remoteDraft) {
  if (!localDraft) return remoteDraft;
  if (!remoteDraft) return localDraft;
  return getDraftTime(remoteDraft) > getDraftTime(localDraft) ? remoteDraft : localDraft;
}
