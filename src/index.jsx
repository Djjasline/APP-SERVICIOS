import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// 🔥 CONTEXTOS
import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> {/* 🔐 LOGIN GLOBAL */}
      <ReportProvider> {/* 📄 INFORMES */}
        <App />
      </ReportProvider>
    </AuthProvider>
  </React.StrictMode>
);

// 🔹 SERVICE WORKER (PWA)
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
