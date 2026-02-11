import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturesSection({ data = {}, onChange }) {
  const tecnicoRef = useRef(null);
  const clienteRef = useRef(null);

  /* ============================
     RECARGAR FIRMA SI EXISTE
  ============================ */
  useEffect(() => {
    if (data?.tecnico && tecnicoRef.current) {
      tecnicoRef.current.clear();
      tecnicoRef.current.fromDataURL(data.tecnico);
    }

    if (data?.cliente && clienteRef.current) {
      clienteRef.current.clear();
      clienteRef.current.fromDataURL(data.cliente);
    }
  }, [data]);

  /* ============================
     ACTUALIZAR ESTADO
  ============================ */
  const updateState = () => {
    if (!onChange) return;

    onChange({
      tecnico: tecnicoRef.current?.isEmpty()
        ? ""
        : tecnicoRef.current.toDataURL(),
      cliente: clienteRef.current?.isEmpty()
        ? ""
        : clienteRef.current.toDataURL(),
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

  return (
    <section className="bg-white border rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        Firmas
      </h2>

      <div className="grid md:grid-cols-2 gap-6 text-center">
        {/* ================= TÉCNICO ================= */}
        <div>
          <p className="font-semibold mb-2">
            Firma Técnico ASTAP
          </p>

          <SignatureCanvas
            ref={tecnicoRef}
            onEnd={updateState}
            canvasProps={{
              className:
                "border w-full h-32 rounded-md bg-white",
            }}
          />

          <button
            type="button"
            onClick={clearTecnico}
            className="text-xs text-red-600 mt-2"
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
            onEnd={updateState}
            canvasProps={{
              className:
                "border w-full h-32 rounded-md bg-white",
            }}
          />

          <button
            type="button"
            onClick={clearCliente}
            className="text-xs text-red-600 mt-2"
          >
            Borrar firma
          </button>
        </div>
      </div>
    </section>
  );
}
