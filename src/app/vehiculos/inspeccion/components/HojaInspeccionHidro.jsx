import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import SignatureCanvas from "react-signature-canvas";

// almacenamiento local
const STORAGE_KEY = "hidro_inspection_reports";

const loadReports = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveReports = (reports) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

// Rutas de imágenes en /public
const LOGO_PATH = "/astap-logo.jpg";
const EQUIPO_IMG_PATH = "/estado-equipo.png";

const initialFormData = {
  referenciaContrato: "",
  descripcion: "",
  codInf: "",
  fechaInspeccion: "",
  ubicacion: "",
  cliente: "",
  tecnicoAstap: "",
  responsableCliente: "",
  estadoEquipo: "",
  observacionesGenerales: "",
  marca: "",
  modelo: "",
  numeroSerie: "",
  placa: "",
  horasModulo: "",
  horasChasis: "",
  anioModelo: "",
  vinChasis: "",
  kilometraje: "",
  elaboradoNombre: "",
  elaboradoCargo: "",
  elaboradoTelefono: "",
  elaboradoCorreo: "",
  autorizadoNombre: "",
  autorizadoCargo: "",
  autorizadoTelefono: "",
  autorizadoCorreo: "",
  items: {},
};

const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      {
        codigo: "1.2",
        texto: "Verificación de funcionamiento de controles principales",
      },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      {
        codigo: "A.1",
        texto:
          "Fugas de aceite hidráulico (mangueras - acoples - bancos)",
      },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      {
        codigo: "A.4",
        texto: "Nivel de aceite en la caja de transferencia",
      },
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
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      {
        codigo: "B.1",
        texto:
          'Inspección del estado de los filtros malla para agua de 2" y 3"',
      },
      {
        codigo: "B.2",
        texto:
          "Estado de los empaques de la tapa de los filtros de agua",
      },
      {
        codigo: "B.3",
        texto:
          "Inspección de fugas de agua (mangueras - acoples)",
      },
      {
        codigo: "B.4",
        texto:
          "Inspección de la válvula de alivio de la pistola (opcional de 700 PSI)",
      },
      {
        codigo: "B.5",
        texto:
          "Inspección de golpes y fugas de agua en el tanque de aluminio",
      },
      {
        codigo: "B.6",
        texto:
          "Inspección del medidor de nivel del tanque, ¿se visualizan sus bolitas?",
      },
      {
        codigo: "B.7",
        texto:
          'Inspección del sistema de tapón de expansión de 2" de tanques de aluminio',
      },
      {
        codigo: "B.8",
        texto:
          "Inspección del sistema de drenaje de la bomba Rodder (opcional)",
      },
      {
        codigo: "B.9",
        texto:
          'Estado de válvulas checks internas de la bomba de 2" y de 3"',
      },
      {
        codigo: "B.10",
        texto:
          "Estado de los manómetros de presión (opcional)",
      },
      {
        codigo: "B.11",
        texto:
          "Inspección del estado del carrete de manguera y manguera guía",
      },
      { codigo: "B.12", texto: "Soporte del carrete, ¿está flojo?" },
      {
        codigo: "B.13",
        texto:
          "Inspección del codo giratorio del carrete, superior e inferior, ¿presenta fugas?",
      },
      {
        codigo: "B.14",
        texto:
          "Inspección de sistema de trinquete, seguros y cilindros neumáticos, ¿se activan?",
      },
      {
        codigo: "B.15",
        texto:
          "Inspección de la válvula de alivio de bomba de agua (opcional)",
      },
      { codigo: "B.16", texto: "Inspección de válvulas de 1\"" },
      { codigo: "B.17", texto: "Inspección de válvulas de 3/4\"" },
      { codigo: "B.18", texto: "Inspección de válvulas de 1/2\"" },
      {
        codigo: "B.19",
        texto:
          "Estado de las boquillas, ¿se les da mantenimiento/conservación?",
      },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      {
        codigo: "C.1",
        texto:
          "Inspección de funciones de tablero frontal, ¿se mantiene limpio?",
      },
      {
        codigo: "C.2",
        texto:
          "Evaluar funcionamiento de tablero de control interno en cabina",
      },
      {
        codigo: "C.3",
        texto:
          "Inspección del estado de control remoto y estado de su puerto de carga",
      },
      {
        codigo: "C.4",
        texto:
          "Inspección del estado de las electroválvulas de los bancos de control",
      },
      { codigo: "C.5", texto: "Presencia de humedad en sus componentes" },
      {
        codigo: "C.6",
        texto:
          "Revisión de luces estrobo, flechas y accesorios externos",
      },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      {
        codigo: "D.1",
        texto:
          "Inspección de los sellos en el tanque de desperdicios, frontal y posterior",
      },
      {
        codigo: "D.2",
        texto:
          "Estado interno del tanque de desechos, canastillas, esferas y deflectores",
      },
      {
        codigo: "D.3",
        texto:
          "Inspección de los microfiltros de succión (3)",
      },
      {
        codigo: "D.4",
        texto:
          "Inspección del tapón de drenaje del filtro de succión",
      },
      {
        codigo: "D.5",
        texto:
          "Estado físico de las mangueras de succión",
      },
      {
        codigo: "D.6",
        texto:
          "Seguros de compuerta del tanque de desechos",
      },
      {
        codigo: "D.7",
        texto:
          "Inspección del sistema de desfogue (válvula y actuador)",
      },
      {
        codigo: "D.8",
        texto:
          "Inspección de válvulas de alivio de presión Kunkle (3)",
      },
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState(initialFormData);
  const [estadoEquipoMarks, setEstadoEquipoMarks] = useState([]);

  const sigAstapRef = useRef(null);
  const sigClienteRef = useRef(null);

  // cargar datos si ya existe la hoja
  useEffect(() => {
    if (!id) return;
    const reports = loadReports();
    const existing = reports.find((r) => r.id === id);
    if (existing?.data) {
      setFormData({
        ...initialFormData,
        ...(existing.data.formData || {}),
      });
      setEstadoEquipoMarks(existing.data.estadoEquipoMarks || []);
    }
  }, [id]);

  // si viene ?pdf=1 desde la lista, generar PDF automáticamente
  useEffect(() => {
    const autoPdf = searchParams.get("pdf");
    if (autoPdf === "1") {
      const timer = setTimeout(() => {
        handleGeneratePDF();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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

    if (!id) {
      console.warn("No hay id de hoja en la URL; no se puede guardar.");
      return;
    }

    const reports = loadReports();
    const index = reports.findIndex((r) => r.id === id);

    const resumen = {
      id,
      fecha: formData.fechaInspeccion || null,
      cliente: formData.cliente || "",
      codigoInterno: formData.codInf || "",
      estado: "Borrador",
      data: {
        formData,
        estadoEquipoMarks,
      },
    };

    let next;
    if (index >= 0) {
      next = [...reports];
      next[index] = { ...reports[index], ...resumen };
    } else {
      next = [...reports, resumen];
    }

    saveReports(next);
    alert("Hoja guardada como borrador.");
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setEstadoEquipoMarks([]);
    if (sigAstapRef.current) sigAstapRef.current.clear();
    if (sigClienteRef.current) sigClienteRef.current.clear();
  };

  const handleEstadoEquipoClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setEstadoEquipoMarks((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x, y },
    ]);
  };

  const handleMarkerDoubleClick = (idMark) => {
    setEstadoEquipoMarks((prev) => prev.filter((m) => m.id !== idMark));
  };

  const loadImageAsDataUrl = async (path) => {
    try {
      const res = await fetch(path);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("No se pudo cargar la imagen:", path, e);
      return null;
    }
  };

  const handleGeneratePDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 10;

    const logoDataUrl = await loadImageAsDataUrl(LOGO_PATH);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "JPEG", 10, 8, 25, 10);
    }

    doc.setFontSize(12);
    doc.text("HOJA DE INSPECCIÓN HIDROSUCCIONADOR", 105, 12, {
      align: "center",
    });

    doc.setFontSize(8);
    doc.text("Fecha de versión: 25-11-2025", 190, 10, { align: "right" });
    doc.text("Versión: 01", 190, 14, { align: "right" });

    y = 22;

    doc.setFontSize(9);
    doc.text(
      `Referencia contrato: ${formData.referenciaContrato || ""}`,
      10,
      y
    );
    y += 5;
    doc.text(`Descripción: ${formData.descripcion || ""}`, 10, y);
    y += 5;
    doc.text(`Cod. INF: ${formData.codInf || ""}`, 10, y);
    y += 5;
    doc.text(
      `Fecha inspección: ${formData.fechaInspeccion || ""}`,
      10,
      y
    );
    y += 5;
    doc.text(`Ubicación: ${formData.ubicacion || ""}`, 10, y);
    y += 5;
    doc.text(`Cliente: ${formData.cliente || ""}`, 10, y);
    y += 5;
    doc.text(`Técnico ASTAP: ${formData.tecnicoAstap || ""}`, 10, y);
    y += 5;
    doc.text(
      `Responsable cliente: ${formData.responsableCliente || ""}`,
      10,
      y
    );

    // Estado del equipo: imagen + marcas
    y += 8;
    doc.setFontSize(9);
    doc.text("Estado del equipo:", 10, y);
    y += 4;

    const equipoImgDataUrl = await loadImageAsDataUrl(EQUIPO_IMG_PATH);
    const imgX = 10;
    const imgWidth = 190;
    const imgHeight = 70;

    if (equipoImgDataUrl) {
      if (y + imgHeight > 260) {
        doc.addPage();
        y = 10;
      }

      doc.addImage(equipoImgDataUrl, "PNG", imgX, y, imgWidth, imgHeight);

      estadoEquipoMarks.forEach((m, index) => {
        const px = imgX + (m.x / 100) * imgWidth;
        const py = y + (m.y / 100) * imgHeight;
        doc.setFillColor(255, 0, 0);
        doc.circle(px, py, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text(String(index + 1), px, py + 1.5, { align: "center" });
      });

      doc.setTextColor(0, 0, 0);
      y += imgHeight + 4;
    }

    doc.setFontSize(8);
    const estadoEquipoTexto = doc.splitTextToSize(
      formData.estadoEquipo || "",
      190
    );
    doc.text(estadoEquipoTexto, 10, y);
    y += estadoEquipoTexto.length * 4 + 4;

    doc.setFontSize(9);
    doc.text("Observaciones generales:", 10, y);
    y += 4;
    doc.setFontSize(8);
    const obsGenerales = doc.splitTextToSize(
      formData.observacionesGenerales || "",
      190
    );
    doc.text(obsGenerales, 10, y);
    y += obsGenerales.length * 4 + 6;

    // Tablas
    secciones.forEach((sec) => {
      if (y > 220) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(9);
      doc.text(sec.titulo, 10, y);
      y += 4;

      const head = [
        ["Ítem", "Detalle", "Sí", "No", "Observación / Novedad"],
      ];

      const body = sec.items.map((item) => {
        const data = formData.items[item.codigo] || {};
        const estado = data.estado || "";
        const obs = data.observacion || "";
        return [
          item.codigo,
          item.texto,
          estado === "SI" ? "X" : "",
          estado === "NO" ? "X" : "",
          obs,
        ];
      });

      autoTable(doc, {
        startY: y,
        head,
        body,
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [230, 230, 230] },
        margin: { left: 10, right: 10 },
      });

      // @ts-ignore
      y = doc.lastAutoTable.finalY + 6;
    });

    // Nueva página: descripción + firmas
    doc.addPage();
    y = 10;

    doc.setFontSize(10);
    doc.text("Descripción del equipo", 10, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`Marca: ${formData.marca || ""}`, 10, y);
    y += 5;
    doc.text(`Modelo: ${formData.modelo || ""}`, 10, y);
    y += 5;
    doc.text(`N° serie: ${formData.numeroSerie || ""}`, 10, y);
    y += 5;
    doc.text(`Placa: ${formData.placa || ""}`, 10, y);
    y += 5;
    doc.text(
      `Horas módulo: ${formData.horasModulo || ""}   Horas chasis: ${
        formData.horasChasis || ""
      }`,
      10,
      y
    );
    y += 5;
    doc.text(
      `Año modelo: ${formData.anioModelo || ""}   VIN chasis: ${
        formData.vinChasis || ""
      }`,
      10,
      y
    );
    y += 5;
    doc.text(`Kilometraje: ${formData.kilometraje || ""}`, 10, y);

    // Firmas y responsables
    y += 10;
    doc.setFontSize(10);
    doc.text("Firmas y responsables", 10, y);
    y += 6;
    doc.setFontSize(9);

    doc.text("Elaborado por: ASTAP Cía. Ltda.", 10, y);
    y += 5;
    doc.text(`Nombre: ${formData.elaboradoNombre || ""}`, 10, y);
    y += 5;
    doc.text(`Cargo: ${formData.elaboradoCargo || ""}`, 10, y);
    y += 5;
    doc.text(`Teléfono: ${formData.elaboradoTelefono || ""}`, 10, y);
    y += 5;
    doc.text(`Correo: ${formData.elaboradoCorreo || ""}`, 10, y);

    let yCliente = y - 20;
    const xCliente = 110;
    doc.text("Autorizado por: CLIENTE", xCliente, yCliente);
    yCliente += 5;
    doc.text(`Nombre: ${formData.autorizadoNombre || ""}`, xCliente, yCliente);
    yCliente += 5;
    doc.text(`Cargo: ${formData.autorizadoCargo || ""}`, xCliente, yCliente);
    yCliente += 5;
    doc.text(
      `Teléfono: ${formData.autorizadoTelefono || ""}`,
      xCliente,
      yCliente
    );
    yCliente += 5;
    doc.text(`Correo: ${formData.autorizadoCorreo || ""}`, xCliente, yCliente);

    const firmasY = y + 10;
    const firmaWidth = 80;
    const firmaHeight = 35;

    doc.rect(10, firmasY, firmaWidth, firmaHeight);
    doc.setFontSize(8);
    doc.text("Firma ASTAP", 10 + firmaWidth / 2, firmasY + firmaHeight + 5, {
      align: "center",
    });

    doc.rect(110, firmasY, firmaWidth, firmaHeight);
    doc.text(
      "Firma CLIENTE",
      110 + firmaWidth / 2,
      firmasY + firmaHeight + 5,
      { align: "center" }
    );

    if (sigAstapRef.current && !sigAstapRef.current.isEmpty()) {
      const sigAstapDataUrl = sigAstapRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      doc.addImage(
        sigAstapDataUrl,
        "PNG",
        12,
        firmasY + 2,
        firmaWidth - 4,
        firmaHeight - 4
      );
    }

    if (sigClienteRef.current && !sigClienteRef.current.isEmpty()) {
      const sigClienteDataUrl = sigClienteRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      doc.addImage(
        sigClienteDataUrl,
        "PNG",
        112,
        firmasY + 2,
        firmaWidth - 4,
        firmaHeight - 4
      );
    }

    doc.save("hoja_inspeccion_hidrosuccionador.pdf");
  };

  return (
    <form
      className="max-w-6xl mx-auto my-6 bg-white shadow-lg rounded-2xl p-6 space-y-6 text-xs md:text-sm"
      onSubmit={handleSubmit}
    >
      {/* ENCABEZADO */}
      <section className="border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={LOGO_PATH} alt="ASTAP" className="h-10 w-auto" />
            <h1 className="font-bold text-base md:text-lg text-center md:text-left">
              HOJA DE INSPECCIÓN HIDROSUCCIONADOR
            </h1>
          </div>
          <div className="text-[10px] text-right">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Referencia de contrato</span>
            <input
              name="referenciaContrato"
              value={formData.referenciaContrato}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="font-semibold">Descripción</span>
            <input
              name="descripcion"
              value={formData.descripcion}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Cod. INF.</span>
            <input
              name="codInf"
              value={formData.codInf}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Fecha de inspección</span>
            <input
              type="date"
              name="fechaInspeccion"
              value={formData.fechaInspeccion}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Ubicación</span>
            <input
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Cliente</span>
            <input
              name="cliente"
              value={formData.cliente}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Técnico ASTAP</span>
            <input
              name="tecnicoAstap"
              value={formData.tecnicoAstap}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="font-semibold">Responsable cliente</span>
            <input
              name="responsableCliente"
              value={formData.responsableCliente}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">Estado del equipo</h2>
        <p className="text-[10px] text-gray-600">
          Haga clic sobre la imagen para marcar puntos con daños o defectos.
          Doble clic sobre un número para eliminarlo.
        </p>

        <div className="w-full flex justify-center">
          <div
            className="relative w-full max-w-2xl border rounded-lg overflow-hidden bg-gray-50 cursor-crosshair"
            onClick={handleEstadoEquipoClick}
          >
            <img
              src={EQUIPO_IMG_PATH}
              alt="Vistas del equipo"
              className="w-full h-auto select-none pointer-events-none"
            />

            {estadoEquipoMarks.map((m, index) => (
              <button
                key={m.id}
                type="button"
                onDoubleClick={() => handleMarkerDoubleClick(m.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center border border-white shadow"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                title="Doble clic para eliminar"
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-semibold">Detalle del estado del equipo</span>
          <textarea
            name="estadoEquipo"
            value={formData.estadoEquipo}
            onChange={handleHeaderChange}
            className="border rounded px-2 py-1 min-h-[80px]"
          />
        </label>
      </section>

      {/* OBSERVACIONES GENERALES */}
      <section className="border rounded-xl p-4 space-y-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Observaciones generales</span>
          <textarea
            name="observacionesGenerales"
            value={formData.observacionesGenerales}
            onChange={handleHeaderChange}
            className="border rounded px-2 py-1 min-h-[80px]"
          />
        </label>
      </section>

      {/* TABLAS DE ÍTEMS */}
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

      {/* DESCRIPCIÓN DEL EQUIPO */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">
          Descripción del equipo
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

      {/* FIRMAS */}
      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold text-xs md:text-sm">
          Firmas y responsables
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="font-semibold text-xs">
              Elaborado por: ASTAP Cía. Ltda.
            </p>
            <label className="flex flex-col gap-1">
              <span>Nombre</span>
              <input
                name="elaboradoNombre"
                value={formData.elaboradoNombre}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Cargo</span>
              <input
                name="elaboradoCargo"
                value={formData.elaboradoCargo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Teléfono</span>
              <input
                name="elaboradoTelefono"
                value={formData.elaboradoTelefono}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Correo</span>
              <input
                name="elaboradoCorreo"
                value={formData.elaboradoCorreo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>

            <div className="mt-3 space-y-1">
              <span className="font-semibold text-[11px]">Firma ASTAP</span>
              <div className="border border-gray-400 rounded-md bg-white">
                <SignatureCanvas
                  ref={sigAstapRef}
                  penColor="black"
                  canvasProps={{
                    width: 450,
                    height: 150,
                    className: "w-full h-[150px]",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  sigAstapRef.current && sigAstapRef.current.clear()
                }
                className="mt-1 px-3 py-1 rounded border text-[10px]"
              >
                Limpiar firma ASTAP
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-xs">Autorizado por: CLIENTE</p>
            <label className="flex flex-col gap-1">
              <span>Nombre</span>
              <input
                name="autorizadoNombre"
                value={formData.autorizadoNombre}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Cargo</span>
              <input
                name="autorizadoCargo"
                value={formData.autorizadoCargo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Teléfono</span>
              <input
                name="autorizadoTelefono"
                value={formData.autorizadoTelefono}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Correo</span>
              <input
                name="autorizadoCorreo"
                value={formData.autorizadoCorreo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>

            <div className="mt-3 space-y-1">
              <span className="font-semibold text-[11px]">
                Firma CLIENTE
              </span>
              <div className="border border-gray-400 rounded-md bg-white">
                <SignatureCanvas
                  ref={sigClienteRef}
                  penColor="black"
                  canvasProps={{
                    width: 450,
                    height: 150,
                    className: "w-full h-[150px]",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  sigClienteRef.current && sigClienteRef.current.clear()
                }
                className="mt-1 px-3 py-1 rounded border text-[10px]"
              >
                Limpiar firma CLIENTE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg border text-xs md:text-sm"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-lg border text-xs md:text-sm"
        >
          Limpiar artículos / marcas / firmas
        </button>
        <button
          type="button"
          onClick={handleGeneratePDF}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs md:text-sm"
        >
          Generar PDF
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm"
        >
          Guardar / continuar
        </button>
      </div>
    </form>
  );
}
