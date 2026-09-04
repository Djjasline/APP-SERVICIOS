import assert from "node:assert/strict";
import test from "node:test";

import { getDraftTime, pickNewestDraft, toDraftPayload } from "../src/utils/draftSelection.mjs";
import { ROLES, getEmailRoles, resolveAuthAccess } from "../src/constants/privilegedAccess.mjs";
import { buildCompletedRecordPdfAttachment, normalizeChatAttachments } from "../src/utils/chatAttachments.mjs";

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

test("normalizeChatAttachments descarta adjuntos sin URL", () => {
  assert.deepEqual(
    normalizeChatAttachments([
      { title: "Sin URL" },
      { type: "completed_record_pdf", title: "PDF", url: "/vehiculos/informe/pdf/1", extra: "ignorar" },
      { type: "gif", title: "GIF", url: "https://media.giphy.com/media/test/giphy.gif", description: "media.giphy.com" },
    ]),
    [
      {
        type: "completed_record_pdf",
        title: "PDF",
        url: "/vehiculos/informe/pdf/1",
        description: "",
        record_id: undefined,
        area: undefined,
        tipo: undefined,
        subtipo: undefined,
      },
      {
        type: "gif",
        title: "GIF",
        url: "https://media.giphy.com/media/test/giphy.gif",
        description: "media.giphy.com",
        record_id: undefined,
        area: undefined,
        tipo: undefined,
        subtipo: undefined,
      },
    ]
  );
});

test("buildCompletedRecordPdfAttachment crea enlace interno de PDF", () => {
  const attachment = buildCompletedRecordPdfAttachment(
    {
      id: "abc",
      area: "vehiculos",
      tipo: "informe",
      subtipo: "general",
      data: { cliente: "Cliente ASTAP", codInf: "INF-001" },
    },
    { area: "vehiculos", tipo: "informe", subtipo: "general", label: "Informe vehículos", path: (id) => `/vehiculos/informe/pdf/${id}` }
  );

  assert.equal(attachment.type, "completed_record_pdf");
  assert.equal(attachment.title, "Informe vehículos - General");
  assert.equal(attachment.description, "Cliente ASTAP · INF-001");
  assert.equal(attachment.url, "/vehiculos/informe/pdf/abc");
});
