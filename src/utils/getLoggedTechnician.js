export function getLoggedTechnician(user, technicians = []) {
  if (!user?.email) return null;

  return (
    technicians.find(
      (t) => t.email?.toLowerCase() === user.email.toLowerCase()
    ) || null
  );
}
