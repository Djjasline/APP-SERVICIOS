import { useEffect, useState } from "react";

export default function SyncStatus() {
  const [status, setStatus] = useState("checking");

  const checkStatus = () => {
    const online = navigator.onLine;
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const pending = stored.filter(r => r.synced === false);

    if (!online) {
      setStatus("offline");
      return;
    }

    if (pending.length > 0) {
      setStatus("pending");
      return;
    }

    setStatus("synced");
  };

  useEffect(() => {
    checkStatus();

    window.addEventListener("online", checkStatus);
    window.addEventListener("offline", checkStatus);

    const interval = setInterval(checkStatus, 4000);

    return () => {
      window.removeEventListener("online", checkStatus);
      window.removeEventListener("offline", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const styles = {
    synced: "bg-green-500",
    pending: "bg-yellow-500",
    offline: "bg-red-500",
    checking: "bg-gray-400"
  };

  const labels = {
    synced: "Sincronizado",
    pending: "Pendiente de sincronizar",
    offline: "Sin conexión",
    checking: "Verificando..."
  };

  return (
    <div className={`text-white text-xs px-3 py-1 rounded ${styles[status]}`}>
      {labels[status]}
    </div>
  );
}
