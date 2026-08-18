import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, CheckCircle2, Download, Eye, EyeOff, FileText, History, RefreshCw, Save, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import ClientReferenceInput from "@/components/ClientReferenceInput";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";
import { downloadConfiguratorPdf } from "./configuratorPdf";
import { getConfiguratorQuoteById, getConfiguratorQuoteHistory, regenerateConfiguratorQuotePdf, saveConfiguratorQuote, updateConfiguratorQuote } from "@/services/configuratorQuoteService";

const VACTOR_LINE_IMAGE = "/vactor-linea.png.png";
const SPRITE_COLUMNS = 4;
const SPRITE_ROWS = 2;
const DRAFT_STORAGE_KEY = "astap-configurador-draft";
const PRIMARY_MODEL_IDS = ["2100i", "impact", "2100i-cb"];

const MODELS = [
  { id: "2100i", name: "Vactor 2100i", family: "Vactor", basePrice: 340000, fallbackImage: "/hidro-base.png", sprite: { col: 0, row: 0 } },
  { id: "water-recycler", name: "Water Recycler", family: "Vactor", basePrice: 410000, fallbackImage: "/hidro-base.png", sprite: { col: 1, row: 0 } },
  { id: "impact", name: "Vactor Impact", family: "Vactor", basePrice: 220000, fallbackImage: "/hidro-base.png", sprite: { col: 2, row: 0 } },
  { id: "2100i-cb", name: "Vactor Catch Basin", family: "Vactor", basePrice: 355000, fallbackImage: "/hidro-base.png", sprite: { col: 3, row: 0 } },
  { id: "ramjet-truck", name: "Ramjet Truck Series", family: "Vactor", basePrice: 185000, fallbackImage: "/hidro-base.png", sprite: { col: 0, row: 1 } },
  { id: "ramjet-trailer", name: "Ramjet Trailer Jetter", family: "Vactor", basePrice: 165000, fallbackImage: "/hidro-base.png", sprite: { col: 1, row: 1 } },
  { id: "ace", name: "ACE Easement Machine", family: "Vactor", basePrice: 145000, fallbackImage: "/hidro-base.png", sprite: { col: 2, row: 1 } },
  { id: "truvac", name: "Vacuum Excavation by TRUVAC", family: "Vactor", basePrice: 325000, fallbackImage: "/hidro-base.png", sprite: { col: 3, row: 1 } },
];

const TABS = [
  { id: "basic", label: "Modelo base / Chasis" },
  { id: "module", label: "Módulo" },
  { id: "water", label: "Sistema de agua" },
  { id: "electrical", label: "Sistema eléctrico" },
  { id: "systems", label: "Sistemas" },
  { id: "paint", label: "Pintura" },
  { id: "accessories", label: "Accesorios" },
  { id: "review", label: "Revisión" },
];

const SELECT_OPTIONS = {
  vacuumSystem: [
    ["Soplador Roots 824-18", 0],
    ["Soplador Roots 824-15", -4500],
    ["Sistema de lavado de ventilador", 3800],
  ],
  modelType: [["Combinado", 0], ["Limpiador de alcantarillado", -15000], ["Reciclador", 32000]],
  waterFlow: [["80.0", 0], ["60.0", -1800], ["100.0", 2400]],
  waterPressure: [["2500", 0], ["2000", -2200], ["3000", 3200]],
  debrisBody: [["10.0", 0], ["12.0", 9500], ["15.0", 18000]],
  waterCapacity: [["1500", 0], ["1000", -6500], ["1300", -2800], ["1800", 7400]],
  waterTankMaterial: [["Aluminio", 0], ["Acero inoxidable", 11500], ["Polietileno", -3200]],
  source: [["Cliente", 0], ["Suministrado por fábrica", 42000]],
  modelYear: [["2027", 0], ["2026", -3000], ["2028", 3500]],
  make: [["International", 0], ["Freightliner", 8500], ["Peterbilt", 18000]],
  axleType: [["Tándem", 0], ["Simple", -9000], ["Tridem o eje auxiliar", 21000]],
  boom: [["Telescópico 10'", 0], ["Extensible 10'", 8500], ["Fijo", -3500]],
  waterRing: [["Ninguno", 0], ["Estándar", 1600], ["Premium", 2800]],
  decant: [["Ninguno", 0], ["Sí", 4500]],
  pumpOff: [["Ninguno", 0], ["Hidráulico", 6500]],
  cycloneSeparators: [["Ninguno", 0], ["Separadores centrífugos", 7200]],
  foldingRackDriver: [["Sí", 0], ["No", -900]],
  foldingRackPassenger: [["Sí", 0], ["No", -900]],
  driverRackSize: [["8", 0], ["6", -600], ["10", 700]],
  passengerRackSize: [["8", 0], ["6", -600], ["10", 700]],
  hoseReelCapacity: [["Estándar", 0], ["Extendida", 4500]],
  highPressureHoseReel: [["1", 0], ["2", 5600]],
  rodderHoseType: [["Piranha", 0], ["Premium", 1200]],
  rodderHoseDiameter: [["1/2\"", 0], ["3/4\"", 900]],
  rodderHoseLength: [["500'", 0], ["600'", 1400], ["800'", 3600]],
  rearArrowboard: [["Ninguno", 0], ["Baliza LED", 1450]],
  frontArrowboard: [["Ninguno", 0], ["LED", 1450]],
  rearBeacons: [["Baliza LED trasera", 0], ["Ninguno", -800]],
  handlight: [["Lámpara portátil con carrete retráctil", 0], ["Ninguna", -650]],
  cameraSystem: [["Solo posterior", 0], ["Posterior + laterales", 2400]],
  worklightsRear: [["Ninguna", 0], ["LED", 1600]],
  baseColor: [["Blanco", 0], ["Personalizado", 4500]],
  stripe: [["Estándar", 0], ["Suministrado por cliente", 1300]],
  bodyDecal: [["Estándar", 0], ["Español", 420], ["Personalizado", 1450]],
  safetyRack: [["Ninguno", 0], ["Estándar", 1450]],
  operatorManuals: [["1", 0], ["2", 180], ["Español + Inglés", 320]],
  printedManuals: [["Ninguno", 0], ["1 juego", 220]],
  shipmentManuals: [["Enviar a facturación", 0], ["Enviar con la unidad", 0]],
  extendedWarranty: [["Ninguna", 0], ["12 meses", 6500], ["24 meses", 11800]],
  wirelessRemote: [["Ninguno", 0], ["Control remoto inalámbrico", 8400]],
  subframeToolboxDriver: [["Ninguna", 0], ["48 x 22 x 34", 3200]],
  subframeToolboxPassenger: [["48 x 22 x 34", 0], ["Ninguna", -3200]],
  frontBumperStorage: [["No", 0], ["Sí", 1700]],
};

