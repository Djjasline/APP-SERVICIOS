import assert from "node:assert/strict";
import test from "node:test";

import { getDraftTime, pickNewestDraft, toDraftPayload } from "../src/utils/draftSelection.mjs";
import { ROLES, getEmailRoles, resolveAuthAccess } from "../src/constants/privilegedAccess.mjs";

test("resolveAuthAccess normaliza roles y aplica privilegios por correo", () => {
  const access = resolveAuthAccess({
    email: " SMAVILES@ASTAP.COM ",
    profileRole: "usuario",
  });

  assert.equal(access.email, "smaviles@astap.com");
  assert.equal(access.role, ROLES.superAdmin);
  assert.equal(access.isSuperAdmin, true);
  assert.equal(access.isTechnicalUser, true);
  assert.deepEqual(access.roles, [ROLES.superAdmin, "usuario", ROLES.tecnico]);
});

test("resolveAuthAccess conserva acceso comercial sin convertirlo en tecnico", () => {
  const access = resolveAuthAccess({
    email: "ventas@astap.com",
    profileRole: "Ing. Comercial",
  });

  assert.equal(access.role, "ing. comercial");
  assert.equal(access.isTechnicalUser, false);
  assert.equal(access.roles.includes(ROLES.comercial), true);
});

test("getEmailRoles conserva privilegios multiples de un correo", () => {
  assert.deepEqual(getEmailRoles("abriones@astap.com"), [ROLES.supervisorProyecto, ROLES.tecnico]);
});

test("pickNewestDraft elige el borrador con fecha mas reciente", () => {
  const localDraft = toDraftPayload({ campo: "local" }, "2026-01-01T00:00:00.000Z");
  const remoteDraft = toDraftPayload({ campo: "remoto" }, "2026-01-02T00:00:00.000Z");

  assert.equal(pickNewestDraft(localDraft, remoteDraft), remoteDraft);
  assert.equal(pickNewestDraft(remoteDraft, localDraft), remoteDraft);
});

test("getDraftTime trata fechas invalidas como borradores antiguos", () => {
  assert.equal(getDraftTime({ guardadoEn: "fecha-invalida" }), 0);
  assert.equal(pickNewestDraft({ guardadoEn: "fecha-invalida" }, null)?.guardadoEn, "fecha-invalida");
});
