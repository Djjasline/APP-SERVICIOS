import React from "react";

export default function ReportHeader({
  titulo = "Documento Técnico",
  codigo = "AST-DOC-001",
  version = "01",
  fecha = "--",
}) {
  return (
    <header className="report-header border border-black mb-3">
      {/* FILA SUPERIOR */}
      <div className="grid grid-cols-12 border-b border-black">
        {/* LOGO */}
        <div className="col-span-3 flex items-center justify-center border-r border-black p-2">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="h-14 object-contain"
          />
        </div>

        {/* TÍTULO */}
        <div className="col-span-6 text-center border-r border-black p-2">
          <h1 className="font-bold text-sm uppercase">
            {titulo}
          </h1>
          <p className="text-xs">
            Departamento de Servicio Técnico
          </p>
        </div>

        {/* METADATA */}
        <div className="col-span-3 text-xs">
          <div className="border-b border-black p-1">
            <strong>Código:</strong> {codigo}
          </div>
          <div className="border-b border-black p-1">
            <strong>Versión:</strong> {version}
          </div>
          <div className="p-1">
            <strong>Fecha:</strong> {fecha}
          </div>
        </div>
      </div>

      {/* FILA INFERIOR */}
      <div className="grid grid-cols-12">
        <div className="col-span-6 border-r border-black p-1 text-xs">
          Documento controlado – Uso interno
        </div>
        <div className="col-span-6 p-1 text-xs text-center">
          ASTAP
        </div>
      </div>
    </header>
  );
}
