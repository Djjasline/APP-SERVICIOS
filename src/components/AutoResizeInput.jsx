import { useLayoutEffect, useRef } from "react";
import { resizeTextarea } from "./resizeTextarea.mjs";

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
  const resize = () => resizeTextarea(ref.current, window.getComputedStyle);

  useLayoutEffect(() => {
    resize();
  }, [value, rows]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let width = element.clientWidth;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      if (element.clientWidth !== width) {
        width = element.clientWidth;
        resize();
      }
    });
    observer?.observe(element);
    window.addEventListener("resize", resize);
    document.fonts?.addEventListener("loadingdone", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.fonts?.removeEventListener("loadingdone", resize);
    };
  }, []);

  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      value={value ?? ""}
      className={`${className} auto-resize-input`}
      style={{ ...style, boxSizing: "border-box", display: "block" }}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      onChange={(event) => {
        onChange?.(event);
      }}
    />
  );
}
