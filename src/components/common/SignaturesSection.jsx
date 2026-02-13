import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturesSection({ data = {}, onChange }) {
  const tecnicoRef = useRef(null);
  const clienteRef = useRef(null);

  /* ============================
     RECARGAR FIRMA SI EXISTE
  ============================ */
  useEffect(() => {
  if (!tecnicoRef.current || !clienteRef.current) return;

  // Técnico
  if (data?.tecnico) {
    tecnicoRef.current.fromDataURL(data.tecnico);
  } else {
    tecnicoRef.current.clear();
  }

  // Cliente
  if (data?.cliente) {
    clienteRef.current.fromDataURL(data.cliente);
  } else {
    clienteRef.current.clear();
  }
}, [data?.tecnico, data?.cliente]);
  /* ============================
     ACTUALIZAR ESTADO
  ============================ */
  const updateState = () => {
    if (!onChange) return;

    onChange({
      tecnico:
        tecnicoRef.current && !tecnicoRef.current.isEmpty()
          ? tecnicoRef.current.toDataURL()
          : "",
      cliente:
        clienteRef.current && !clienteRef.current.isEmpty()
          ? clienteRef.current.toDataURL()
          : "",
    });
  };

  /* ============================
     BORRAR FIRMA
  ============================ */
  const clearTecnico = () => {
  tecnicoRef.current?.clear();
  onChange?.({
    ...data,
    tecnico: "",
  });
};

const clearCliente = () => {
  clienteRef.current?.clear();
  onChange?.({
    ...data,
    cliente: "",
  });
};

  /* ============================
     BLOQUEO SCROLL AL FIRMAR
  ============================ */
  const handleBegin = () => {
    document.activeElement?.blur();
    document.body.style.overflow = "hidden";
  };

  const handleEnd = () => {
    document.body.style.overflow = "";
    updateState();
  };

  return (
    <section className="bg-white border rounded-xl p-6 space-y-6">
     <h2 style={{ color: "red", fontSize: 40 }}>
  COMPONENTE FIRMA CORRECTO
</h2>

      <div className="grid md:grid-cols-2 gap-6 text-center">

        {/* ================= TÉCNICO ================= */}
        <div>
          <p className="font-semibold mb-2">
            Firma Técnico ASTAP
          </p>

          <SignatureCanvas
            ref={tecnicoRef}
            onBegin={handleBegin}
            onEnd={handleEnd}
            canvasProps={{
              className:
                "border w-full h-32 rounded-md bg-white",
            }}
          />

          <button
            type="button"
            onClick={clearTecnico}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
          >
            Borrar firma
          </button>
        </div>

        {/* ================= CLIENTE ================= */}
        <div>
          <p className="font-semibold mb-2">
            Firma Cliente
          </p>

          <SignatureCanvas
            ref={clienteRef}
            onBegin={handleBegin}
            onEnd={handleEnd}
            canvasProps={{
              className:
                "border w-full h-32 rounded-md bg-white",
            }}
          />

          <button
            type="button"
            onClick={clearCliente}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
          >
            Borrar firma
          </button>
        </div>

      </div>
    </section>
  );
}
