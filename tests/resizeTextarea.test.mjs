import test from "node:test";
import assert from "node:assert/strict";
import { resizeTextarea } from "../src/components/resizeTextarea.mjs";

test("ajusta a la altura real, incluye bordes y permite reducir al borrar", () => {
  let contentHeight = 180;
  const element = {
    clientWidth: 200,
    style: { height: "500px" },
    get scrollHeight() {
      assert.equal(this.style.height, "auto");
      return contentHeight;
    },
  };
  const getStyle = () => ({ borderTopWidth: "1px", borderBottomWidth: "2px" });
  resizeTextarea(element, getStyle);
  assert.equal(element.style.height, "183px");
  contentHeight = 30;
  resizeTextarea(element, getStyle);
  assert.equal(element.style.height, "33px");
});

test("no modifica un campo oculto hasta que se pueda medir", () => {
  const element = { clientWidth: 0, style: { height: "120px" } };
  resizeTextarea(element, () => { throw new Error("No debe medir un campo oculto"); });
  assert.equal(element.style.height, "120px");
});
