import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { hasLimitedSidebar } from "../src/utils/sidebarMenuAccess.mjs";

test("only Karina receives the limited sidebar, regardless of email casing", () => {
  assert.equal(hasLimitedSidebar("kestevez@astap.com"), true);
  assert.equal(hasLimitedSidebar(" KESTEVEZ@astap.com "), true);
  assert.equal(hasLimitedSidebar("otra.persona@astap.com"), false);
  assert.equal(hasLimitedSidebar(undefined), false);
});

test("the real sidebar renders only Bodega and Recursos for Karina", async () => {
  const mocks = {
    "react-router-dom": "export function useNavigate(){return ()=>{}};export function useLocation(){return {pathname:'/'}}",
    "@/context/AuthContext": "export function useAuth(){return {user:{id:'test',email:globalThis.__sidebarTestEmail},isProveedorVehiculosOnly:false}}",
    "@/hooks/useSpecialModuleAccess": "export function useSpecialModuleAccess(){return {hasSpecialModuleAccess:()=>true,superAdminActivo:false}}",
    "@/services/appUpdatesService": "export async function getUnreadAppUpdatesCount(){return 0}",
    "@/services/chatService": "export async function getUnreadMessageCounts(){return {}}",
    "@/services/resourceUsageService": "export function openExternalResource(){}",
    "@/lib/supabase": "export const supabase = {}",
  };
  const vite = await createServer({
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true, hmr: false },
    plugins: [{
      name: "sidebar-test-mocks",
      enforce: "pre",
      resolveId(source) { if (source.startsWith("\0sidebar-test:")) return source; },
      load(id) { if (id.startsWith("\0sidebar-test:")) return mocks[id.slice("\0sidebar-test:".length)]; },
    }, react()],
    resolve: {
      alias: [
        ...Object.keys(mocks).map((find) => ({ find, replacement: `\0sidebar-test:${find}` })),
        { find: "@", replacement: path.resolve("src") },
      ],
    },
  });
  try {
    const { default: Sidebar } = await vite.ssrLoadModule("/src/layouts/Sidebar.jsx");
    const { ThemeProvider } = await vite.ssrLoadModule("/src/context/ThemeContext.jsx");
    const render = (email, openSidebar = true) => {
      globalThis.__sidebarTestEmail = email;
      return renderToStaticMarkup(React.createElement(ThemeProvider, null,
        React.createElement(Sidebar, { openSidebar, setOpenSidebar: () => {}, isMobile: false })
      ));
    };
    for (const open of [true, false]) {
      const limited = render("kestevez@astap.com", open);
      assert.match(limited, /aria-label="Bodega"/);
      assert.match(limited, /aria-label="Recursos"/);
      assert.doesNotMatch(limited, /aria-label="Vehículos Especiales"/);
      assert.doesNotMatch(limited, /aria-label="Chat interno"/);
      assert.doesNotMatch(limited, /aria-label="Menú principal"/);
    }
    const regular = render("otra.persona@astap.com");
    assert.match(regular, /aria-label="Vehículos Especiales"/);
    assert.match(regular, /Chat interno/);
  } finally {
    delete globalThis.__sidebarTestEmail;
    await vite.close();
  }
});
