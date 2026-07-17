import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, FileText, Save, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";

const MODELS = [
  { id: "2100i", name: "2100i", family: "Vactor", basePrice: 340000, image: "/hidro-base.png" },
  { id: "ramjet", name: "Ramjet", family: "Vactor", basePrice: 185000, image: "/sistema-de-agua.png" },
  { id: "impact", name: "Impact", family: "Elgin", basePrice: 220000, image: "/barredora-base.png" },
  { id: "global", name: "Global", family: "Vactor", basePrice: 315000, image: "/sistema-de-vacio.png" },
  { id: "water-recycler", name: "Water Recycler", family: "Vactor", basePrice: 410000, image: "/sistema-hidraulico.png" },
];

const TABS = [
  { id: "basic", label: "Basic Model/Chassis" },
  { id: "module", label: "Module" },
  { id: "water", label: "Water System" },
  { id: "electrical", label: "Electrical" },
  { id: "paint", label: "Paint" },
  { id: "accessories", label: "Accessories" },
  { id: "review", label: "Revisión" },
];

const SELECT_OPTIONS = {
  vacuumSystem: [
    ["Roots 824-18 Blower", 0],
    ["Roots 824-15 Blower", -4500],
    ["Fan Flushout System", 3800],
  ],
  modelType: [["Combo", 0], ["Sewer Cleaner", -15000], ["Recycler", 32000]],
  waterFlow: [["80.0", 0], ["60.0", -1800], ["100.0", 2400]],
  waterPressure: [["2500", 0], ["2000", -2200], ["3000", 3200]],
  debrisBody: [["10.0", 0], ["12.0", 9500], ["15.0", 18000]],
  waterCapacity: [["1500", 0], ["1000", -6500], ["1300", -2800], ["1800", 7400]],
  waterTankMaterial: [["Aluminum", 0], ["Stainless Steel", 11500], ["Poly", -3200]],
  source: [["Customer", 0], ["Factory supplied", 42000]],
  modelYear: [["2027", 0], ["2026", -3000], ["2028", 3500]],
  make: [["International", 0], ["Freightliner", 8500], ["Peterbilt", 18000]],
  axleType: [["Tandem", 0], ["Single", -9000], ["Tridem or Pusher", 21000]],
  boom: [["10' Telescoping", 0], ["10' Extendable", 8500], ["Fixed", -3500]],
  waterRing: [["None", 0], ["Standard", 1600], ["Premium", 2800]],
  decant: [["None", 0], ["Yes", 4500]],
  pumpOff: [["None", 0], ["Hydraulic", 6500]],
  cycloneSeparators: [["None", 0], ["Centrifugal Separators", 7200]],
  foldingRackDriver: [["Yes", 0], ["No", -900]],
  foldingRackPassenger: [["Yes", 0], ["No", -900]],
  driverRackSize: [["8", 0], ["6", -600], ["10", 700]],
  passengerRackSize: [["8", 0], ["6", -600], ["10", 700]],
  hoseReelCapacity: [["Standard", 0], ["Extended", 4500]],
  highPressureHoseReel: [["1", 0], ["2", 5600]],
  rodderHoseType: [["Piranha", 0], ["Premium", 1200]],
  rodderHoseDiameter: [["1/2\"", 0], ["3/4\"", 900]],
  rodderHoseLength: [["500'", 0], ["600'", 1400], ["800'", 3600]],
  rearArrowboard: [["None", 0], ["LED beacon light", 1450]],
  frontArrowboard: [["None", 0], ["LED", 1450]],
  rearBeacons: [["Rear Mounted LED Beacon Light", 0], ["None", -800]],
  handlight: [["Handlight with retractable reel", 0], ["None", -650]],
  cameraSystem: [["Rear Only", 0], ["Rear + Side", 2400]],
  worklightsRear: [["None", 0], ["LED", 1600]],
  baseColor: [["White", 0], ["Custom", 4500]],
  stripe: [["Standard", 0], ["Customer supplied", 1300]],
  bodyDecal: [["Standard", 0], ["Spanish", 420], ["Custom", 1450]],
  safetyRack: [["None", 0], ["Standard", 1450]],
  operatorManuals: [["1", 0], ["2", 180], ["Spanish + English", 320]],
  printedManuals: [["None", 0], ["1 Set", 220]],
  shipmentManuals: [["Send to Bill to", 0], ["Send with unit", 0]],
  extendedWarranty: [["None", 0], ["12 months", 6500], ["24 months", 11800]],
  wirelessRemote: [["None", 0], ["Wireless remote", 8400]],
  subframeToolboxDriver: [["None", 0], ["48 x 22 x 34", 3200]],
  subframeToolboxPassenger: [["48 x 22 x 34", 0], ["None", -3200]],
  frontBumperStorage: [["No", 0], ["Yes", 1700]],
};

