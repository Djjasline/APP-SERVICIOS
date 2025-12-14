// src/app/inspeccion/HojaInspeccionHidro.jsx
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// =======================
// Definición de secciones
// =======================
const secciones = [
  {
    id: "sec1",
    titulo:
      "2. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      {
        codigo: "1.2",
        texto:
          "Verificación de funcionamiento de controles principales",
      },
      {
        codigo: "1.3",
        texto: "Revisión de alarmas o mensajes de fallo",
      },
    ],
  },
  {
    id: "secA",
    titulo:
      "3. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES DEL MÓDULO VACTOR – A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      {
        codigo: "A.1",
        texto:
          "Fugas de aceite hidráulico (mangueras - acoples - bancos)",
      },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Nivel de aceite en la caja de transferencia" },
      {
        codigo: "A.5",
        texto:
          "Inspección del manómetro de filtro hidráulico de retorno (verde, amarillo, rojo)",
      },
      {
        codigo: "A.6",
        texto:
          "Inspección del filtro hidráulico de retorno, presenta fugas o daños",
      },
      {
        codigo: "A.7",
        texto:
          "Inspección de los filtros de succión del tanque hidráulico (opcional)",
      },
      {
        codigo: "A.8",
        texto:
          "Estado de los cilindros hidráulicos, presenta fugas o daños",
      },
      {
        codigo: "A.9",
        texto:
          "Evaluación del estado de los tapones de drenaje de lubricantes",
      },
      {
        codigo: "A.10",
        texto:
          "Evaluación de bancos hidráulicos, presentan fugas o daños",
      },
    ],
  },
  {
    id: "secB",
    titulo:
      "4. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES DEL MÓDULO VACTOR – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      {
        codigo: "B.1",
        texto:
          "Estado de los empaques de la tapa de los filtros de agua",
      },
      {
        codigo: "B.2",
        texto:
          "Inspección del sistema de tapón de expansión de 2\" de tanques de agua",
      },
      {
        codigo: "B.3",
        texto:
          "Inspección de golpes y fugas de agua en el tanque de aluminio",
      },
      {
        codigo: "B.4",
        texto:
          "Inspección de sistema de trinquete, seguros y cilindros neumáticos, se activan",
      },
      {
        codigo: "B.5",
        texto:
          "Inspección de los sellos en el tanque de desperdicios (frontal y posterior), presencia de humedad en sus componentes",
      },
      {
        codigo: "B.6",
        texto:
          "Inspección del estado de los filtros malla para agua de 2\" y 3\"",
      },
    ],
  },
];

