export function pendingDraftForFlush(pending, key, clearVersion) {
  return pending?.key === key && pending.version === clearVersion ? pending.datos : undefined;
}