const OPTION_INFO = {
  hpAccumulator: { function: "Absorbe pulsaciones o efecto de martilleo generado por la bomba de pistones.", application: "SC / HX", complexity: "Media", recommendation: "Alta cuando se trabaja con presiones elevadas o existe vibración excesiva.", reference: "Manual, p. 19" },
  hpDualAccumulators: { function: "Usa un acumulador para el carrete principal y otro para la pistola manual.", application: "SC / HX", complexity: "Media-alta", recommendation: "Alta en trabajos mixtos de limpieza e hidroexcavación.", reference: "Manual, p. 20" },
  hpAirPurgeSystem: { function: "Usa aire comprimido del chasis para expulsar agua de tuberías, mangueras y componentes.", application: "General", complexity: "Media", recommendation: "Condicional; recomendable para zonas con riesgo de congelamiento.", reference: "Manual, p. 21" },
  hpAntiFreezeTank: { function: "Introduce anticongelante en bomba, intercambiadores y líneas durante transporte o almacenamiento.", application: "General", complexity: "Media", recommendation: "Condicional para climas fríos; baja prioridad para operación habitual en Ecuador.", reference: "Manual, p. 22" },
  controlAutoWindGuide: { function: "Distribuye uniformemente la manguera sobre el carrete y reduce cruces.", application: "SC", complexity: "Media", recommendation: "Muy alta para carretes largos y uso intensivo.", reference: "Manual, pp. 23-28" },
  controlAutoWindGuideHydraulic: { function: "Permite elevar o bajar hidráulicamente el conjunto del guía-manguera.", application: "SC", complexity: "Media-alta", recommendation: "Alta cuando se requiere trabajar desplazado respecto al pozo.", reference: "Manual, p. 24" },
  pinchRoller: { function: "Mantiene presión sobre la manguera para conservar vueltas ajustadas durante entrada y salida.", application: "SC", complexity: "Media", recommendation: "Alta junto con el Auto Wind Guide.", reference: "Manual, p. 26" },
  boom5x5: { function: "Extiende la pluma cinco pies y la manguera de vacío cinco pies adicionales.", application: "CB / SC", complexity: "Alta", recommendation: "Alta para operación urbana y limpieza de pozos cercanos al camión.", reference: "Manual, pp. 29-33" },
  boomRdb: { function: "Pluma telescópica de mayor alcance, con extensión aproximada de 10 ft y hasta 15 ft adicionales de manguera.", application: "CB / HX", complexity: "Alta", recommendation: "Muy alta para sumideros, excavaciones y puntos alejados del vehículo.", reference: "Manual, pp. 34-41" },
  hpContinuousFill: { function: "Mantiene automáticamente el nivel de los tanques conectado a una fuente de agua.", application: "SC / HX", complexity: "Media", recommendation: "Muy alta para trabajos prolongados con hidrante o abastecimiento continuo.", reference: "Manual, p. 42" },
  vacCycloneSeparator: { function: "Separa partículas y residuos del flujo de aire antes de llegar al ventilador o soplador.", application: "CB / HX / SC", complexity: "Media-alta", recommendation: "Muy alta para proteger el sistema de vacío con material seco o abrasivo.", reference: "Manual, pp. 43-44" },
  hpFlusherSystem: { function: "Descarga agua a baja presión y alto caudal mediante boquillas durante el desplazamiento.", application: "Lavado vial", complexity: "Alta", recommendation: "Condicional; solo si se requiere lavado de vías además de alcantarillado.", reference: "Manual, p. 45" },
  hpHandGunHoseReel: { function: "Almacena y rebobina hasta aproximadamente 50 ft de manguera de 1/2 pulgada.", application: "HX / lavado", complexity: "Baja-media", recommendation: "Alta por orden, seguridad y rapidez de despliegue.", reference: "Manual, p. 46" },
  hpFreewheelOption: { function: "Desacopla el motor del carrete para permitir rotación manual ante falla hidráulica.", application: "SC", complexity: "Media", recommendation: "Alta como función de contingencia y recuperación de la manguera.", reference: "Manual, p. 47" },
  hydroExcavationPackage: { function: "Integra elementos para cortar suelo con agua y retirarlo mediante vacío.", application: "HX", complexity: "Alta", recommendation: "Muy alta cuando el equipo se comercialice como unidad multipropósito.", reference: "Manual, pp. 48-65" },
  hydroDiggingGun: { function: "Pistola de agua de alta presión para desintegrar suelo de forma controlada.", application: "HX", complexity: "Media", recommendation: "Obligatoria para una configuración formal de hidroexcavación.", reference: "Manual, pp. 53-64" },
  hpDiggingLance: { function: "Lanza para dirigir agua hacia excavaciones estrechas o profundas.", application: "HX", complexity: "Baja-media", recommendation: "Alta como complemento de la pistola de excavación.", reference: "Manual, p. 65" },
  hpWaterHeaterAlkota: { function: "Calienta el agua utilizada durante hidroexcavación o limpieza.", application: "HX / limpieza industrial", complexity: "Alta", recommendation: "Condicional; recomendable en suelos congelados, grasa o aplicaciones especiales.", reference: "Manual, pp. 66-70" },
  hydroHydraulicToolPackage: { function: "Proporciona alimentación hidráulica para herramientas externas.", application: "HX / mantenimiento", complexity: "Media-alta", recommendation: "Media-alta si el cliente utiliza martillos, bombas o herramientas hidráulicas.", reference: "Manual, p. 71" },
  hydroLateralCleaningKit: { function: "Permite intervenir conexiones laterales o acometidas desde la línea principal.", application: "SC", complexity: "Media", recommendation: "Alta para municipios y contratistas que limpian acometidas domiciliarias.", reference: "Manual, p. 72" },
  vacLavalSeparator: { function: "Separa sólidos del líquido por acción centrífuga antes de devolver el agua al tanque.", application: "Recycler / SC", complexity: "Alta", recommendation: "Alta en unidades recicladoras y trabajos con disponibilidad limitada de agua.", reference: "Manual, p. 73" },
  controlWirelessBellyPackHetronicNovaL: { function: "Control inalámbrico corporal para agua, carrete, pluma, vacío, aceleración, tanque y puerta trasera.", application: "General", complexity: "Alta", recommendation: "Muy alta por visibilidad, ergonomía y seguridad del operador.", reference: "Manual, pp. 74-82" },
  controlWirelessRemoteErgoS: { function: "Control inalámbrico portátil para funciones principales del equipo.", application: "General", complexity: "Alta", recommendation: "Muy alta para un solo operador o maniobras alejadas del panel.", reference: "Manual, pp. 83-90" },
  hpRecirculatorSystem: { function: "Mantiene agua circulando por componentes o líneas para continuidad operativa y protección del sistema.", application: "SC / clima frío", complexity: "Alta", recommendation: "Condicional; revisar diferencias frente al Water Recycler antes de especificarlo.", reference: "Manual, p. 91" },
  tanksJoined: { function: "Comunica los tanques para operar en conjunto y aprovechar el volumen disponible.", application: "SC / HX", complexity: "Media", recommendation: "Alta cuando se busca maximizar autonomía de agua.", reference: "Manual, p. 92" },
  vacDebrisBodyPump: { function: "Permite bombear líquidos desde el tanque de desechos.", application: "HX / CB", complexity: "Media-alta", recommendation: "Alta cuando el cliente necesita descargar líquidos de manera controlada.", reference: "Manual, p. 94" },
  vacDebrisBodyLevelIndicator: { function: "Informa o detecta el nivel de material dentro del tanque de residuos.", application: "General", complexity: "Media", recommendation: "Muy alta para evitar sobrellenado y mejorar control operativo.", reference: "Manual, p. 95" },
  controlLoadLimitAdjustment: { function: "Permite configurar límite de carga o nivel autorizado del tanque.", application: "General", complexity: "Media-alta", recommendation: "Muy alta para respetar pesos por eje y GVWR del chasis.", reference: "Manual, p. 96" },
  vacVacuumEnhance: { function: "Mejora la capacidad o respuesta del sistema de vacío en determinadas condiciones.", application: "HX / CB", complexity: "Alta", recommendation: "Alta; requiere validar ventilador, soplador y configuración específica.", reference: "Manual, p. 97" },
  vacOnTheGo: { function: "Permite usar el sistema de vacío con accionamiento hidráulico en ciertas condiciones de desplazamiento.", application: "Limpieza continua", complexity: "Alta", recommendation: "Condicional; útil para trabajos lineales, pero aumenta integración e interbloqueos.", reference: "Manual, pp. 98-100" },
  hpWaterRecycler: { function: "Recupera y filtra líquido del tanque de residuos para reutilizarlo en limpieza de tuberías.", application: "SC", complexity: "Muy alta", recommendation: "Muy alta para jornadas prolongadas y zonas con acceso limitado al agua.", reference: "Manual, pp. 101-117" },
  hpGrayWaterTank: { function: "Administra almacenamiento y funciones asociadas al agua recuperada.", application: "Recycler", complexity: "Alta", recommendation: "Necesaria cuando la unidad se configura con Water Recycler.", reference: "Manual, p. 114" },
  hpGrayWaterTankSensor: { function: "Controla nivel o condición del tanque de agua reciclada y permite diagnosticar fallas.", application: "Recycler", complexity: "Media", recommendation: "Necesaria con Water Recycler.", reference: "Manual, p. 115" },
  hpFilterBackflush: { function: "Ejecuta retrolavado de filtros del sistema reciclador para retirar sólidos acumulados.", application: "Recycler", complexity: "Alta", recommendation: "Obligatoria para conservar rendimiento de filtración.", reference: "Manual, p. 116" },
};

