import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";

// 🔥 CONTEXTOS
import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";
import { ThemeProvider } from "./context/ThemeContext";

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY || "").trim();

function sendVapidPublicKey(registration) {
  if (!VAPID_PUBLIC_KEY) return;

  const worker = registration.active || registration.waiting || registration.installing;
  worker?.postMessage({ type: "SET_VAPID_PUBLIC_KEY", key: VAPID_PUBLIC_KEY });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> {/* 🔐 LOGIN GLOBAL */}
      <ThemeProvider>
        <ReportProvider> {/* 📄 INFORMES */}
          <App />
        </ReportProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// 🔹 SERVICE WORKER (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        sendVapidPublicKey(registration);
        console.log("Service Worker registrado correctamente:", registration);
      })
      .catch((error) => {
        console.log("Error registrando Service Worker:", error);
      });
  });
}
