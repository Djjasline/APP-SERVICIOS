import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

/* ============================= */
/* STORAGE KEYS */
/* ============================= */
const STORAGE_KEY_CLIENTE = "serviceReport_datosCliente";
const STORAGE_KEY_SIGNATURES = "serviceReport_signatures";

/* ============================= */
/* COMPONENTE PRINCIPAL */
/* ============================= */
function ServiceReportCreation() {
  /* ============================= */
  /* ESTADOS */
  /* ============================= */

  const [datosCliente, setDatosCliente] = useState({
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    codigoInterno: "",
  });

  const [signatures, setSignatures] = useState({
    tecnico: null,
    cliente: null,
  });

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  /* ============================= */
  /* EFECTOS */
  /* ============================= */

  // Cargar datos cliente
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLIENTE);
    if (saved) setDatosCliente(JSON.parse(saved));
  }, []);

  // Guardar datos cliente
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_CLIENTE,
      JSON.stringify(datosCliente)
    );
  }, [datosCliente]);

  // Cargar firmas
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIGNATURES);
    if (saved) setSignatures(JSON.parse(saved));
  }, []);

  // Guardar firmas
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_SIGNATURES,
      JSON.stringify(signatures)
    );
  }, [signatures]);

  /* ============================= */
  /* HANDLERS */
  /* ============================= */

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setDatosCliente((prev) => ({ ...prev, [name]: value }));
  };

  const saveSignature = (tipo, ref) => {
    if (!ref.current) return;

    const dataUrl = ref.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    setSignatures((prev) => ({
      ...prev,
      [tipo]: dataUrl,
    }));
  };

  const clearSignature = (tipo, ref) => {
    if (!ref.current) return;
    ref.current.clear();

    setSignatures((prev) => ({
      ...prev,
      [tipo]: null,
    }));
  };

  /* ============================= */
  /* RENDER */
  /* ============================= */
  return (
    <div className="space-y-8 p-6">

      {/* ============================= */}
      {/* 1. DATOS DEL CLIENTE */}
      {/* ============================= */}
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          1. Datos del cliente
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="cliente"
            value={datosCliente.cliente}
            onChange={handleClienteChange}
            placeholder="Cliente"
            className="input"
          />

          <input
            name="codigoInterno"
            value={datosCliente.codigoInterno}
            onChange={handleClienteChange}
            placeholder="Código interno"
            className="input"
          />

          <input
            name="direccion"
            value={datosCliente.direccion}
            onChange={handleClienteChange}
            placeholder="Dirección"
            className="input"
          />

          <input
            name="contacto"
            value={datosCliente.contacto}
            onChange={handleClienteChange}
            placeholder="Contacto"
            className="input"
          />

          <input
            name="telefono"
            value={datosCliente.telefono}
            onChange={handleClienteChange}
            placeholder="Teléfono"
            className="input"
          />

          <input
            name="correo"
            value={datosCliente.correo}
            onChange={handleClienteChange}
            placeholder="Correo"
            className="input"
          />

          <input
            type="date"
            name="fechaServicio"
            value={datosCliente.fechaServicio}
            onChange={handleClienteChange}
            className="input"
          />
        </div>
      </section>

      {/* ============================= */}
      {/* 6. FIRMAS */}
      {/* ============================= */}
      <section className="bg-white border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          6. Firmas
        </h2>

        {/* FIRMA TÉCNICO */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Firma del técnico
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
            Limpiar
          </button>
        </div>

        {/* FIRMA CLIENTE */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Firma del cliente
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
            Limpiar
          </button>
        </div>
      </section>
    </div>
  );
}

export default ServiceReportCreation;
