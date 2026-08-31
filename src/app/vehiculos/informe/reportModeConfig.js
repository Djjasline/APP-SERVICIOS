export const VEHICLE_REPORT_CONFIGS = {
  informe: {
    tipo: "informe",
    subtipo: "general",
    basePath: "/vehiculos/informe",
    title: "Informe Técnico de Servicio",
    pdfTitle: "INFORME TÉCNICO DE SERVICIO",
    description:
      "Instalación y cambio de repuestos, montaje de elementos y reparación de sistemas. No aplica para inspección ni mantenimiento de equipos.",
    newButtonLabel: "Nuevo Informe Técnico de Servicio",
    saveLabel: "informe",
    savedLabel: "Informe",
    showSurveyLink: true,
  },
  capacitacion: {
    tipo: "capacitacion",
    subtipo: "general",
    basePath: "/vehiculos/capacitacion",
    title: "Informe de Capacitación",
    pdfTitle: "INFORME DE CAPACITACIÓN",
    description:
      "Registro de capacitaciones técnicas, participantes, temas tratados, prácticas realizadas y recomendaciones de seguimiento.",
    newButtonLabel: "Nuevo Informe de Capacitación",
    saveLabel: "informe de capacitación",
    savedLabel: "Informe de capacitación",
    showSurveyLink: false,
  },
};

export function getVehicleReportConfig(reportType = "informe") {
  return VEHICLE_REPORT_CONFIGS[reportType] || VEHICLE_REPORT_CONFIGS.informe;
}