const USAGE_PROFILES = [
  { id: "sewer", label: "Limpieza de alcantarillado" },
  { id: "hydro", label: "Hidroexcavación" },
  { id: "recycler", label: "Recicladora" },
];

const PROFILE_PRIORITIES = {
  sewer: {
    Esenciales: ["controlAutoWindGuide", "pinchRoller", "hpAccumulator", "hpHandGunHoseReel", "vacDebrisBodyLevelIndicator"],
    "Muy recomendables": ["hpContinuousFill", "hpFreewheelOption", "controlWirelessBellyPackHetronicNovaL", "controlWirelessRemoteErgoS", "controlLoadLimitAdjustment"],
    "Según aplicación": ["boom5x5", "boomRdb", "hydroLateralCleaningKit", "vacCycloneSeparator"],
  },
  hydro: {
    Esenciales: ["hydroExcavationPackage", "hydroDiggingGun", "hpDiggingLance", "hpHandGunHoseReel"],
    "Muy recomendables": ["boomRdb", "hpDualAccumulators", "vacCycloneSeparator", "controlWirelessBellyPackHetronicNovaL", "controlWirelessRemoteErgoS"],
    "Según aplicación": ["hpWaterHeaterAlkota", "hydroHydraulicToolPackage", "vacDebrisBodyPump"],
  },
  recycler: {
    Esenciales: ["hpWaterRecycler", "vacLavalSeparator", "hpGrayWaterTank", "hpGrayWaterTankSensor", "hpFilterBackflush"],
    "Muy recomendables": ["hpContinuousFill", "controlLoadLimitAdjustment", "vacDebrisBodyLevelIndicator"],
    Complementarias: ["tanksJoined", "controlWirelessBellyPackHetronicNovaL", "controlWirelessRemoteErgoS", "vacVacuumEnhance"],
  },
};

const PRIORITY_BADGE_CLASS = {
  Esenciales: "bg-red-50 text-red-700 ring-red-200",
  "Muy recomendables": "bg-blue-50 text-blue-700 ring-blue-200",
  "Según aplicación": "bg-amber-50 text-amber-700 ring-amber-200",
  Complementarias: "bg-slate-100 text-slate-700 ring-slate-200",
};

