import test from "node:test";
import assert from "node:assert/strict";
import { getDashboardRecordPreviewUrl as preview } from "../src/utils/dashboardRecordPreview.mjs";

test("actividad reciente abre vistas previas segun area, tipo y subtipo", () => {
  const cases = [
    [{ area: "vehiculos", tipo: "informe" }, "/vehiculos/informe/ver/1"],
    [{ area: "vehiculos", tipo: "capacitacion" }, "/vehiculos/capacitacion/ver/1"],
    [{ area: "vehiculos", tipo: "inspeccion", subtipo: "barredora" }, "/vehiculos/inspeccion/barredora/ver/1"],
    [{ area: "vehiculos", tipo: "inspeccion", subtipo: "camara" }, "/vehiculos/inspeccion/camara/ver/1"],
    [{ area: "vehiculos", tipo: "mantenimiento", subtipo: "vcam" }, "/vehiculos/mantenimiento/vcam/ver/1"],
    [{ area: "vehiculos", tipo: "mantenimiento", subtipo: "barredora-road-wizard" }, "/vehiculos/mantenimiento/barredora-road-wizard/ver/1"],
    [{ area: "agua", tipo: "informe", subtipo: "avance_epmaps" }, "/agua/recorrido/informe/ver/1"],
    [{ area: "industria", tipo: "informe" }, "/industria/informe/ver/1"],
    [{ area: "petroleo", tipo: "visita_campo" }, "/petroleo/visita-campo/ver/1"],
    [{ area: "operaciones", tipo: "recepcion" }, "/operaciones/recepcion/ver/1"],
    [{ area: "operaciones", tipo: "protocolo", subtipo: "camara-vcam6" }, "/operaciones/protocolos/vcam/ver/1"],
    [{ area: "vehiculos", tipo: "protocolo", subtipo: "camara-vcam6" }, "/vehiculos/protocolos/vcam/ver/1"],
  ];
  for (const [record, expected] of cases) assert.equal(preview({ id: "1", ...record }), expected);
});

test("tipos desconocidos no abren formularios equivocados", () => {
  assert.equal(preview({ id: "1", area: "vehiculos", tipo: "inspeccion", subtipo: "desconocido" }), null);
  assert.equal(preview({ id: "1", area: "agua", tipo: "desconocido" }), null);
  assert.equal(preview({ area: "agua", tipo: "informe" }), null);
});
