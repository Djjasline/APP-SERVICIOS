import { useRef, useEffect } from "react";

export default function AutoResizeTextarea({ value, onChange, className = "" }) {
  const ref = useRef(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      className={`w-full resize-none overflow-hidden ${className}`}
      onInput={resize}
    />
  );
}