// =======================
// Componente principal
// =======================
const HojaInspeccionHidro = () => {
  // 1) Datos del reporte (cliente / técnico) – mismo modelo que informe general
  const [generalInfo, setGeneralInfo] = useState({
    client: "",
    clientContact: "",
    clientEmail: "",
    clientRole: "",
    serviceDate: "",
    internalCode: "",
    address: "",
    reference: "",
    technicalPersonnel: "",
    technicianPhone: "",
    technicianEmail: "",
  });

  // 2) Datos propios de la hoja de inspección
  const [formData, setFormData] = useState({
    estadoEquipo: "",
    observacionesGenerales: "",
    // descripción del equipo
    marca: "",
    modelo: "",
    numeroSerie: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    anioModelo: "",
    vinChasis: "",
    kilometraje: "",
    // ítems SI/NO + observación
    items: {},
  });

  // 3) Puntos de daño sobre la imagen
  const [damagePoints, setDamagePoints] = useState([]);
  const imageRef = useRef(null);

  // 4) Firmas digitales
  const sigAstapRef = useRef(null);
  const sigClientRef = useRef(null);
  const [signatures, setSignatures] = useState({
    astap: null,
    client: null,
  });

  // 5) Exportación a PDF
  const [isExporting, setIsExporting] = useState(false);

  // =======================
  // Handlers
  // =======================
  const handleGeneralChange = (field, value) => {
    setGeneralInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [codigo]: {
          ...prev.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      generalInfo,
      formData,
      damagePoints,
      signatures,
    };
    console.log("Datos hoja inspección:", payload);
    alert("Datos guardados en memoria (ver consola del navegador).");
  };

  const handleResetItems = () => {
    setFormData((prev) => ({
      ...prev,
      items: {},
    }));
  };

  // Imagen: click para agregar puntos numerados, doble clic en el número para eliminar
  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDamagePoints((prev) => [
      ...prev,
      { id: Date.now(), x, y },
    ]);
  };

  const handlePointDoubleClick = (id) => {
    setDamagePoints((prev) => prev.filter((p) => p.id !== id));
  };

  // Firmas
  const handleSaveSignature = (who) => {
    if (who === "astap" && sigAstapRef.current) {
      const dataUrl = sigAstapRef.current.getTrimmedCanvas().toDataURL("image/png");
      setSignatures((prev) => ({ ...prev, astap: dataUrl }));
    }
    if (who === "client" && sigClientRef.current) {
      const dataUrl = sigClientRef.current.getTrimmedCanvas().toDataURL("image/png");
      setSignatures((prev) => ({ ...prev, client: dataUrl }));
    }
    alert("Firma guardada.");
  };

  const handleClearSignature = (who) => {
    if (who === "astap" && sigAstapRef.current) {
      sigAstapRef.current.clear();
      setSignatures((prev) => ({ ...prev, astap: null }));
    }
    if (who === "client" && sigClientRef.current) {
      sigClientRef.current.clear();
      setSignatures((prev) => ({ ...prev, client: null }));
    }
  };

  // Generar PDF
  const handleGeneratePdf = async () => {
    try {
      setIsExporting(true);

      const element = document.getElementById("hoja-inspeccion-root");
      if (!element) {
        alert("No se encontró el contenido del formulario para generar el PDF.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("hoja-inspeccion-hidrosuccionadora.pdf");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // =======================
  // Render
  // =======================

  return (
    <form
      id="hoja-inspeccion-root"
      className="max-w-6xl mx-auto my-6 bg-white shadow-lg rounded-2xl p-6 space-y-6 text-xs md:text-sm"
      onSubmit={handleSubmit}
    >
      {/* ENCABEZADO CON LOGO */}
      <section className="border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/astap-logo.jpg"
              alt="ASTAP"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="font-bold text-base md:text-lg">
                REPORTE DE INSPECCIÓN HIDROSUCCIONADORA
              </h1>
              <p className="text-[11px] text-slate-600">
                Formato para registrar el estado del equipo, condiciones generales y observaciones.
              </p>
            </div>
          </div>
          <div className="text-[10px] text-right">
            <p>Fecha de versión: 01-01-2026</p>
            <p>Versión: 01</p>
          </div>
        </div>
      </section>

      {/* 1. DATOS DEL REPORTE */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">1. Datos del reporte</h2>
        <p className="text-[11px] text-slate-600">
          Datos del cliente, contacto, servicio y técnico responsable.
        </p>

        <div className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Cliente (empresa) *
            </label>
            <input
              type="text"
              value={generalInfo.client}
              onChange={(e) =>
                handleGeneralChange("client", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Nombre de la empresa cliente"
            />
          </div>

          {/* Contacto + cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Contacto del cliente
              </label>
              <input
                type="text"
                value={generalInfo.clientContact}
                onChange={(e) =>
                  handleGeneralChange("clientContact", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre de la persona de contacto"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Cargo del cliente
              </label>
              <input
                type="text"
                value={generalInfo.clientRole}
                onChange={(e) =>
                  handleGeneralChange("clientRole", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Cargo o rol de la persona de contacto"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Correo del cliente
            </label>
            <input
              type="email"
              value={generalInfo.clientEmail}
              onChange={(e) =>
                handleGeneralChange("clientEmail", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="correo@cliente.com"
            />
          </div>

          {/* Fecha + código interno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Fecha de inspección
              </label>
              <input
                type="date"
                value={generalInfo.serviceDate}
                onChange={(e) =>
                  handleGeneralChange("serviceDate", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Código interno / Cód. INF.
              </label>
              <input
                type="text"
                value={generalInfo.internalCode}
                onChange={(e) =>
                  handleGeneralChange("internalCode", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Identificador interno de la inspección"
              />
            </div>
          </div>

          {/* Dirección + referencia */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Dirección
            </label>
            <input
              type="text"
              value={generalInfo.address}
              onChange={(e) =>
                handleGeneralChange("address", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Dirección donde se realiza la inspección"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Referencia
            </label>
            <textarea
              rows={2}
              value={generalInfo.reference}
              onChange={(e) =>
                handleGeneralChange("reference", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
              placeholder="Puntos de referencia para llegar al sitio"
            />
          </div>

          {/* Datos del técnico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Técnico responsable
              </label>
              <input
                type="text"
                value={generalInfo.technicalPersonnel}
                onChange={(e) =>
                  handleGeneralChange("technicalPersonnel", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre del técnico ASTAP"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Teléfono del técnico
              </label>
              <input
                type="tel"
                value={generalInfo.technicianPhone}
                onChange={(e) =>
                  handleGeneralChange("technicianPhone", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="+593 ..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Correo del técnico
              </label>
              <input
                type="email"
                value={generalInfo.technicianEmail}
                onChange={(e) =>
                  handleGeneralChange("technicianEmail", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="tecnico@astap.com"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. ESTADO DEL EQUIPO – IMAGEN CON PUNTOS */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">2. Estado del equipo</h2>
        <p className="text-[11px] text-slate-600">
          Haga clic sobre la imagen para marcar puntos con daños o defectos. Haga doble clic sobre un número para eliminarlo.
        </p>

        <div
          className="relative border rounded-xl bg-slate-50 overflow-hidden cursor-crosshair"
          onClick={handleImageClick}
        >
          <img
            ref={imageRef}
            src="/estado-equipo.png"
            alt="Estado del equipo"
            className="w-full h-auto select-none"
          />

          {damagePoints.map((p, index) => (
            <button
              key={p.id}
              type="button"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handlePointDoubleClick(p.id);
              }}
              className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-[10px] font-semibold shadow"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-semibold text-xs">Resumen del estado del equipo</span>
          <textarea
            name="estadoEquipo"
            value={formData.estadoEquipo}
            onChange={handleHeaderChange}
            className="border rounded px-2 py-1 min-h-[80px]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold text-xs">Observaciones generales</span>
          <textarea
            name="observacionesGenerales"
            value={formData.observacionesGenerales}
            onChange={handleHeaderChange}
            className="border rounded px-2 py-1 min-h-[80px]"
          />
        </label>
      </section>

      {/* 3. TABLAS DE ÍTEMS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-xs md:text-sm">{sec.titulo}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 border-collapse text-[10px] md:text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 w-16">Ítem</th>
                  <th className="border px-2 py-1 text-left">
                    Detalle del parámetro o actividad ejecutada
                  </th>
                  <th className="border px-2 py-1 w-10">Sí</th>
                  <th className="border px-2 py-1 w-10">No</th>
                  <th className="border px-2 py-1 w-48">
                    Observación / Novedad
                  </th>
                </tr>
              </thead>
              <tbody>
                {sec.items.map((item) => {
                  const estado = formData.items[item.codigo]?.estado || "";
                  const obs =
                    formData.items[item.codigo]?.observacion || "";
                  return (
                    <tr key={item.codigo}>
                      <td className="border px-2 py-1 text-center">
                        {item.codigo}
                      </td>
                      <td className="border px-2 py-1">{item.texto}</td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="radio"
                          name={`estado-${item.codigo}`}
                          value="SI"
                          checked={estado === "SI"}
                          onChange={(e) =>
                            handleItemChange(
                              item.codigo,
                              "estado",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="radio"
                          name={`estado-${item.codigo}`}
                          value="NO"
                          checked={estado === "NO"}
                          onChange={(e) =>
                            handleItemChange(
                              item.codigo,
                              "estado",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border rounded px-1 py-0.5"
                          value={obs}
                          onChange={(e) =>
                            handleItemChange(
                              item.codigo,
                              "observacion",
                              e.target.value
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* 4. DESCRIPCIÓN DEL EQUIPO */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">
          5. Descripción del equipo
        </h2>
        <div className="grid md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span>Marca</span>
            <input
              name="marca"
              value={formData.marca}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Modelo</span>
            <input
              name="modelo"
              value={formData.modelo}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>N° serie</span>
            <input
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Placa N°</span>
            <input
              name="placa"
              value={formData.placa}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Horas trabajo módulo</span>
            <input
              name="horasModulo"
              value={formData.horasModulo}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Horas trabajo chasis</span>
            <input
              name="horasChasis"
              value={formData.horasChasis}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Año modelo</span>
            <input
              name="anioModelo"
              value={formData.anioModelo}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>VIN chasis</span>
            <input
              name="vinChasis"
              value={formData.vinChasis}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span>Kilometraje</span>
            <input
              name="kilometraje"
              value={formData.kilometraje}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
      </section>

      {/* 5. FIRMAS DIGITALES */}
      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold text-xs md:text-sm">
          6. Firmas digitales
        </h2>
        <p className="text-[11px] text-slate-600">
          Capture la firma del técnico de ASTAP y del cliente. Use mouse o toque para firmar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firma ASTAP */}
          <div className="space-y-2">
            <p className="font-semibold text-xs">Firma Técnico ASTAP</p>
            <div className="border border-dashed rounded-xl p-2 bg-slate-50">
              <SignatureCanvas
                ref={sigAstapRef}
                canvasProps={{
                  className: "w-full h-40 bg-white rounded-md",
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => handleClearSignature("astap")}
              >
                ⟳ Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleSaveSignature("astap")}
                className="px-3 py-1 rounded-md border text-xs"
              >
                Guardar firma
              </button>
            </div>
          </div>

          {/* Firma Cliente */}
          <div className="space-y-2">
            <p className="font-semibold text-xs">Firma del Cliente</p>
            <div className="border border-dashed rounded-xl p-2 bg-slate-50">
              <SignatureCanvas
                ref={sigClientRef}
                canvasProps={{
                  className: "w-full h-40 bg-white rounded-md",
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => handleClearSignature("client")}
              >
                ⟳ Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleSaveSignature("client")}
                className="px-3 py-1 rounded-md border text-xs"
              >
                Guardar firma
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BOTONES FINALES */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleResetItems}
          className="px-4 py-2 rounded-lg border text-xs md:text-sm"
        >
          Limpiar artículos (SI/NO)
        </button>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg border text-xs md:text-sm"
          >
            Guardar datos
          </button>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm disabled:opacity-60"
          >
            {isExporting ? "Generando PDF..." : "Continuar a vista previa PDF"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default HojaInspeccionHidro;
