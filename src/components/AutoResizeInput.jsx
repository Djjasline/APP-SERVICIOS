import { useLayoutEffect, useRef, useState } from "react";

export default function AutoResizeInput({
  className = "pdf-input w-full",
  value = "",
  rows = 1,
  onInput,
  onChange,
  style,
  ...props
}) {
  const ref = useRef(null);
  const [height, setHeight] = useState(null);

  const resize = () => {
    const element = ref.current;
    if (!element) return;
    const styles = window.getComputedStyle(element);
    const minHeight = parseFloat(styles.minHeight) || 0;
    const fontSize = parseFloat(styles.fontSize) || 12;
    const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.35;
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;
    const borderTop = parseFloat(styles.borderTopWidth) || 0;
    const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
    const availableWidth = Math.max(
      element.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0),
      1
    );
    const charsPerLine = Math.max(Math.floor(availableWidth / (fontSize * 0.78)), 8);
    const text = String(element.value || element.placeholder || "");
    const visualRows = text.split("\n").reduce((total, line) => {
      return total + Math.max(Math.ceil(line.length / charsPerLine), 1);
    }, 0);
    const estimatedHeight = (visualRows + 1) * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom + 6;

    element.style.height = "auto";
    const nextHeight = Math.ceil(Math.max(element.scrollHeight, estimatedHeight, minHeight));
    element.style.height = `${nextHeight}px`;
    setHeight((current) => (current === nextHeight ? current : nextHeight));
  };

  useLayoutEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      value={value ?? ""}
      className={`${className} auto-resize-input`}
      style={{ ...style, height: height ? `${height}px` : style?.height, boxSizing: "border-box", display: "block" }}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      onChange={(event) => {
        onChange?.(event);
        requestAnimationFrame(resize);
      }}
    />
  );
}
