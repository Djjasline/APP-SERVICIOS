// src/data/technicians.js

export const TECHNICIANS = [
  // EXISTENTES
  { name: "AVILES SANTIAGO",   phone: "0998511717", email: "smaviles@astap.com" },
  { name: "BRIONES ARIEL",     phone: "0958897066", email: "abriones@astap.com" },
  { name: "CAMPUSANO DIEGO",   phone: "0998739968", email: "serviciosgye@astap.com" },
  { name: "PILLAJO JOSE LUIS", phone: "0983346583", email: "jpillajo@astap.com" },

  // NUEVOS
  { name: "KARIM AMHEZ AMORES", phone: "0983507061", email: "kamhez@astap.com" },
  { name: "PAUCAR PATRICIO",    phone: "0987593732", email: "ppaucar@astap.com" },
  { name: "LEON KLEBER",        phone: "0986897396", email: "kleon@astap.com" },
  { name: "NIETO EDISON",       phone: "0986897438", email: "enieto@astap.com" },
  { name: "CRISTIAN AMAGUAÑA",  phone: "0990172193", email: "ceamaguana@astap.com" },
  { name: "MARLON GUEVARA",     phone: "0995083152", email: "mguevara@astap.com" },
  { name: "DIEGO CAMPUZANO",    phone: "0998739968", email: "serviciosgye@astap.com" },
];

/**
 * 🔍 BUSCADOR FLEXIBLE DE TÉCNICOS
 * Permite buscar por:
 * - Nombre completo
 * - Parte del nombre
 * - Email
 */
export function findTechnician(input) {
  if (!input) return null;

  const q = String(input).trim().toLowerCase();

  return (
    TECHNICIANS.find((t) => {
      const name = t.name.toLowerCase();
      const email = t.email.toLowerCase();

      return (
        name === q ||
        name.startsWith(q) ||
        name.includes(q) ||
        email.includes(q)
      );
    }) || null
  );
}
