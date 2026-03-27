import { TECHNICIANS } from "../data/technicians";

export function getLoggedTechnician(user) {
  if (!user?.email) return null;

  return TECHNICIANS.find(
    (t) => t.email.toLowerCase() === user.email.toLowerCase()
  ) || null;
}
