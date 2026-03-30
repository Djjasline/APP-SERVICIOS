export const recepcionSchema = {
  conductor: "",
  fecha: "",
  lugarDestino: "",
  ciudad: "",

  vehiculo: "",
  modelo: "",
  combustible: "",
  placa: "",
  color: "",
  picoPlaca: "",

  checklist: {
    interior: {
      gata: false,
      llaveCruz: false,
      luces: false,
      radio: false,
      tapetes: false
    },
    motor: {
      aceite: false,
      refrigerante: false,
      bateria: false,
      fugas: false
    },
    exterior: {
      plumas: false,
      retrovisores: false,
      placas: false,
      llantaEmergencia: false
    }
  },

  combustibleSalida: "",
  combustibleEntrada: "",

  kilometrajeEntrada: "",

  mantenimiento: false,

  observacionesEntrega: "",
  observacionesRecepcion: "",

  firma: null
};
