export function isServiceDateRangeValid(start, end) {
  return !start || !end || end >= start;
}

export function formatServiceDate(value) {
  const date = String(value || "");
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
}
