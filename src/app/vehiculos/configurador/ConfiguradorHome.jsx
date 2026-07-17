import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, FileText, Save, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";

const MODELS = [
  { id: "2100i", name: "2100i", family: "Vactor", basePrice: 340000, fallbackImage: "/hidro-base.png", sprite: { col: 0, row: 0 } },
  { id: "water-recycler", name: "Water Recycler", family: "Vactor", basePrice: 410000, fallbackImage: "/hidro-base.png", sprite: { col: 1, row: 0 } },
  { id: "impact", name: "iMPACT", family: "Vactor", basePrice: 220000, fallbackImage: "/hidro-base.png", sprite: { col: 2, row: 0 } },
  { id: "2100i-cb", name: "2100i CB", family: "Vactor", basePrice: 355000, fallbackImage: "/hidro-base.png", sprite: { col: 3, row: 0 } },
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

function getOptionPrice(key, selected) {
  return SELECT_OPTIONS[key]?.find(([label]) => label === selected)?.[1] || 0;
}

export default function ConfiguradorHome() {
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [selectedModelId, setSelectedModelId] = useState("2100i");
  const [activeTab, setActiveTab] = useState("basic");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [savedMessage, setSavedMessage] = useState("");
  const [quote, setQuote] = useState({
    number: `ASTAP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    customer: "Cliente por definir",
    endCustomer: "Cliente final",
    salesPerson: "ASTAP",
  });

  const selectedModel = MODELS.find((model) => model.id === selectedModelId) || MODELS[0];

  const priceSummary = useMemo(() => {
    const optionTotal = Object.entries(config).reduce((total, [key, selected]) => total + getOptionPrice(key, selected), 0);
    const toggleTotal = Object.entries(toggles).reduce((total, [key, enabled]) => {
      if (!enabled) return total;
      const toggle = Object.values(SECTIONS).flat().flatMap((section) => section.toggles || []).find(([toggleKey]) => toggleKey === key);
      return total + (toggle?.[2] || 0);
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
        return { key, label: toggle?.[1] || key, value: "Incluido", price: toggle?.[2] || 0 };
      });

    return [...selectedFields, ...enabledToggles].filter((item) => item.price !== 0 || item.value !== SELECT_OPTIONS[item.key]?.[0]?.[0]);
  }, [config, toggles]);

  const updateQuote = (key, value) => setQuote((prev) => ({ ...prev, [key]: value }));
  const updateConfig = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));
  const updateToggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const saveDraft = () => {
    const payload = { quote, selectedModelId, config, toggles, priceSummary, savedAt: new Date().toISOString() };
    localStorage.setItem("astap-configurador-draft", JSON.stringify(payload));
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

        <button type="button" onClick={() => navigate("/area/vehiculos")} className="btn-volver-orange">
          Volver
        </button>
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
            55% de avance
          </span>
        </div>
      </div>

      <section className={`rounded-2xl border p-4 shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Truck size={18} className="text-blue-600" />
          <h2 className="font-semibold">Configurar línea Vactor</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((model) => (
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
              <p className="mt-1 text-xs text-slate-500">Base {money(model.basePrice)}</p>
            </button>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-col gap-3 border-b border-red-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <TextInput label="Cotización No." value={quote.number} onChange={(value) => updateQuote("number", value)} />
            <TextInput label="Cliente" value={quote.customer} onChange={(value) => updateQuote("customer", value)} />
            <TextInput label="Cliente final" value={quote.endCustomer} onChange={(value) => updateQuote("endCustomer", value)} />
            <TextInput label="Vendedor" value={quote.salesPerson} onChange={(value) => updateQuote("salesPerson", value)} />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white">
            <Calculator size={18} />
            <div>
              <p className="text-xs text-slate-300">Total</p>
              <p className="font-bold">{money(priceSummary.total)}</p>
            </div>
          </div>
        </div>

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
            <ReviewPanel quote={quote} selectedModel={selectedModel} priceSummary={priceSummary} items={configuredItems} />
          ) : (
            <div className="space-y-6">
              {(SECTIONS[activeTab] || []).map((section) => (
                <ConfigSection key={section.title} section={section} config={config} toggles={toggles} updateConfig={updateConfig} updateToggle={updateToggle} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Base: <strong>{money(priceSummary.base)}</strong> | Opciones: <strong>{money(priceSummary.options)}</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveTab("review")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Revisar
            </button>
            <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Save size={16} /> Guardar
            </button>
            <button type="button" onClick={() => navigate("/area/vehiculos")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </div>
        {savedMessage && <p className="px-4 pb-4 text-sm font-semibold text-green-700">{savedMessage}</p>}
      </section>
    </div>
  );
}

function ProductImage({ model }) {
  const [fallback, setFallback] = useState(false);

  if (fallback) {
    return (
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
        <img src={model.fallbackImage} alt={`Equipo Vactor ${model.name}`} className="h-full w-full object-contain" />
      </div>
    );
  }

  const translateX = model.sprite.col * -25;
  const translateY = model.sprite.row * -50;

  return (
    <div className="relative h-32 overflow-hidden rounded-xl bg-white">
      <img
        src="/vactor-linea.png"
        alt={`Equipo Vactor ${model.name}`}
        onError={() => setFallback(true)}
        className="absolute left-0 top-0 h-[200%] w-[400%] max-w-none"
        style={{ transform: `translate(${translateX}%, ${translateY}%)` }}
      />
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

function ConfigSection({ section, config, toggles, updateConfig, updateToggle }) {
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
                  {option}{price ? ` (${money(price)})` : ""}
                </option>
              ))}
            </select>
          </label>
        ))}

        {(section.toggles || []).map(([key, label, price]) => (
          <button key={key} type="button" onClick={() => updateToggle(key)} className="grid gap-1 text-left text-sm text-slate-600 sm:grid-cols-[220px_1fr] sm:items-center">
            <span className="font-medium">{label}</span>
            <span className="flex items-center gap-3">
              <span className={`relative inline-flex h-6 w-11 rounded-full transition ${toggles[key] ? "bg-blue-600" : "bg-slate-200"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${toggles[key] ? "left-6" : "left-1"}`} />
              </span>
              <span className="text-xs text-slate-500">{toggles[key] ? `Incluido ${money(price)}` : "No"}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReviewPanel({ quote, selectedModel, priceSummary, items }) {
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
            <p><strong>Estado:</strong> En progreso</p>
          </div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <h3 className="flex items-center gap-2 font-bold"><CheckCircle2 size={18} /> Resumen</h3>
          <p className="mt-3 text-sm">Base: {money(priceSummary.base)}</p>
          <p className="text-sm">Opciones: {money(priceSummary.options)}</p>
          <p className="mt-2 text-2xl font-bold">{money(priceSummary.total)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1fr_120px] bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          <span>Configuración seleccionada</span>
          <span className="text-right">Impacto</span>
        </div>
        {items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Sin opciones adicionales seleccionadas.</p>
        ) : (
          items.map((item) => (
            <div key={`${item.key}-${item.value}`} className="grid grid-cols-[1fr_120px] border-t border-slate-200 px-4 py-2 text-sm">
              <span><strong>{item.label}:</strong> {item.value}</span>
              <span className="text-right font-semibold">{money(item.price)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
