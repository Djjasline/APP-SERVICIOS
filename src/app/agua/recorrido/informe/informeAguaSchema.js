// ─────────────────────────────────────────────
//  informeAguaSchema.js
//  Schema para Informe de Avance EPMAPS – Agua
// ─────────────────────────────────────────────

export const informeAguaSchema = {
  // ── Encabezado ──────────────────────────────
  periodo: "",          // ej. "Mayo 2026 - 2 Semana (del 11 al 17 de mayo)"
  contrato: "GJ-GAL-2024-009",
  pedido: "4300002327",
  supervisor: "ING. PAUL DE LA CRUZ",
  administrador: "ING. GALO ALVAREZ",

  // ── Actividades (array dinámico) ─────────────
  actividades: [
    // Cada elemento representa una Orden de Trabajo + Item UMED
    {
      id: crypto.randomUUID?.() ?? Date.now().toString(),

      // Orden de trabajo
      ordenNumero: "",          // ej. "UMED-702-2026"
      unidadOperativa: "",      // ej. "UNIDAD OPERATIVA NORTE CIUDAD"
      lugar: "",                // ej. "TANQUE SAN IGNACIO"
      fechaSolicitud: "",       // ej. "11 DE MAYO DE 2026"
      fechaEjecucion: "",       // fecha de la visita (input date)
      imagenOrden: null,        // URL de la foto del documento OT

      // Descripción de actividades realizadas
      comprobacionOperativa: true,
      mantenimientoHidraulico: true,
      mantenimientoElectrico: false,
      limpiezaGeneral: true,
      registroDocumentacion: true,
      observacionesAdicionales: "",  // ej. "Se cambió sensor de balanza"

      // Mediciones
      pesoCilindros: "",   // ej. "50 kg y 56 kg"
      cloroResidual: "",   // ej. "1.05"
      dosisCl: "",         // ej. "3 PPD y 3 PPD"
      voltaje: "",         // ej. "230"    (solo si hay mantenimiento eléctrico)
      corriente: "",       // ej. "4.94"   (solo si hay mantenimiento eléctrico)

      // Fotos de la actividad
      fotografias: [],     // array de { url, descripcion }

      // Estado sistema
      sistemaHabilitado: true,
      observacionSistema: "",
    },
  ],

  // ── Nota final ───────────────────────────────
  notaFinal: "",

  // ── Firmas ───────────────────────────────────
  firmas: {
    tecnico: "",
    supervisor: "",
  },
};

export const cloneInformeAguaSchema = () =>
  JSON.parse(JSON.stringify(informeAguaSchema));

// Genera una actividad vacía con UUID único
export const nuevaActividad = () => ({
  id: Date.now().toString(),
  ordenNumero: "",
  unidadOperativa: "",
  lugar: "",
  fechaSolicitud: "",
  fechaEjecucion: "",
  imagenOrden: null,
  comprobacionOperativa: true,
  mantenimientoHidraulico: true,
  mantenimientoElectrico: false,
  limpiezaGeneral: true,
  registroDocumentacion: true,
  observacionesAdicionales: "",
  pesoCilindros: "",
  cloroResidual: "",
  dosisCl: "",
  voltaje: "",
  corriente: "",
  fotografias: [],
  sistemaHabilitado: true,
  observacionSistema: "",
});
