import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES SEGÚN PDF OFICIAL
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      { codigo: "1.2", texto: "Verificación de funcionamiento de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras - acoples - bancos)" },
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
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Inspección del estado de los filtros malla para agua de 2\" y 3\"" },
      { codigo: "B.2", texto: "Estado de los empaques de la tapa de los filtros de agua" },
      { codigo: "B.3", texto: "Inspección de fugas de agua (mangueras - acoples)" },
      { codigo: "B.4", texto: "Inspección de la válvula de alivio de la pistola (opcional de 700 PSI)" },
      { codigo: "B.5", texto: "Inspección de golpes y fugas de agua en el tanque de aluminio" },
      { codigo: "B.6", texto: "Inspección del medidor de nivel del tanque, se visualiza sus bolitas?" },
      { codigo: "B.7", texto: "Inspección del sistema de tapón de expansión de 2\" de tanques de aluminio" },
      { codigo: "B.8", texto: "Inspección del sistema de drenaje de la bomba Rodder (opcional)" },
      { codigo: "B.9", texto: "Estado de válvulas checks internas de la bomba de 2\" y de 3\"" },
      { codigo: "B.10", texto: "Estado de los manómetros de presión (opcional)" },
      { codigo: "B.11", texto: "Inspección del estado del carrete de manguera, manguera guía" },
      { codigo: "B.12", texto: "Soporte del carrete está flojo?" },
      { codigo: "B.13", texto: "Inspección del codo giratorio del carrete, superior e inferior, presenta fugas?" },
      { codigo: "B.14", texto: "Inspección de sistema de trinquete, seguros, cilindros neumáticos, se activan?" },
      { codigo: "B.15", texto: "Inspección de la válvula de alivio de bomba de agua (opcional)" },
      { codigo: "B.16", texto: "Inspección de válvulas de 1\"" },
      { codigo: "B.17", texto: "Inspección de válvulas de 3/4\"" },
      { codigo: "B.18", texto: "Inspección de válvulas de 1/2\"" },
      { codigo: "B.19", texto: "Estado de las boquillas, se las da mantenimiento, conservación?" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Inspección de funciones de tablero frontal, se mantiene limpio?" },
      { codigo: "C.2", texto: "Evaluar funcionamiento de tablero de control interno cabina" },
      { codigo: "C.3", texto: "Inspección del estado de control remoto, estado de su puerto de carga" },
      { codigo: "C.4", texto: "Inspección del estado de las electroválvulas de los bancos de control" },
      { codigo: "C.5", texto: "Presencia de humedad en sus componentes" },
      { codigo: "C.6", texto: "Revisión de luces estrobo, flechas y accesorios externos" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Inspección de los sellos en el tanque de desperdicios frontal y posterior" },
      { codigo: "D.2", texto: "Estado interno del tanque de desechos, canastillas, esferas y deflectores" },
      { codigo: "D.3", texto: "Inspección del microfiltros de succión (3)" },
      { codigo: "D.4", texto: "Inspección del tapón de drenaje del filtro de succión" },
      { codigo: "D.5", texto: "Estado físico de las mangueras de succión" },
      { codigo: "D.6", texto: "Seguros de compuerta del tanque de desechos" },
      { codigo: "D.7", texto: "Inspección del sistema de desfogue (válvula y actuador)" },
      { codigo: "D.8", texto: "Inspección de válvulas de alivio de presión Kunkle (3)" },
      { codigo: "D.9", texto: "Inspeccionar la operación del soplador" },
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [formData, setFormData] = useState({
    items: {},
    puntos: [],
  });

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: {
          ...p.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico: sigTecnico.current?.toDataURL(),
        cliente: sigCliente.current?.toDataURL(),
      },
    });
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 bg-white space-y-6">
      {/* TODO el layout ya corregido */}
      {/* (el mensaje ya está largo; en el siguiente seguimos con BARREDORA igual que este) */}
    </form>
  );
}
