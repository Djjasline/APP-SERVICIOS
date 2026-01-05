import React, { useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturesSection({ data, onChange }) {
  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  // Restaurar firmas si existen
  useEffect(() => {
    if (data?.tecnico && sigTecnicoRef.current) {
      sigTecnicoRef.current.fromDataURL(data.tecnico);
    }
    if (data?.cliente && sigClienteRef.current) {
      sigClienteRef.current.fromDataURL(data.cliente);
    }
  }, []);

  const saveSignature = (tipo, ref) => {
    if (!ref.current || ref.current.isEmpty()) return;

    const dataUrl = ref.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    onChange({
      ...data,
      [tipo]: dataUrl,
    });
  };

  const clearSignature = (tipo, ref) => {
    if (!ref.current) return;

    ref.current.clear();

    onChange({
      ...data,
      [tipo]: null,
    });
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Firmas
        </h2>
        <p className="text-sm text-slate-600">
          Firma del técnico responsable y del cliente.
        </p>
      </div>

      {/* ================= FIRMA TÉCNICO ================= */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">
          Firma técnico ASTAP
        </p>

        <div className="border rounded bg-slate-50">
          <SignatureCanvas
            ref={sigTecnicoRef}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 180,
              className: "w-full",
            }}
            onEnd={() =>
              saveSignature("tecnico", sigTecnicoRef)
            }
          />
        </div>

        <button
          type="button"
          onClick={() =>
            clearSignature("tecnico", sigTecnicoRef)
          }
          className="text-xs px-3 py-1 rounded border hover:bg-slate-100"
        >
          Limpiar firma técnico
        </button>
      </div>

      {/* ================= FIRMA CLIENTE ================= */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">
          Firma cliente
        </p>

        <div className="border rounded bg-slate-50">
          <SignatureCanvas
            ref={sigClienteRef}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 180,
              className: "w-full",
            }}
            onEnd={() =>
              saveSignature("cliente", sigClienteRef)
            }
          />
        </div>

        <button
          type="button"
          onClick={() =>
            clearSignature("cliente", sigClienteRef)
          }
          className="text-xs px-3 py-1 rounded border hover:bg-slate-100"
        >
          Limpiar firma cliente
        </button>
      </div>
    </section>
  );
}
