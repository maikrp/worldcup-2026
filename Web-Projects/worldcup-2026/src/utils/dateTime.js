export const COSTA_RICA_TIME_ZONE = "America/Costa_Rica";

export function getCostaRicaDateString(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COSTA_RICA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

export function shiftCalendarDate(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function formatCostaRicaTime(kickoffUtc) {
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: COSTA_RICA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(kickoffUtc));
}

export function formatCostaRicaDateTime(kickoffUtc) {
  const formattedDate = new Intl.DateTimeFormat("es-CR", {
    timeZone: COSTA_RICA_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(kickoffUtc));

  return `${formattedDate}, ${formatCostaRicaTime(kickoffUtc)}`;
}
