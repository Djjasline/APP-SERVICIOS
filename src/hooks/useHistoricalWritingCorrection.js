import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { correctHistoricalRecordWriting } from "@/services/historicalWritingCorrectionService";

const CORRECTION_VERSION = "v1";
const activeRuns = new Map();

function getStorageKey(userId) {
  return `astap_writing_correction_${CORRECTION_VERSION}_${userId}`;
}

export function useHistoricalWritingCorrection() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user?.id || typeof window === "undefined") return undefined;

    const storageKey = getStorageKey(user.id);
    if (localStorage.getItem(storageKey)) return undefined;

    let run = activeRuns.get(user.id);
    if (!run) {
      run = correctHistoricalRecordWriting()
        .then((summary) => {
          localStorage.setItem(storageKey, JSON.stringify({ completedAt: new Date().toISOString(), ...summary }));
          return summary;
        })
        .catch((error) => {
          console.warn("No se pudo completar la corrección de registros históricos:", error);
          throw error;
        })
        .finally(() => {
          activeRuns.delete(user.id);
        });
      activeRuns.set(user.id, run);
    }

    void run.catch(() => {});
    return undefined;
  }, [loading, user?.id]);
}
