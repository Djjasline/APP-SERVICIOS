import { useLayoutEffect, useRef } from "react";

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

  const resize = () => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      value={value ?? ""}
      className={`${className} auto-resize-input`}
      style={style}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      onChange={onChange}
    />
  );
}
