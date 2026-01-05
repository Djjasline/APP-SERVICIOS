import astapLogo from "@/assets/astap-logo.png";

export default function ReportHeader({ data }) {
  return (
    <div className="border-2 border-black text-xs">
      {/* FILA SUPERIOR */}
      <div className="grid grid-cols-[120px_1fr_220px] border-b border-black">
        {/* LOGO */}
        <div className="flex items-center justify-center border-r border-black p-2">
          <img
            src={astapLogo}
            alt="ASTAP"
            className="max-h-16"
          />
        </div>

        {/* TÍTULO */}
        <div className="flex items-center justify-center font-bold text-sm">
          INFORME TÉCNICO
        </div>

        {/* VERSIONES */}
        <div className="border-l border-black">
          <div className="border-b border-black p-1">
            <strong>Fecha de versión:</strong>{" "}
            {data?.fechaVersion || "26-11-25"}
          </div>
          <div className="p-1">
            <strong>Versión:</strong> {data?.version || "01"}
          </div>
        </div>
      </div>

      {/* REFERENCIA */}
      <div className="grid grid-cols-[200px_1fr] border-b border-black">
        <div className="border-r border-black p-1 font-semibold">
          REFERENCIA DE CONTRATO:
        </div>
        <div className="p-1">
          <input
            className="w-full outline-none"
            spellCheck
          />
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="grid grid-cols-[200px_1fr] border-b border-black">
        <div className="border-r border-black p-1 font-semibold">
          DESCRIPCIÓN:
        </div>
        <div className="p-1">
          <input
            className="w-full outline-none"
            spellCheck
          />
        </div>
      </div>

      {/* COD INF */}
      <div className="grid grid-cols-[200px_1fr] border-b border-black">
        <div className="border-r border-black p-1 font-semibold">
          Cod. INF.:
        </div>
        <div className="p-1">
          <input className="w-full outline-none" />
        </div>
      </div>

      {/* FILA INFERIOR */}
      <div className="grid grid-cols-[200px_120px_1fr_200px_200px]">
        {/* FECHA EMISIÓN */}
        <div className="border-r border-black p-1 font-semibold">
          FECHA DE EMISIÓN:
        </div>

        <div className="flex border-r border-black">
          {["DD", "MM", "AA"].map((p) => (
            <div
              key={p}
              className="w-1/3 border-r last:border-r-0 border-black text-center"
            >
              <input
                className="w-full text-center outline-none"
              />
            </div>
          ))}
        </div>

        {/* UBICACIÓN */}
        <div className="border-r border-black p-1">
          <strong>UBICACIÓN:</strong>{" "}
          <input className="outline-none w-full" spellCheck />
        </div>

        {/* TÉCNICO */}
        <div className="border-r border-black p-1">
          <strong>TÉCNICO RESPONSABLE:</strong>{" "}
          <input className="outline-none w-full" spellCheck />
        </div>

        {/* CLIENTE */}
        <div className="p-1">
          <strong>CLIENTE:</strong>{" "}
          <input className="outline-none w-full" spellCheck />
          <div className="mt-1">
            <strong>RESPONSABLE CLIENTE:</strong>{" "}
            <input className="outline-none w-full" spellCheck />
          </div>
        </div>
      </div>
    </div>
  );
}
