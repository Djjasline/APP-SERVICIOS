import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the glass sidebar keeps all five visual modes scoped to the sidebar", async () => {
  const css = await read("src/layouts/sidebar.css");
  const sidebar = await read("src/layouts/Sidebar.jsx");
  for (const theme of ["blue", "light", "liquid", "liquid-dark"]) {
    assert.match(css, new RegExp(`\\.astap-sidebar\\[data-sidebar-theme="${theme}"\\]`));
  }
  assert.match(css, /\.astap-sidebar\s*\{[\s\S]*?--sidebar-surface/);
  assert.match(sidebar, /data-sidebar-theme=\{theme\}/);
  assert.match(css, /\.astap-sidebar-item\.is-active/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*hidden/);
});

test("sidebar retains navigation, access controls and mobile close behavior", async () => {
  const sidebar = await read("src/layouts/Sidebar.jsx");
  const layout = await read("src/layouts/MainLayout.jsx");
  assert.match(layout, /<Sidebar[\s\S]*?isMobile=\{isMobile\}/);
  assert.match(sidebar, /if \(isMobile\) setOpenSidebar\(false\)/);
  assert.match(sidebar, /puedeUsarConfigurador/);
  assert.match(sidebar, /puedeUsarBodega/);
  assert.match(sidebar, /hasOnlineChatUsers/);
  assert.match(sidebar, /isActive\("\/operaciones"\) && !isActive\("\/operaciones\/bodega"\)/);
});
