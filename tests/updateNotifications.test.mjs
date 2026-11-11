import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getRecentUpdateDetails } from "../src/utils/recentUpdateDetails.mjs";

test("recupera detalles de boletines genéricos conocidos sin inventar otros", () => {
  assert.match(getRecentUpdateDetails("github-push-310649618023b767bb2ed1457ae7c0fbb71fd819").message, /Pelican/);
  assert.equal(getRecentUpdateDetails("github-push-0000000000000000000000000000000000000000"), null);
  assert.equal(getRecentUpdateDetails("github-manual-31064961"), null);
});

test("boletines nuevos conservan la descripción del commit y se cargan por páginas", () => {
  const publisher = readFileSync(new URL("../scripts/publish-app-updates.mjs", import.meta.url), "utf8");
  const service = readFileSync(new URL("../src/services/appUpdatesService.js", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/pages/Notifications.jsx", import.meta.url), "utf8");
  assert.match(publisher, /firstLine\(commits\[0\]\?\.message\)/);
  assert.match(service, /\.range\(offset, offset \+ pageSize - 1\)/);
  assert.doesNotMatch(service, /\.limit\(50\)/);
  assert.match(page, /notifications-read/);
  assert.match(page, /Control de cambios \(total\)/);
});