const SECTIONS = {
  basic: [
    {
      title: "Quote Number",
      fields: [
        ["vacuumSystem", "Vacuum System"],
        ["modelType", "Model Type"],
        ["waterFlow", "Water Flow"],
        ["waterPressure", "Water Pressure"],
        ["debrisBody", "Debris Body Capacity (cu. yd.)"],
        ["waterCapacity", "Water Capacity"],
        ["waterTankMaterial", "Water Tank Material"],
      ],
      toggles: [["jetRight", "JetRight Technology", 5800]],
    },
    {
      title: "Chassis",
      fields: [
        ["source", "Source"],
        ["modelYear", "Model Year"],
        ["make", "Make"],
        ["axleType", "Axle Type"],
      ],
      toggles: [["alternateFuel", "Alternate Fuel", 12500]],
    },
  ],
  module: [
    {
      title: "Boom",
      fields: [["boom", "Boom"], ["waterRing", "Water Ring"]],
      toggles: [["grateLiftingHook", "Grate Lifting Hook", 950], ["rotatableInlet", "Rotatable Inlet Hose", 2400]],
    },
    {
      title: "Debris Body",
      fields: [
        ["decant", "Decant"],
        ["pumpOff", "Pump Off"],
        ["cycloneSeparators", "Cyclone Separators"],
        ["foldingRackDriver", "Folding pipe rack driver side"],
        ["foldingRackPassenger", "Folding pipe rack passenger side"],
        ["driverRackSize", "Driver side Pipe Rack Size"],
        ["passengerRackSize", "Passenger side Pipe Rack Size"],
      ],
      toggles: [["digitalDebris", "Digital Debris Body Level Indicator", 1800], ["bodyFlushout", "Body Flushout", 2600], ["tanksJoined", "Tanks Joined", 3900], ["splashShield", "Splash Shield", 1250], ["inspectionPort", "Inspection Port", 750], ["floatBall", "Stainless Steel Float Ball Cage", 1400]],
    },
  ],
  water: [
    {
      title: "Hose Reel",
      fields: [["hoseReelCapacity", "Hose Reel Capacity"], ["highPressureHoseReel", "High Pressure Hose Reel"], ["rodderHoseType", "Rodder Hose Type"], ["rodderHoseDiameter", "Rodder Hose Diameter"], ["rodderHoseLength", "Rodder Hose Length"]],
      toggles: [["hoseReelManualRewind", "Hose reel manual rewind tool", 450], ["wrapHoseReel", "Wrap hose reel for delivery", 350], ["pinchRoller", "Pinch Roller", 950], ["heatedHose", "Heated hose reel", 4200]],
    },
    {
      title: "Water Tanks",
      fields: [],
      toggles: [["insulatedWaterTanks", "Insulated Water Tanks", 5200], ["secondAirGap", "Second Air Gap", 900], ["gravityFill", "Gravity Fill", 850], ["frontRearHandguns", "Front and Rear Handgun Couplers", 1350], ["lavalSeparator", "Laval Separator", 1800]],
    },
  ],
  electrical: [
    {
      title: "Lighting",
      fields: [["rearArrowboard", "Rear arrowboard"], ["frontArrowboard", "Front arrowboard"], ["rearBeacons", "Rear beacons"], ["handlight", "Handlight"], ["cameraSystem", "Camera System"], ["worklightsRear", "Worklights, Rear"]],
      toggles: [["midshipTurnSignals", "Midship turn signals", 850], ["additionalHandlight", "Additional handlight connected", 620], ["worklightsPassenger", "Worklights, passenger side", 1150], ["worklightsDriver", "Worklights, driver side", 1150], ["hoseReelWorklights", "Worklights, hose reel cassette", 1250]],
    },
  ],
  paint: [
    {
      title: "Paint",
      fields: [["baseColor", "Main Color"], ["stripe", "Striping"], ["bodyDecal", "Body Decal"]],
      toggles: [["cabColorMatch", "Cab Color Match", 2400], ["clearCoat", "Clear Coat", 3200], ["specialDecals", "Special Decals", 1450]],
    },
  ],
  accessories: [
    {
      title: "Misc",
      fields: [["safetyRack", "Safety cone storage rack"], ["operatorManuals", "Operator Manuals"], ["printedManuals", "Printed Manuals"], ["shipmentManuals", "Shipment of Manuals"], ["extendedWarranty", "Extended Warranty"], ["wirelessRemote", "Wireless Remote"]],
      toggles: [["spanishDecals", "Spanish Decals", 420], ["spanishManuals", "Spanish Manuals", 320], ["waterCooler", "Water Cooler Storage Rack", 950], ["hydraulicToolPkg", "Hydraulic tool pkg", 6500], ["remotePendant", "Remote Corded Pendant", 1800], ["wheelChocks", "Wheel Chocks and Holders", 700]],
    },
    {
      title: "Toolbox",
      fields: [["subframeToolboxDriver", "Subframe toolbox Driver Side"], ["subframeToolboxPassenger", "Subframe toolbox Passenger Side"], ["frontBumperStorage", "Front Bumper Storage"]],
      toggles: [["frontHoseStorage", "Front hose reel storage", 1200], ["longHandleToolStorage", "Long Handle Tool Storage", 900]],
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
    currency: "USD",
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
          <h2 className="font-semibold">Configure Vactor / Elgin</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <div className="flex h-24 items-center justify-center rounded-xl bg-white p-2">
                <img src={model.image} alt={model.name} className="max-h-20 object-contain" />
              </div>
              <p className={`mt-3 font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{model.name}</p>
              <p className="text-xs text-blue-600">{model.family}</p>
              <p className="mt-1 text-xs text-slate-500">Base {money(model.basePrice)}</p>
            </button>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border shadow-sm ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-col gap-3 border-b border-red-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <TextInput label="Quote No." value={quote.number} onChange={(value) => updateQuote("number", value)} />
            <TextInput label="Customer" value={quote.customer} onChange={(value) => updateQuote("customer", value)} />
            <TextInput label="End Customer" value={quote.endCustomer} onChange={(value) => updateQuote("endCustomer", value)} />
            <TextInput label="Sales Person" value={quote.salesPerson} onChange={(value) => updateQuote("salesPerson", value)} />
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
              Update
            </button>
            <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Save size={16} /> Save
            </button>
            <button type="button" onClick={() => navigate("/area/vehiculos")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
        {savedMessage && <p className="px-4 pb-4 text-sm font-semibold text-green-700">{savedMessage}</p>}
      </section>
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
          <h3 className="flex items-center gap-2 font-bold text-slate-900"><FileText size={18} /> Transaction Header Details</h3>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <p><strong>Quote:</strong> {quote.number}</p>
            <p><strong>Model:</strong> {selectedModel.name}</p>
            <p><strong>Customer:</strong> {quote.customer}</p>
            <p><strong>End Customer:</strong> {quote.endCustomer}</p>
            <p><strong>Sales Person:</strong> {quote.salesPerson}</p>
            <p><strong>Status:</strong> In Progress</p>
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