const SECTIONS = {
  basic: [
    {
      title: "Número de cotización",
      fields: [
        ["vacuumSystem", "Sistema de vacío"],
        ["modelType", "Tipo de modelo"],
        ["waterFlow", "Caudal de agua"],
        ["waterPressure", "Presión de agua"],
        ["debrisBody", "Capacidad de tolva de residuos (yd³)"],
        ["waterCapacity", "Capacidad de agua"],
        ["waterTankMaterial", "Material del tanque de agua"],
      ],
      toggles: [["jetRight", "Tecnología JetRight", 5800]],
    },
    {
      title: "Chasis",
      fields: [
        ["source", "Origen"],
        ["modelYear", "Año modelo"],
        ["make", "Marca"],
        ["axleType", "Tipo de eje"],
      ],
      toggles: [["alternateFuel", "Combustible alternativo", 12500]],
    },
  ],
  module: [
    {
      title: "Brazo de succión",
      fields: [["boom", "Brazo"], ["waterRing", "Anillo de agua"]],
      toggles: [["grateLiftingHook", "Gancho levanta rejillas", 950], ["rotatableInlet", "Manguera de entrada rotativa", 2400]],
    },
    {
      title: "Tolva de residuos",
      fields: [
        ["decant", "Decantación"],
        ["pumpOff", "Descarga por bomba"],
        ["cycloneSeparators", "Separadores ciclónicos"],
        ["foldingRackDriver", "Porta tubos plegable lado conductor"],
        ["foldingRackPassenger", "Porta tubos plegable lado pasajero"],
        ["driverRackSize", "Tamaño porta tubos lado conductor"],
        ["passengerRackSize", "Tamaño porta tubos lado pasajero"],
      ],
      toggles: [["digitalDebris", "Indicador digital de nivel de tolva", 1800], ["bodyFlushout", "Lavado interno de tolva", 2600], ["tanksJoined", "Tanques unidos", 3900], ["splashShield", "Protector contra salpicaduras", 1250], ["inspectionPort", "Puerto de inspección", 750], ["floatBall", "Jaula de bola flotante en acero inoxidable", 1400]],
    },
  ],
  water: [
    {
      title: "Carrete de manguera",
      fields: [["hoseReelCapacity", "Capacidad del carrete"], ["highPressureHoseReel", "Carrete de alta presión"], ["rodderHoseType", "Tipo de manguera de limpieza"], ["rodderHoseDiameter", "Diámetro de manguera"], ["rodderHoseLength", "Longitud de manguera"]],
      toggles: [["hoseReelManualRewind", "Herramienta de rebobinado manual", 450], ["wrapHoseReel", "Envolver carrete para entrega", 350], ["pinchRoller", "Rodillo presor", 950], ["heatedHose", "Carrete calefactado", 4200]],
    },
    {
      title: "Tanques de agua",
      fields: [],
      toggles: [["insulatedWaterTanks", "Tanques de agua aislados", 5200], ["secondAirGap", "Segunda separación de aire", 900], ["gravityFill", "Llenado por gravedad", 850], ["frontRearHandguns", "Acoples para pistolas frontal y posterior", 1350], ["lavalSeparator", "Separador Laval", 1800]],
    },
  ],
  electrical: [
    {
      title: "Iluminación",
      fields: [["rearArrowboard", "Flecha direccional trasera"], ["frontArrowboard", "Flecha direccional frontal"], ["rearBeacons", "Balizas traseras"], ["handlight", "Lámpara portátil"], ["cameraSystem", "Sistema de cámaras"], ["worklightsRear", "Luces de trabajo posteriores"]],
      toggles: [["midshipTurnSignals", "Luces direccionales centrales", 850], ["additionalHandlight", "Lámpara portátil adicional conectada", 620], ["worklightsPassenger", "Luces de trabajo lado pasajero", 1150], ["worklightsDriver", "Luces de trabajo lado conductor", 1150], ["hoseReelWorklights", "Luces de trabajo en cassette del carrete", 1250]],
    },
  ],
  systems: [
    {
      title: "Sistema de agua de alta presión",
      fields: [],
      toggles: [["hpAccumulator", "Accumulator", null], ["hpDualAccumulators", "Dual Accumulators", null], ["hpAirPurgeSystem", "Air Purge System", null], ["hpAntiFreezeTank", "Anti-Freeze Tank", null], ["hpContinuousFill", "Continuous Fill", null], ["hpFlusherSystem", "Flusher System", null], ["hpHandGunHoseReel", "Hand Gun Hose Reel", null], ["hpFreewheelOption", "Freewheel Option", null], ["hpDiggingLance", "Digging Lance", null], ["hpWaterHeaterAlkota", "Water Heater (Alkota)", null], ["hpRecirculatorSystem", "Recirculator System", null], ["hpWaterRecycler", "Water Recycler", null], ["hpGrayWaterTank", "Gray Water Tank", null], ["hpGrayWaterTankSensor", "Gray Water Tank Sensor", null], ["hpFilterBackflush", "Filter Backflush", null]],
    },
    {
      title: "Sistema de vacío",
      fields: [],
      toggles: [["vacCycloneSeparator", "Cyclone Separator", null], ["vacLavalSeparator", "Laval Separator", null], ["vacVacuumEnhance", "Vacuum Enhance", null], ["vacDebrisBodyPump", "Debris Body Pump", null], ["vacDebrisBodyLevelIndicator", "Debris Body Level Indicator", null], ["vacOnTheGo", "Vac on the Go", null]],
    },
    {
      title: "Sistema de pluma (Boom)",
      fields: [],
      toggles: [["boom5x5", "5 × 5 Boom", null], ["boomRdb", "RDB Boom", null]],
    },
    {
      title: "Automatización y control",
      fields: [],
      toggles: [["controlAutoWindGuide", "Auto Wind Guide", null], ["controlAutoWindGuideHydraulic", "Auto Wind Guide - Hydraulic", null], ["controlWirelessBellyPackHetronicNovaL", "Wireless Belly Pack (Hetronic Nova L)", null], ["controlWirelessRemoteErgoS", "Wireless Remote ERGO S", null], ["controlLoadLimitAdjustment", "Load Limit Adjustment", null]],
    },
    {
      title: "Hidroexcavación",
      fields: [],
      toggles: [["hydroExcavationPackage", "Hydro-Excavation Package", null], ["hydroDiggingGun", "Digging Gun", null], ["hydroHydraulicToolPackage", "Hydraulic Tool Package", null], ["hydroLateralCleaningKit", "Lateral Cleaning Kit", null]],
    },
  ],
  paint: [
    {
      title: "Pintura",
      fields: [["baseColor", "Color principal"], ["stripe", "Franja decorativa"], ["bodyDecal", "Calcomanía de carrocería"]],
      toggles: [["cabColorMatch", "Igualar color de cabina", 2400], ["clearCoat", "Capa transparente", 3200], ["specialDecals", "Calcomanías especiales", 1450]],
    },
  ],
  accessories: [
    {
      title: "Varios",
      fields: [["safetyRack", "Porta conos de seguridad"], ["operatorManuals", "Manuales de operador"], ["printedManuals", "Manuales impresos"], ["shipmentManuals", "Envío de manuales"], ["extendedWarranty", "Garantía extendida"], ["wirelessRemote", "Control remoto inalámbrico"]],
      toggles: [["spanishDecals", "Calcomanías en español", 420], ["spanishManuals", "Manuales en español", 320], ["waterCooler", "Soporte para enfriador de agua", 950], ["hydraulicToolPkg", "Paquete de herramientas hidráulicas", 6500], ["remotePendant", "Control remoto con cable", 1800], ["wheelChocks", "Cuñas de rueda y soportes", 700]],
    },
    {
      title: "Cajas de herramientas",
      fields: [["subframeToolboxDriver", "Caja bajo bastidor lado conductor"], ["subframeToolboxPassenger", "Caja bajo bastidor lado pasajero"], ["frontBumperStorage", "Almacenamiento en parachoques frontal"]],
      toggles: [["frontHoseStorage", "Almacenamiento frontal para manguera", 1200], ["longHandleToolStorage", "Almacenamiento para herramientas de mango largo", 900]],
    },
  ],
};

const DEFAULT_CONFIG = Object.fromEntries(
  Object.entries(SELECT_OPTIONS).map(([key, options]) => [key, options[0][0]])
);

