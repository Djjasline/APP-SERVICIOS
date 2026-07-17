import { useEffect, useState } from "react";
import { getAccessProfiles } from "@/services/accessControlService";
import { formatUserDisplayName } from "@/utils/nameFormat";

const normalize = (value) => String(value || "").trim().toLowerCase();

export function getUserOptionLabel(user) {
  return formatUserDisplayName(user);
}

export function recordMatchesUser(record, user) {
  if (!user) return true;

  const recordValues = [
    record?.user_id,
    record?.data?.tecnicoNombre,
    record?.data?.tecnicoResponsable,
    record?.data?.tecnico,
    record?.data?.tecnicoCorreo,
  ]
    .map(normalize)
    .filter(Boolean);

  const userValues = [user.id, user.email, user.full_name]
    .map(normalize)
    .filter(Boolean);

  return userValues.some((userValue) =>
    recordValues.some((recordValue) => recordValue === userValue || recordValue.includes(userValue) || userValue.includes(recordValue))
  );
}

export function useUserOptions() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const profiles = await getAccessProfiles();
        if (!cancelled) setUsers(profiles);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  return { users, loading };
}
