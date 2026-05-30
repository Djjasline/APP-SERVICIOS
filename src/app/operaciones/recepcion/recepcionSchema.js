export const documentosVehiculo = [
  { key: "soat", label: "SOAT:" },
  { key: "manualSeguradora", label: "MANUAL SEGURADORA" },
  { key: "matricula", label: "MATRICULA" },
];

export const checklistVehiculo = {
  interior: [
    { key: "gata", label: "GATA" },
    { key: "llaveCruz", label: "LLAVE TIPO CRUZ" },
    { key: "extintor", label: "EXTINTOR" },
    { key: "luzCabina", label: "LUZ CABINA" },
    { key: "radioMascarilla", label: "RADIO (MASCARILLA)" },
    { key: "tapetesCaucho", label: "TAPETES (CAUCHO)" },
    { key: "encendedor", label: "ENCENDEDOR" },
    { key: "aireAcondicionado", label: "AIRE ACONDICIONADO" },
    { key: "alarma", label: "ALARMA" },
  ],
  motor: [
    { key: "aceiteMotor", label: "ACEITE DE MOTOR" },
    { key: "refrigerante", label: "REFRIGERANTE" },
    { key: "bateriaEstadoAceptable", label: "BATERIA ESTADO ACEPTABLE" },
    { key: "taponAceiteFugas", label: "TAPON ACEITE (FUGAS)" },
    { key: "tapaCombustible", label: "TAPA COMBUSTIBLE" },
    { key: "tapaRadiadorFugas", label: "TAPA RADIADOR (FUGAS)" },
  ],
  exterior: [
    { key: "plumas", label: "PLUMAS" },
    { key: "retrovisor", label: "RETROVISOR" },
    { key: "placas", label: "PLACAS" },
    { key: "llantaEmergencia", label: "LLANTA EMERGENCIA" },
    { key: "tapacubos", label: "TAPACUBOS" },
    { key: "lucesObservaciones", label: "LUCES (PONER OBSERVACIONES)" },
  ],
};

export const recepcionSchema = {
  conductor: "",
  fecha: "",
  lugarDestino: "",
  ciudad: "",

  modelo: "LUV D-MAX",
  seleccionado: false,
  combustible: "DIESEL",
  totalCombustible: "",
  placa: "",
  color: "BLANCO",
  picoPlaca: "",
  pedidoDemanda: "",
  kilometrosSalida: "",

  documentos: {
    soat: "",
    manualSeguradora: "",
    matricula: "",
  },

  checklist: {
    interior: {
      gata: "",
      llaveCruz: "",
      extintor: "",
      luzCabina: "",
      radioMascarilla: "",
      tapetesCaucho: "",
      encendedor: "",
      aireAcondicionado: "",
      alarma: "",
    },
    motor: {
      aceiteMotor: "",
      refrigerante: "",
      bateriaEstadoAceptable: "",
      taponAceiteFugas: "",
      tapaCombustible: "",
      tapaRadiadorFugas: "",
    },
    exterior: {
      plumas: "",
      retrovisor: "",
      placas: "",
      llantaEmergencia: "",
      tapacubos: "",
      lucesObservaciones: "",
    },
  },

  observacionesMotor: ["", ""],
  combustibleSalida: 1,

  danos: {
    puntos: [],
  },

  observacionesEntrega: "",

  recepcion: {
    combustibleLlegada: 1,
    kilometrosLlegada: "",
    mantenimiento: "",
  },

  firmas: {
    responsable: "",
    recepcionFinal: "",
  },

  observacionesRecepcion: "",
};

export const cloneRecepcionSchema = () =>
  JSON.parse(JSON.stringify(recepcionSchema));
