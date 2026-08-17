export const ROLES = {
  superAdmin: "super_admin",
  admin: "admin",
  tecnico: "tecnico",
  supervisorOperaciones: "supervisor_operaciones",
  supervisorProyecto: "supervisor_proyecto",
  proveedorVehiculos: "proveedor_vehiculos",
  usuario: "usuario",
  comercial: "comercial",
};

export const PRIVILEGED_EMAILS = {
  superAdmin: ["smaviles@astap.com"],
  supervisorOperaciones: ["kamhez@astap.com"],
  supervisorProyecto: ["abriones@astap.com"],
  technicalUsers: ["abriones@astap.com"],
};

export const COMMERCIAL_ROLES = ["ing. comercial", "ingeniero comercial", ROLES.comercial];

export const TECHNICAL_ROLES = [
  ROLES.superAdmin,
  ROLES.admin,
  ROLES.tecnico,
  ROLES.supervisorOperaciones,
  ROLES.supervisorProyecto,
];

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
export const normalizeRole = (value) => String(value || "").trim().toLowerCase();

export const isSuperAdminEmail = (email) => PRIVILEGED_EMAILS.superAdmin.includes(normalizeEmail(email));
export const isSupervisorOperacionesEmail = (email) =>
  PRIVILEGED_EMAILS.supervisorOperaciones.includes(normalizeEmail(email));
export const isSupervisorProyectoEmail = (email) =>
  PRIVILEGED_EMAILS.supervisorProyecto.includes(normalizeEmail(email));

export function getEmailRoles(emailValue) {
  const email = normalizeEmail(emailValue);

  return [
    isSuperAdminEmail(email) ? ROLES.superAdmin : null,
    isSupervisorOperacionesEmail(email) ? ROLES.supervisorOperaciones : null,
    isSupervisorProyectoEmail(email) ? ROLES.supervisorProyecto : null,
    PRIVILEGED_EMAILS.technicalUsers.includes(email) ? ROLES.tecnico : null,
  ].filter(Boolean);
}

export function resolveAuthAccess({ email, profileRole }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedProfileRole = normalizeRole(profileRole);
  const emailRoles = getEmailRoles(normalizedEmail);
  const role = emailRoles[0] || normalizedProfileRole || ROLES.usuario;
  const hasCommercialAccess = COMMERCIAL_ROLES.includes(normalizedProfileRole);
  const hasTechnicalAccess =
    PRIVILEGED_EMAILS.technicalUsers.includes(normalizedEmail) ||
    emailRoles.some((emailRole) => TECHNICAL_ROLES.includes(emailRole)) ||
    TECHNICAL_ROLES.includes(normalizedProfileRole);

  const roles = Array.from(
    new Set([
      role,
      ...emailRoles,
      normalizedProfileRole,
      ...(hasCommercialAccess ? [ROLES.comercial] : []),
      ...(hasTechnicalAccess ? [ROLES.tecnico] : []),
    ].filter(Boolean))
  );

  return {
    email: normalizedEmail,
    role,
    roles,
    isSuperAdmin: roles.includes(ROLES.superAdmin),
    isSupervisorOperaciones: roles.includes(ROLES.supervisorOperaciones),
    isProveedorVehiculos: roles.includes(ROLES.proveedorVehiculos),
    isSupervisorProyecto: roles.includes(ROLES.supervisorProyecto),
    isTechnicalUser: hasTechnicalAccess || roles.includes(ROLES.tecnico),
  };
}
