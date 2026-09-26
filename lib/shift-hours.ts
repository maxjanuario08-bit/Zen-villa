export function startOfLocalDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function shiftRange(clockInAt: string, clockOutAt: string | null, now = Date.now()) {
  const start = new Date(clockInAt).getTime();
  const end = clockOutAt ? new Date(clockOutAt).getTime() : now;
  return { start, end: Math.max(end, start) };
}

export function overlapMs(start: number, end: number, from: number, to: number) {
  return Math.max(0, Math.min(end, to) - Math.max(start, from));
}

export function formatDuration(ms: number) {
  const totalMin = Math.round(ms / 60_000);
  if (totalMin < 1) return "0 min";
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes}`;
}
