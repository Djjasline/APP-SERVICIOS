import { PRIVILEGED_EMAILS, isSuperAdminEmail } from "@/constants/privilegedAccess.mjs";

export const CONFIGURADOR_OWNER_EMAIL = PRIVILEGED_EMAILS.superAdmin[0];

export const SPECIAL_MODULE_KEYS = {
  configurador: "configurador",
  cotizador: "cotizador",
  recorridoAgua: "recorrido_agua",
  encuestasSatisfaccion: "encuestas_satisfaccion",
  bodega: "bodega",
  clientes: "clientes",
};

export const SPECIAL_MODULES = [
  {
    key: SPECIAL_MODULE_KEYS.configurador,
    area: "vehiculos",
    tipo: "configurador",
    label: "Configurador de equipos hidrosuccionadores",
    description: "Acceso al configurador de equipos hidrosuccionadores nuevos.",
  },
  {
    key: SPECIAL_MODULE_KEYS.cotizador,
    area: "vehiculos",
    tipo: "cotizador",
    label: "Cotizador de repuestos y servicios",
    description: "Acceso al cotizador comercial conectado a bodega.",
  },
  {
    key: SPECIAL_MODULE_KEYS.recorridoAgua,
    area: "agua",
    tipo: "recorrido_agua",
    label: "Informe de recorrido de agua",
    description: "Acceso al informe de recorrido de Agua y Saneamiento.",
  },
  {
    key: SPECIAL_MODULE_KEYS.encuestasSatisfaccion,
    area: "todos",
    tipo: "encuestas_satisfaccion",
    label: "Encuestas de satisfacción",
    description: "Acceso a las encuestas de satisfacción de las áreas.",
  },
  {
    key: SPECIAL_MODULE_KEYS.bodega,
    area: "operaciones",
    tipo: "bodega",
    label: "Gestión de bodega",
    description: "Acceso al módulo interno de bodega.",
  },
  {
    key: SPECIAL_MODULE_KEYS.clientes,
    area: "operaciones",
    tipo: "clientes",
    label: "Gestión de clientes",
    description: "Acceso al catálogo interno de clientes.",
  },
];

export const SPECIAL_MODULE_BY_KEY = SPECIAL_MODULES.reduce((acc, module) => {
  acc[module.key] = module;
  return acc;
}, {});

export const SPECIAL_MODULE_BY_TIPO = SPECIAL_MODULES.reduce((acc, module) => {
  acc[module.tipo] = module;
  return acc;
}, {});

export function isConfiguratorOwner(email) {
  return isSuperAdminEmail(email);
}
