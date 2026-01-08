// src/app/inspeccion/HojaInspeccionHidro.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN
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
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos)" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Nivel de aceite en caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro del filtro hidráulico de retorno" },
      { codigo: "A.6", texto: "Filtro hidráulico de retorno (fugas o daños)" },
      { codigo: "A.7", texto: "Filtros de succión del tanque hidráulico" },
      { codigo: "A.8", texto: "Cilindros hidráulicos (fugas o daños)" },
      { codigo: "A.9", texto: "Tapones de drenaje de lubricantes" },
      { codigo: "A.10", texto: "Bancos hidráulicos (fugas o daños)" },
    ],
  },

  {
    id: "secB",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Estado de filtros malla para agua 2” y 3”" },
      { codigo: "B.2", texto: "Estado de empaques tapa filtros de agua" },
      { codigo: "B.3", texto: "Inspección de fugas de agua (mangueras – acoples)" },
      { codigo: "B.4", texto: "Válvula de alivio de pistola (opcional 700 PSI)" },
      { codigo: "B.5", texto: "Golpes y fugas de agua en tanque de aluminio" },
      { codigo: "B.6", texto: "Medidor de nivel del tanque (visualización de bolitas)" },
      { codigo: "B.7", texto: "Sistema de tapón de expansión tanques de aluminio" },
      { codigo: "B.8", texto: "Sistema de drenaje bomba Rodder (opcional)" },
      { codigo: "B.9", texto: "Válvulas check internas bomba 2” y 3”" },
      { codigo: "B.10", texto: "Manómetros de presión (opcional)" },
      { codigo: "B.11", texto: "Carrete de manguera y manguera guía" },
      { codigo: "B.12", texto: "Soporte del carrete (fijo / flojo)" },
      { codigo: "B.13", texto: "Codo giratorio del carrete (fugas)" },
      { codigo: "B.14", texto: "Sistema de trinquete y seguros neumáticos" },
      { codigo: "B.15", texto: "Válvula de alivio bomba de agua (opcional)" },
      { codigo: "B.16", texto: "Válvulas de 1”" },
      { codigo: "B.17", texto: "Válvulas de ¾”" },
      { codigo: "B.18", texto: "Válvulas de ½”" },
      { codigo: "B.19", texto: "Boquillas (estado y mantenimiento)" },
    ],
  },

  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Tablero frontal limpio y funcional" },
      { codigo: "C.2", texto: "Funcionamiento tablero control interno cabina" },
      { codigo: "C.3", texto: "Control remoto y puerto de carga" },
      { codigo: "C.4", texto: "Electroválvulas de bancos de control" },
      { codigo: "C.5", texto: "Presencia de humedad en componentes eléctricos" },
      { codigo: "C.6", texto: "Luces estrobo, flechas y accesorios externos" },
    ],
  },

  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Sellos tanque de desperdicios (frontal y posterior)" },
      { codigo: "D.2", texto: "Estado interno tanque de desechos y deflectores" },
      { codigo: "D.3", texto: "Microfiltros de succión (3)" },
      { codigo: "D.4", texto: "Tapón drenaje filtro de succión" },
      { codigo: "D.5", texto: "Estado físico mangueras de succión" },
      { codigo: "D.6", texto: "Seguros compuerta tanque desechos" },
      { codigo: "D.7", texto: "Sistema de desfogue (válvula y actuador)" },
      { codigo: "D.8", texto: "Válvulas alivio presión Kunkle (3)" },
      { codigo: "D.9", texto: "Operación del soplador" },
    ],
  },
];

  
