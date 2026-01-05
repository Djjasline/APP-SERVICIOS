import React from "react";

export default function ReportHeader({ data }) {
  return (
    <div className="border border-black mb-4">
      {/* FILA SUPERIOR */}
      <div className="grid grid-cols-12 border-b border-black">
        {/* LOGO */}
        <div className="col-span-3 flex items-center justify-center border-r border-black p-2">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="h-16 object-contain"
          />
        </div>

        {/* TITULO */}
        <div className="col-span-6 text-center border-r border-black p-2">
          <h1 className="font-bold text-base uppercase">
            Informe General de Servicios
          </h1>
          <p className="text-xs">
            Departamento de Servicio Técnico
          </p>
        </div>

        {/* METADATA */}
        <div className="col-span-3 text-xs">
          <div className="border-b border-black p-1">
            <strong>Versión:</strong>{" "}
            {data?.version || "01"}
          </div>
          <div className="border-b border-black p-1">
            <strong>Fecha:</strong>{" "}
            {data?.fechaVersion || "--"}
          </div>
          <div className="p-1">
            <strong>Página:</strong> 1
          </div>
        </div>
      </div>

      {/* FILA INFERIOR */}
      <div className="grid grid-cols-12">
        <div className="col-span-3 border-r border-black p-1 text-xs">
          Código: AST-SRV-001
        </div>
        <div className="col-span-6 border-r border-black p-1 text-xs text-center">
          Documento controlado – Uso interno
        </div>
        <div className="col-span-3 p-1 text-xs text-center">
          ASTAP
        </div>
      </div>
    </div>
  );
}
