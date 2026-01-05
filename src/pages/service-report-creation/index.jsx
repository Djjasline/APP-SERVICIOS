import ReportHeader from "@/components/report/ReportHeader";
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
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      {/* CONTENEDOR PDF */}
      <div
        id="pdf-content"
        className="max-w-6xl mx-auto bg-white p-6 space-y-8"
      >
        {/* ============================= */}
        {/* HEADER INFORME TÉCNICO */}
        {/* ============================= */}
        <ReportHeader data={headerData} />

        {/* ============================= */}
        {/* 1. DATOS DEL CLIENTE */}
        {/* ============================= */}
        <section className="border rounded-xl p-6 space-y-4">
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
              name="fecha
