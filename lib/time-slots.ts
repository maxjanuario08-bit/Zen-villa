export const TIME_SLOTS = Array.from({ length: 31 }, (_, i) => {
  const hour = 7 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export function nearestTimeSlot(at = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  let hour = Number(parts.find((part) => part.type === "hour")?.value ?? 10);
  let minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  if (minute >= 45) {
    hour += 1;
    minute = 0;
  } else if (minute >= 15) {
    minute = 30;
  } else {
    minute = 0;
  }
  if (hour < 7) return "07:00";
  if (hour > 22 || (hour === 22 && minute > 0)) return "22:00";
  return `${String(hour).padStart(2, "0")}:${minute === 30 ? "30" : "00"}`;
}
