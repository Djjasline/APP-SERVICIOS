export default function PageContainer({ title, button, children }) {
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-semibold">
          {title}
        </h2>

        {button && button}
      </div>

      {/* CONTENIDO */}
      <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
        {children}
      </div>

    </div>
  );
}
