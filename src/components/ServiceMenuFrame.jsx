import { useTheme } from "@/context/ThemeContext";

export default function ServiceMenuFrame({ children, className = "" }) {
  const { theme, isLight } = useTheme();
  const isGraphiteDark = theme === "dark";

  return (
    <div className="relative min-h-full overflow-hidden rounded-xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background-astap.png')",
          filter: isLight ? "brightness(1.05) saturate(0.85)" : isGraphiteDark ? "brightness(0.42) saturate(0.72)" : "brightness(0.62)",
        }}
        aria-hidden="true"
      />
      <div className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-white/70" : isGraphiteDark ? "bg-black/60" : "bg-black/50"}`} />
      <div className={`relative z-10 p-6 ${className}`}>{children}</div>
    </div>
  );
}
