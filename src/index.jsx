import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ReportProvider } from "./context/ReportContext";

// 👇 IMPORTANTE PARA PWA
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("Nueva versión disponible.");
  },
  onOfflineReady() {
    console.log("App lista para trabajar offline.");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReportProvider>
      <App />
    </ReportProvider>
  </React.StrictMode>
);