const DEFAULT_TOGGLES = Object.fromEntries(
  Object.values(SECTIONS)
    .flat()
    .flatMap((section) => section.toggles || [])
    .map(([key]) => [key, false])
);

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatImpact(value) {
  return typeof value === "number" ? money(value) : "Por definir";
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getUsageProfile(profileId) {
  return USAGE_PROFILES.find((profile) => profile.id === profileId) || USAGE_PROFILES[0];
}

function buildPriorityLookup(profileId) {
  return Object.entries(PROFILE_PRIORITIES[profileId] || {}).reduce((lookup, [level, keys]) => {
    keys.forEach((key) => {
      lookup[key] = level;
    });
    return lookup;
  }, {});
}

function getPrioritySummary(profileId, toggles) {
  return Object.entries(PROFILE_PRIORITIES[profileId] || {}).map(([level, keys]) => {
    const missing = keys.filter((key) => !toggles[key]);
    return { level, total: keys.length, selected: keys.length - missing.length, missing };
  });
}

function createInitialQuote() {
  return {
    number: `ASTAP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    customer: "Cliente por definir",
    endCustomer: "Cliente final",
    salesPerson: "ASTAP",
  };
}

function getOptionPrice(key, selected) {
  return SELECT_OPTIONS[key]?.find(([label]) => label === selected)?.[1] || 0;
}

export default function ConfiguradorHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLight } = useTheme();
  const [selectedModelId, setSelectedModelId] = useState("2100i");
  const [showMoreModels, setShowMoreModels] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [savedMessage, setSavedMessage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hideValues, setHideValues] = useState(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [loadingQuoteId, setLoadingQuoteId] = useState("");
  const [retryingPdfId, setRetryingPdfId] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [usageProfileId, setUsageProfileId] = useState("sewer");
  const [editingQuoteId, setEditingQuoteId] = useState("");
  const [quote, setQuote] = useState(createInitialQuote);

  const selectedModel = MODELS.find((model) => model.id === selectedModelId) || MODELS[0];
  const visibleModels = useMemo(
    () => (showMoreModels ? MODELS : MODELS.filter((model) => PRIMARY_MODEL_IDS.includes(model.id))),
    [showMoreModels]
  );
  const usageProfile = getUsageProfile(usageProfileId);
  const priorityLookup = useMemo(() => buildPriorityLookup(usageProfileId), [usageProfileId]);
  const prioritySummary = useMemo(() => getPrioritySummary(usageProfileId, toggles), [toggles, usageProfileId]);

  const priceSummary = useMemo(() => {
    const optionTotal = Object.entries(config).reduce((total, [key, selected]) => total + getOptionPrice(key, selected), 0);
    const toggleTotal = Object.entries(toggles).reduce((total, [key, enabled]) => {
      if (!enabled) return total;
      const toggle = Object.values(SECTIONS).flat().flatMap((section) => section.toggles || []).find(([toggleKey]) => toggleKey === key);
      return total + (typeof toggle?.[2] === "number" ? toggle[2] : 0);
    }, 0);

    return {
      base: selectedModel.basePrice,
      options: optionTotal + toggleTotal,
      total: selectedModel.basePrice + optionTotal + toggleTotal,
    };
  }, [config, selectedModel.basePrice, toggles]);

  const configuredItems = useMemo(() => {
    const selectedFields = Object.entries(config).map(([key, value]) => ({ key, label: findFieldLabel(key), value, price: getOptionPrice(key, value) }));
    const enabledToggles = Object.entries(toggles)
      .filter(([, enabled]) => enabled)
      .map(([key]) => {
        const toggle = Object.values(SECTIONS).flat().flatMap((section) => section.toggles || []).find(([toggleKey]) => toggleKey === key);
        return { key, label: toggle?.[1] || key, value: "Incluido", price: typeof toggle?.[2] === "number" ? toggle[2] : null, info: OPTION_INFO[key] || null, priority: priorityLookup[key] || "" };
      });

    return [...selectedFields, ...enabledToggles].filter((item) => item.price !== 0 || item.value !== SELECT_OPTIONS[item.key]?.[0]?.[0]);
  }, [config, priorityLookup, toggles]);

  const updateQuote = (key, value) => setQuote((prev) => ({ ...prev, [key]: value }));
  const updateConfig = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));
  const updateToggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  const applyProfileRecommendations = (level) => {
    const keys = PROFILE_PRIORITIES[usageProfileId]?.[level] || [];
    setToggles((prev) => ({ ...prev, ...Object.fromEntries(keys.map((key) => [key, true])) }));
    setActiveTab("systems");
    setSavedMessage(`Opciones ${level.toLowerCase()} aplicadas desde la matriz.`);
  };
  const updateShowMoreModels = (enabled) => {
    setShowMoreModels(enabled);
    if (!enabled && !PRIMARY_MODEL_IDS.includes(selectedModelId)) setSelectedModelId("2100i");
  };

  const getQuoteValidationError = () => {
    const missing = [
      ["Cotización No.", quote.number],
      ["Cliente", quote.customer],
      ["Cliente final", quote.endCustomer],
      ["Vendedor", quote.salesPerson],
    ]
      .filter(([, value]) => !String(value || "").trim())
      .map(([label]) => label);

    return missing.length ? `Completa ${missing.join(", ")} antes de continuar.` : "";
  };

  const quotePayload = useMemo(
    () => ({ quote, selectedModelId, selectedModel, config, toggles, priceSummary, items: configuredItems, hideValues, showMoreModels, usageProfileId, usageProfile }),
    [config, configuredItems, hideValues, priceSummary, quote, selectedModel, selectedModelId, showMoreModels, toggles, usageProfile, usageProfileId]
  );

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError("");

    try {
      const rows = await getConfiguratorQuoteHistory();
      setHistory(rows);
    } catch (error) {
      console.error("Error cargando historial del configurador:", error);
      setHistoryError("No se pudo cargar el historial de cotizaciones.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const applyLocalDraft = useCallback((draft) => {
    if (!draft || typeof draft !== "object") return;

    const draftModelId = MODELS.some((model) => model.id === draft.selectedModelId) ? draft.selectedModelId : "2100i";
    setSelectedModelId(draftModelId);
    setShowMoreModels(Boolean(draft.showMoreModels) || !PRIMARY_MODEL_IDS.includes(draftModelId));
    setConfig({ ...DEFAULT_CONFIG, ...(draft.config || {}) });
    setToggles({ ...DEFAULT_TOGGLES, ...(draft.toggles || {}) });
    setUsageProfileId(USAGE_PROFILES.some((profile) => profile.id === draft.usageProfileId) ? draft.usageProfileId : "sewer");
    setEditingQuoteId("");
    setHideValues(Boolean(draft.hideValues));
    setQuote({ ...createInitialQuote(), ...(draft.quote || {}) });
  }, []);

  const restoreLocalDraft = useCallback(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      setHasLocalDraft(Boolean(rawDraft));
      if (!rawDraft) return false;

      applyLocalDraft(JSON.parse(rawDraft));
      setSavedMessage("Borrador local restaurado correctamente.");
      setErrorMessage("");
      setPdfUrl("");
      return true;
    } catch (error) {
      console.error("Error restaurando borrador del configurador:", error);
      setErrorMessage("No se pudo restaurar el borrador local.");
      return false;
    }
  }, [applyLocalDraft]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    restoreLocalDraft();
  }, [restoreLocalDraft]);

  const resetConfigurator = () => {
    setSelectedModelId("2100i");
    setShowMoreModels(false);
    setActiveTab("basic");
    setConfig(DEFAULT_CONFIG);
    setToggles(DEFAULT_TOGGLES);
    setUsageProfileId("sewer");
    setEditingQuoteId("");
    setHideValues(false);
    setQuote(createInitialQuote());
    setSavedMessage("Configurador reiniciado.");
    setErrorMessage("");
    setPdfUrl("");
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasLocalDraft(false);
  };

  const useHistoryQuoteAsBase = async (quoteId) => {
    setLoadingQuoteId(quoteId);
    setSavedMessage("");
    setErrorMessage("");
    setPdfUrl("");

    try {
      const row = await getConfiguratorQuoteById(quoteId);
      if (!row) {
        setErrorMessage("No se encontró la cotización seleccionada.");
        return;
      }

      const modelId = MODELS.some((model) => model.id === row.model_id) ? row.model_id : "2100i";
      setSelectedModelId(modelId);
      setShowMoreModels(!PRIMARY_MODEL_IDS.includes(modelId));
      setConfig({ ...DEFAULT_CONFIG, ...(row.config || {}) });
      setToggles({ ...DEFAULT_TOGGLES, ...(row.toggles || {}) });
      setUsageProfileId("sewer");
      setEditingQuoteId("");
      setQuote({
        ...createInitialQuote(),
        customer: row.customer || "Cliente por definir",
        endCustomer: row.end_customer || "Cliente final",
        salesPerson: row.sales_person || "ASTAP",
      });
      setActiveTab("review");
      setSavedMessage("Cotización histórica cargada como base para una nueva configuración.");
    } catch (error) {
      console.error("Error cargando cotización como base:", error);
      setErrorMessage("No se pudo cargar la cotización seleccionada.");
    } finally {
      setLoadingQuoteId("");
    }
  };

  const editHistoryQuote = async (quoteId) => {
    setLoadingQuoteId(quoteId);
    setSavedMessage("");
    setErrorMessage("");
    setPdfUrl("");

    try {
      const row = await getConfiguratorQuoteById(quoteId);
      if (!row) {
        setErrorMessage("No se encontró la cotización seleccionada.");
        return;
      }

      const modelId = MODELS.some((model) => model.id === row.model_id) ? row.model_id : "2100i";
      setSelectedModelId(modelId);
      setShowMoreModels(!PRIMARY_MODEL_IDS.includes(modelId));
      setConfig({ ...DEFAULT_CONFIG, ...(row.config || {}) });
      setToggles({ ...DEFAULT_TOGGLES, ...(row.toggles || {}) });
      setUsageProfileId("sewer");
      setQuote({
        ...createInitialQuote(),
        number: row.quote_number || createInitialQuote().number,
        customer: row.customer || "Cliente por definir",
        endCustomer: row.end_customer || "Cliente final",
        salesPerson: row.sales_person || "ASTAP",
      });
      setEditingQuoteId(row.id);
      setActiveTab("review");
      setSavedMessage("Cotización cargada en modo edición. Al guardar se actualizará el registro existente.");
    } catch (error) {
      console.error("Error cargando cotización para editar:", error);
      setErrorMessage("No se pudo cargar la cotización para editar.");
    } finally {
      setLoadingQuoteId("");
    }
  };

  const retryQuotePdf = async (quoteId) => {
    setRetryingPdfId(quoteId);
    setSavedMessage("");
    setHistoryError("");

    try {
      const updated = await regenerateConfiguratorQuotePdf(quoteId, { hideValues });
      if (updated?.id) {
        setHistory((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (editingQuoteId === updated.id) setPdfUrl(updated.pdf_url || "");
      }
      setSavedMessage(updated?.status === "pdf_pendiente" ? "El PDF sigue pendiente. Intenta nuevamente más tarde." : "PDF regenerado correctamente.");
    } catch (error) {
      console.error("Error reintentando PDF del configurador:", error);
      setHistoryError(error?.message || "No se pudo regenerar el PDF.");
    } finally {
      setRetryingPdfId("");
    }
  };

  const saveQuote = async () => {
    const validationError = getQuoteValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      setActiveTab("basic");
      return;
    }

    setSaving(true);
    setSavedMessage("");
    setErrorMessage("");
    setPdfUrl("");

    try {
      const payload = { ...quotePayload, savedAt: new Date().toISOString(), createdBy: user?.email || user?.id || "" };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setHasLocalDraft(true);
      const saved = editingQuoteId ? await updateConfiguratorQuote(editingQuoteId, payload) : await saveConfiguratorQuote(payload);
      setPdfUrl(saved?.pdf_url || "");
      if (saved?.id) setHistory((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)].slice(0, 50));
      if (saved?.id) setEditingQuoteId(saved.id);
      setSavedMessage(
        saved?.status === "pdf_pendiente"
          ? "Cotización guardada en Supabase, pero el PDF quedó pendiente. Puedes reintentarlo desde el historial."
          : editingQuoteId
            ? "Cotización actualizada en Supabase y PDF regenerado correctamente."
            : "Cotización guardada en Supabase y PDF generado correctamente."
      );
      setActiveTab("review");
    } catch (error) {
      console.error("Error guardando cotización Vactor:", error);
      setErrorMessage(error?.message || "No se pudo guardar la cotización en Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    setErrorMessage("");
    const validationError = getQuoteValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      setActiveTab("basic");
      return;
    }

    try {
      await downloadConfiguratorPdf(quotePayload);
    } catch (error) {
      console.error("Error generando PDF Vactor:", error);
      setErrorMessage("No se pudo generar el PDF localmente.");
    }
  };

  const saveLocalDraft = () => {
    const payload = { ...quotePayload, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    setHasLocalDraft(true);
    setSavedMessage("Configuración guardada localmente para revisión.");
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            {VEHICULOS_TEXT.configurador.title}
          </h1>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Modelo inicial basado en flujo CPQ: selección de equipo, módulos, opciones, accesorios y revisión.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHideValues((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              hideValues
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {hideValues ? <EyeOff size={16} /> : <Eye size={16} />}
            {hideValues ? "Valores ocultos" : "Ocultar valores"}
          </button>
          <button type="button" onClick={() => navigate("/area/vehiculos")} className="btn-volver-orange">
            Volver
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <ShieldCheck size={26} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Acceso exclusivo habilitado</h2>
              <p className="text-sm leading-6">
                Primera versión interactiva del configurador. Los valores son referenciales y se guardan localmente mientras se validan catálogos, reglas y precios reales.
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            90% de avance
          </span>
        </div>
      </div>

      <section className={`rounded-2xl border p-4 shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-blue-600" />
            <h2 className="font-semibold">Configurar línea Vactor</h2>
          </div>
          <label className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={showMoreModels}
              onChange={(event) => updateShowMoreModels(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Más modelos
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleModels.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModelId(model.id)}
              className={`rounded-2xl border p-3 text-center transition ${
                selectedModelId === model.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : isLight
                  ? "border-slate-200 bg-slate-50 hover:border-blue-200"
                  : "border-white/10 bg-white/5 hover:border-blue-300/40"
              }`}
            >
              <ProductImage model={model} />
              <p className={`mt-3 font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{model.name}</p>
              <p className="text-xs text-blue-600">{model.family}</p>
              <p className="mt-1 text-[11px] text-slate-400">Recorte de lámina Vactor</p>
              {!hideValues && <p className="mt-1 text-xs text-slate-500">Base {money(model.basePrice)}</p>}
            </button>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-col gap-3 border-b border-red-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <TextInput label="Cotización No." value={quote.number} onChange={(value) => updateQuote("number", value)} />
            <ClientTextInput label="Cliente" value={quote.customer} onChange={(value) => updateQuote("customer", value)} />
            <ClientTextInput label="Cliente final" value={quote.endCustomer} onChange={(value) => updateQuote("endCustomer", value)} />
            <TextInput label="Vendedor" value={quote.salesPerson} onChange={(value) => updateQuote("salesPerson", value)} />
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <label className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={hideValues}
                onChange={(event) => setHideValues(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Ocultar valores referenciales en opciones
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white">
              <Calculator size={18} />
              <div>
                <p className="text-xs text-slate-300">{hideValues ? "Modo visual" : "Total"}</p>
                <p className="font-bold">{hideValues ? "Sin valores" : money(priceSummary.total)}</p>
              </div>
            </div>
          </div>
        </div>

        <ProfileMatrixPanel
          usageProfileId={usageProfileId}
          setUsageProfileId={setUsageProfileId}
          prioritySummary={prioritySummary}
          applyProfileRecommendations={applyProfileRecommendations}
        />

        <div className="overflow-x-auto border-b border-red-200 px-4">
          <div className="flex min-w-max gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-700"
                    : isLight
                    ? "border-transparent text-slate-500 hover:text-slate-900"
                    : "border-transparent text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === "review" ? (
            <ReviewPanel quote={quote} selectedModel={selectedModel} priceSummary={priceSummary} items={configuredItems} hideValues={hideValues} usageProfile={usageProfile} prioritySummary={prioritySummary} />
          ) : (
            <div className="space-y-6">
              {(SECTIONS[activeTab] || []).map((section) => (
                <ConfigSection key={section.title} section={section} config={config} toggles={toggles} updateConfig={updateConfig} updateToggle={updateToggle} hideValues={hideValues} priorityLookup={priorityLookup} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {hideValues ? "Modo visual activo: precios ocultos en pantalla y PDF." : <>Base: <strong>{money(priceSummary.base)}</strong> | Opciones: <strong>{money(priceSummary.options)}</strong></>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveTab("review")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Revisar
            </button>
            <button type="button" onClick={saveQuote} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
              <Save size={16} /> {saving ? (editingQuoteId ? "Actualizando..." : "Guardando...") : editingQuoteId ? "Actualizar cotización" : "Guardar en Supabase"}
            </button>
            <button type="button" onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              <Download size={16} /> Descargar PDF
            </button>
            <button type="button" onClick={saveLocalDraft} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Guardar local
            </button>
            <button type="button" onClick={restoreLocalDraft} disabled={!hasLocalDraft} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Restaurar borrador
            </button>
            <button type="button" onClick={resetConfigurator} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
              Reiniciar
            </button>
            <button type="button" onClick={() => navigate("/area/vehiculos")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </div>
        {savedMessage && <p className="px-4 pb-2 text-sm font-semibold text-green-700">{savedMessage}</p>}
        {errorMessage && <p className="px-4 pb-2 text-sm font-semibold text-red-700">{errorMessage}</p>}
        {pdfUrl && editingQuoteId && (
          <button type="button" onClick={() => navigate(`/vehiculos/configurador/ver/${editingQuoteId}`)} className="mx-4 mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
            <FileText size={15} /> Ver vista previa PDF
          </button>
        )}
      </section>

      <HistoryPanel
        history={history}
        loading={loadingHistory}
        loadingQuoteId={loadingQuoteId}
        retryingPdfId={retryingPdfId}
        error={historyError}
        onRefresh={loadHistory}
        onView={(quoteId) => navigate(`/vehiculos/configurador/ver/${quoteId}`)}
        onEdit={editHistoryQuote}
        onUseAsBase={useHistoryQuoteAsBase}
        onRetryPdf={retryQuotePdf}
        hideValues={hideValues}
      />
    </div>
  );
}

function ProductImage({ model }) {
  const [fallback, setFallback] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      const cellWidth = image.naturalWidth / SPRITE_COLUMNS;
      const cellHeight = image.naturalHeight / SPRITE_ROWS;
      const cropHeight = cellHeight * (model.sprite.row === 0 ? 0.72 : 0.6);
      const canvas = document.createElement("canvas");
      canvas.width = cellWidth;
      canvas.height = cropHeight;
      const context = canvas.getContext("2d");

      context.drawImage(
        image,
        model.sprite.col * cellWidth,
        model.sprite.row * cellHeight,
        cellWidth,
        cropHeight,
        0,
        0,
        cellWidth,
        cropHeight
      );

      setImageSrc(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      if (!cancelled) setFallback(true);
    };

    setFallback(false);
    setImageSrc("");
    image.src = VACTOR_LINE_IMAGE;

    return () => {
      cancelled = true;
    };
  }, [model.sprite.col, model.sprite.row]);

  if (fallback) {
    return (
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
        <img src={model.fallbackImage} alt={`Equipo Vactor ${model.name}`} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
      {imageSrc ? (
        <img src={imageSrc} alt={`Equipo Vactor ${model.name}`} className="h-full w-full object-contain" />
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
      )}
    </div>
  );
}

function findFieldLabel(key) {
  for (const section of Object.values(SECTIONS).flat()) {
    const field = section.fields?.find(([fieldKey]) => fieldKey === key);
    if (field) return field[1];
  }
  return key;
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="text-xs font-semibold text-slate-500">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400" />
    </label>
  );
}

function ClientTextInput({ label, value, onChange }) {
  return (
    <label className="text-xs font-semibold text-slate-500">
      {label}
      <ClientReferenceInput
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
        value={value}
        onValueChange={onChange}
        onSelect={(client) => onChange(client.name || "")}
      />
    </label>
  );
}

function ProfileMatrixPanel({ usageProfileId, setUsageProfileId, prioritySummary, applyProfileRecommendations }) {
  return (
    <div className="border-b border-red-200 p-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <label className="text-sm font-semibold text-slate-700">
            Perfil de uso según matriz ASTAP
            <select value={usageProfileId} onChange={(event) => setUsageProfileId(event.target.value)} className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 lg:w-72">
              {USAGE_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.label}</option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => applyProfileRecommendations("Esenciales")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Aplicar esenciales
            </button>
            <button type="button" onClick={() => applyProfileRecommendations("Muy recomendables")} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Aplicar muy recomendables
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {prioritySummary.map((summary) => (
            <div key={summary.level} className="rounded-xl border border-white bg-white/80 p-3 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-2">
                <PriorityBadge priority={summary.level} />
                <span className="font-semibold">{summary.selected}/{summary.total}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {summary.missing.length ? `${summary.missing.length} pendiente(s) de seleccionar` : "Completo para este nivel"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return null;
  return <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${PRIORITY_BADGE_CLASS[priority] || PRIORITY_BADGE_CLASS.Complementarias}`}>{priority}</span>;
}

function ConfigSection({ section, config, toggles, updateConfig, updateToggle, hideValues, priorityLookup }) {
  return (
    <section>
      <h3 className="border-b border-red-300 pb-2 text-sm font-bold text-slate-800">▸ {section.title}</h3>
      <div className="mt-4 grid gap-x-8 gap-y-4 lg:grid-cols-2">
        {(section.fields || []).map(([key, label]) => (
          <label key={key} className="grid gap-1 text-sm text-slate-600 sm:grid-cols-[220px_1fr] sm:items-center">
            <span className="font-medium">* {label}</span>
            <select value={config[key]} onChange={(event) => updateConfig(key, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-400">
              {(SELECT_OPTIONS[key] || []).map(([option, price]) => (
                <option key={option} value={option}>
                  {option}{!hideValues && price ? ` (${money(price)})` : ""}
                </option>
              ))}
            </select>
          </label>
        ))}

        {(section.toggles || []).map(([key, label, price]) => (
          <button key={key} type="button" onClick={() => updateToggle(key)} className="grid gap-1 text-left text-sm text-slate-600 sm:grid-cols-[220px_1fr] sm:items-center">
            <span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-700">{label}</span>
                <PriorityBadge priority={priorityLookup[key]} />
              </span>
              <OptionInfo info={OPTION_INFO[key]} />
            </span>
            <span className="flex items-center gap-3">
              <span className={`relative inline-flex h-6 w-11 rounded-full transition ${toggles[key] ? "bg-blue-600" : "bg-slate-200"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${toggles[key] ? "left-6" : "left-1"}`} />
              </span>
              <span className="text-xs text-slate-500">{toggles[key] ? (hideValues ? "Incluido" : typeof price === "number" ? `Incluido ${money(price)}` : "Incluido (precio por definir)") : "No"}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function OptionInfo({ info }) {
  if (!info) return null;

  return (
    <span className="mt-1 block space-y-1 text-xs font-normal leading-5 text-slate-500">
      <span className="block">{info.function}</span>
      <span className="block">Aplicación: {info.application} | Complejidad: {info.complexity} | {info.reference}</span>
      <span className="block text-slate-600">ASTAP: {info.recommendation}</span>
    </span>
  );
}

function ReviewPanel({ quote, selectedModel, priceSummary, items, hideValues, usageProfile, prioritySummary }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-900"><FileText size={18} /> Datos generales de la cotización</h3>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <p><strong>Cotización:</strong> {quote.number}</p>
            <p><strong>Modelo:</strong> {selectedModel.name}</p>
            <p><strong>Cliente:</strong> {quote.customer}</p>
            <p><strong>Cliente final:</strong> {quote.endCustomer}</p>
            <p><strong>Vendedor:</strong> {quote.salesPerson}</p>
            <p><strong>Perfil matriz:</strong> {usageProfile.label}</p>
            <p><strong>Estado:</strong> En progreso</p>
          </div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <h3 className="flex items-center gap-2 font-bold"><CheckCircle2 size={18} /> Resumen</h3>
          {hideValues ? (
            <>
              <p className="mt-3 text-sm">Documento visual sin valores comerciales.</p>
              <p className="mt-2 text-lg font-bold">Características visibles</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm">Base: {money(priceSummary.base)}</p>
              <p className="text-sm">Opciones: {money(priceSummary.options)}</p>
              <p className="mt-2 text-2xl font-bold">{money(priceSummary.total)}</p>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <h3 className="font-bold text-blue-900">Priorización automática según matriz</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {prioritySummary.map((summary) => (
            <div key={summary.level} className="rounded-xl bg-white p-3 text-sm text-slate-700">
              <PriorityBadge priority={summary.level} />
              <p className="mt-2 font-semibold">{summary.selected}/{summary.total} seleccionadas</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className={`grid ${hideValues ? "grid-cols-1" : "grid-cols-[1fr_120px]"} bg-slate-900 px-4 py-2 text-sm font-semibold text-white`}>
          <span>Configuración seleccionada</span>
          {!hideValues && <span className="text-right">Impacto</span>}
        </div>
        {items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Sin opciones adicionales seleccionadas.</p>
        ) : (
          items.map((item) => (
            <div key={`${item.key}-${item.value}`} className={`grid ${hideValues ? "grid-cols-1" : "grid-cols-[1fr_120px]"} border-t border-slate-200 px-4 py-2 text-sm`}>
              <span>
                <strong>{item.label}:</strong> {item.value}
                {item.priority && <span className="ml-2 inline-flex align-middle"><PriorityBadge priority={item.priority} /></span>}
                {item.info && <span className="mt-1 block text-xs leading-5 text-slate-500">{item.info.function} | {item.info.reference}</span>}
              </span>
              {!hideValues && <span className="text-right font-semibold">{formatImpact(item.price)}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HistoryPanel({ history, loading, loadingQuoteId, retryingPdfId, error, onRefresh, onView, onEdit, onUseAsBase, onRetryPdf, hideValues }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <History size={18} className="text-blue-600" /> Historial de cotizaciones
          </h2>
          <p className="text-sm text-slate-500">Cotizaciones guardadas en Supabase con PDF generado o pendiente de reintento.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        {loading && history.length === 0 ? (
          <p className="text-sm text-slate-500">Cargando historial...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay cotizaciones guardadas.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-3 py-2 font-semibold">Cotización</th>
                <th className="px-3 py-2 font-semibold">Cliente</th>
                <th className="px-3 py-2 font-semibold">Modelo</th>
                {!hideValues && <th className="px-3 py-2 text-right font-semibold">Total</th>}
                <th className="px-3 py-2 font-semibold">Fecha</th>
                <th className="px-3 py-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.map((quote) => (
                <tr key={quote.id} className="border-b border-slate-200 odd:bg-slate-50">
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    <div>{quote.quote_number || "-"}</div>
                    {quote.status === "pdf_pendiente" && <div className="mt-1 text-xs font-semibold text-amber-700">PDF pendiente</div>}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    <div>{quote.customer || "Cliente por definir"}</div>
                    {quote.end_customer && <div className="text-xs text-slate-500">Final: {quote.end_customer}</div>}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{quote.model_name || "Vactor"}</td>
                  {!hideValues && <td className="px-3 py-2 text-right font-semibold text-slate-900">{money(quote.price_summary?.total)}</td>}
                  <td className="px-3 py-2 text-slate-600">{formatDate(quote.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => onView(quote.id)} className="font-semibold text-slate-700 hover:underline">
                        Ver
                      </button>
                      <button type="button" onClick={() => onEdit(quote.id)} disabled={loadingQuoteId === quote.id} className="font-semibold text-blue-700 hover:underline disabled:cursor-wait disabled:opacity-60">
                        Editar
                      </button>
                      <button type="button" onClick={() => onUseAsBase(quote.id)} disabled={loadingQuoteId === quote.id} className="font-semibold text-emerald-700 hover:underline disabled:cursor-wait disabled:opacity-60">
                        {loadingQuoteId === quote.id ? "Cargando..." : "Usar como base"}
                      </button>
                      {quote.pdf_url ? (
                        <button type="button" onClick={() => onView(quote.id)} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
                          <FileText size={14} /> PDF
                        </button>
                      ) : (
                        <button type="button" onClick={() => onRetryPdf(quote.id)} disabled={retryingPdfId === quote.id} className="font-semibold text-amber-700 hover:underline disabled:cursor-wait disabled:opacity-60">
                          {retryingPdfId === quote.id ? "Reintentando..." : "Reintentar PDF"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
