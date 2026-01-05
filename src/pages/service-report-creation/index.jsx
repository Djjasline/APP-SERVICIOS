import ReportHeader from "@/components/report/ReportHeader";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

/* ============================= */
/* STORAGE KEYS */
/* ============================= */
const STORAGE_KEY_CLIENTE = "serviceReport_datosCliente";
const STORAGE_KEY_EQUIPO = "serviceReport_datosEquipo";
const STORAGE_KEY_SIGNATURES = "serviceReport_signatures";

function ServiceReportCreation() {
  /* ============================= */
  /* HEADER DATA */
  /* ============================= */
  const headerData = {
    fechaVersion: "26-11-25",
    version: "01",
  };

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

  const [datosEquipo, setDatosEquipo] = useState({
    tipoEquipo: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    placa: "",
    anioFabricacion: "",
    kilometraje: "",
    horasTrabajo: "",
    vinChasis: "",
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
  useEffect(() => {
    const c = localStorage.getItem(STORAGE_KEY_CLIENTE);
    if (c) setDatosCliente(JSON.parse(c));

    const e = localStorage.getItem(STORAGE_KEY_EQUIPO);
    if (e) setDatosEquipo(JSON.parse(e));

    const s = localStorage.getItem(STORAGE_KEY_SIGNATURES);
    if (s) setSignatures(JSON.parse(s));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_CLIENTE,
      JSON.stringify(datosCliente)
    );
  }, [datosCliente]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_EQUIPO,
      JSON.stringify(datosEquipo)
    );
  }, [datosEquipo]);

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
    setDatosCliente((p) => ({ ...p, [name]: value }));
  };

  const handleEquipoChange = (e) => {
    const { name, value } = e.target;
    setDatosEquipo((p) => ({ ...p, [name]: value }));
  };

  const saveSignature = (tipo, ref) => {
    if (!ref.current) return;
    const dataUrl = ref.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    setSignatures((p) => ({ ...p, [tipo]: dataUrl }));
  };

  const clearSignature = (tipo, ref) => {
    if (!ref.current) return;
    ref.current.clear();
    setSignatures((p) => ({ ...p, [tipo]: null }));
  };

  /* ============================= */
  /* RENDER */
/* ============================= */
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div
        id="pdf-content"
        className="max-w-6xl mx-auto bg-white p-6 space-y-8"
      >
        {/* HEADER */}
        <ReportHeader data={headerData} />

        {/* ============================= */}
        {/* 1. DATOS DEL CLIENTE */}
        {/* ============================= */}
        <section className="border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            1. Datos del cliente
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="cliente"
              value={datosCliente.cliente}
              onChange={handleClienteChange}
              placeholder="Cliente"
              className="input"
              spellCheck
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
              spellCheck
            />

            <input
              name="contacto"
              value={datosCliente.contacto}
              onChange={handleClienteChange}
              placeholder="Contacto"
              className="input"
              spellCheck
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
        {/* 2. DATOS DEL EQUIPO */}
        {/* ============================= */}
        <section className="border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            2. Datos del equipo
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="tipoEquipo"
              value={datosEquipo.tipoEquipo}
              onChange={handleEquipoChange}
              placeholder="Tipo de equipo"
              className="input"
              spellCheck
            />

            <input
              name="marca"
              value={datosEquipo.marca}
              onChange={handleEquipoChange}
              placeholder="Marca"
              className="input"
              spellCheck
            />

            <input
              name="modelo"
              value={datosEquipo.modelo}
              onChange={handleEquipoChange}
              placeholder="Modelo"
              className="input"
              spellCheck
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="numeroSerie"
              value={datosEquipo.numeroSerie}
              onChange={handleEquipoChange}
              placeholder="Número de serie"
              className="input"
            />

            <input
              name="placa"
              value={datosEquipo.placa}
              onChange={handleEquipoChange}
              placeholder="Placa"
              className="input"
            />

            <input
              name="anioFabricacion"
              value={datosEquipo.anioFabricacion}
              onChange={handleEquipoChange}
              placeholder="Año de fabricación"
              className="input"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="kilometraje"
              value={datosEquipo.kilometraje}
              onChange={handleEquipoChange}
              placeholder="Kilometraje"
              className="input"
            />

            <input
              name="horasTrabajo"
              value={datosEquipo.horasTrabajo}
              onChange={handleEquipoChange}
              placeholder="Horas de trabajo"
              className="input"
            />

            <input
              name="vinChasis"
              value={datosEquipo.vinChasis}
              onChange={handleEquipoChange}
              placeholder="VIN / Chasis"
              className="input"
            />
          </div>
        </section>

        {/* ============================= */}
        {/* 6. FIRMAS */}
        {/* ============================= */}
        <section className="border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">
            6. Firmas
          </h2>

          <div>
            <p className="text-sm font-medium">
              Firma del técnico
            </p>
            <SignatureCanvas
              ref={sigTecnicoRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 180,
                className: "w-full border",
              }}
              onEnd={() =>
                saveSignature("tecnico", sigTecnicoRef)
              }
            />
            <button
              onClick={() =>
                clearSignature("tecnico", sigTecnicoRef)
              }
              className="text-xs mt-1 border px-3 py-1"
            >
              Limpiar
            </button>
          </div>

          <div>
            <p className="text-sm font-medium">
              Firma del cliente
            </p>
            <SignatureCanvas
              ref={sigClienteRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 180,
                className: "w-full border",
              }}
              onEnd={() =>
                saveSignature("cliente", sigClienteRef)
              }
            />
            <button
              onClick={() =>
                clearSignature("cliente", sigClienteRef)
              }
              className="text-xs mt-1 border px-3 py-1"
            >
              Limpiar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ServiceReportCreation;
