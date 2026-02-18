import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ReportProvider } from "./context/ReportContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReportProvider>
      <App />
    </ReportProvider>
  </React.StrictMode>
);

// 🔹 Registrar Service Worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registrado correctamente:", registration);
      })
      .catch((error) => {
        console.log("Error registrando Service Worker:", error);
      });
  });
}
