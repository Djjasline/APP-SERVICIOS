export function showReferenceDropdown({ showHint, loading, error, matches }) {
  return Boolean(showHint || loading || error || matches.length);
}

export function isReferenceInteraction(target, descriptionElement, partNumberElement) {
  return Boolean(descriptionElement?.contains(target) || partNumberElement?.contains(target));
}
