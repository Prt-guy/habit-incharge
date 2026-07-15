const DAY_MS = 24 * 60 * 60 * 1000;

/** Local date key: "2026-07-12" */
export function dateKey(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey() {
  return dateKey();
}

export function yesterdayKey() {
  return dateKey(new Date(Date.now() - DAY_MS));
}

export function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Array of date keys for the last n days, oldest first, including today. */
export function lastNDayKeys(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(dateKey(new Date(Date.now() - i * DAY_MS)));
  }
  return out;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

export function formatLongDate(date = new Date()) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(input) {
  const d = typeof input === "string" ? keyToDate(input) : new Date(input);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatTime(input) {
  return new Date(input).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isToday(iso) {
  return iso && dateKey(new Date(iso)) === todayKey();
}

/** Days between two date keys (b - a). */
export function daysBetween(aKey, bKey) {
  return Math.round((keyToDate(bKey) - keyToDate(aKey)) / DAY_MS);
}

export function weekdayShort(key) {
  return keyToDate(key).toLocaleDateString("en-US", { weekday: "short" });
}
