export function resizeTextarea(element, getStyle) {
  if (!element || !element.clientWidth) return;
  const styles = getStyle(element);
  const borders = (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
  element.style.height = "auto";
  element.style.height = `${Math.ceil(element.scrollHeight + borders)}px`;
}
