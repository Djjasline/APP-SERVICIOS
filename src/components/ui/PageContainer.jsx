import { useTheme } from "@/context/ThemeContext";

export default function PageContainer({ title, button, children }) {
  const { isLight } = useTheme();

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
          {title}
        </h2>

        {button && button}
      </div>

      {/* CONTENIDO */}
      <div className={`backdrop-blur rounded-xl p-6 border ${isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"}`}>
        {children}
      </div>

    </div>
  );
}
