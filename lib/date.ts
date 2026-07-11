// yyyy-mm-dd in the user's timezone (IST), so "today" is consistent.
export function localDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}

// The last N day-strings, oldest → newest.
export function recentDays(n: number = 133): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(localDay(new Date(Date.now() - i * 86400_000)));
  }
  return out;
}

// Coerce a model-provided due date into a valid ISO timestamp or null.
// The brain (Llama) sometimes returns phrases like "tomorrow morning" instead
// of ISO 8601. Postgres rejects those, so we normalize before every insert —
// turning what we can into real times, and anything unparseable into null
// (so the item still saves, just without a due date).
export function normalizeDueAt(
  value: string | null | undefined,
  now: Date = new Date()
): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Already an ISO-ish date? Trust it.
  if (/\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  const s = raw.toLowerCase();
  const atTime = (base: Date, h: number, m = 0) => {
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const addDays = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d;
  };
  const MORNING = 9,
    AFTERNOON = 14,
    EVENING = 19,
    END_OF_DAY = 18;

  const partOfDay = (base: Date) => {
    if (/morning/.test(s)) return atTime(base, MORNING);
    if (/afternoon|noon/.test(s)) return atTime(base, AFTERNOON);
    if (/evening|night|tonight/.test(s)) return atTime(base, EVENING);
    return atTime(base, MORNING);
  };

  if (/\btonight\b/.test(s)) return atTime(new Date(now), 20);
  if (/day after tomorrow/.test(s)) return partOfDay(addDays(2));
  if (/\btomorrow\b/.test(s)) return partOfDay(addDays(1));
  if (/\btoday\b|end of (the )?day|\beod\b/.test(s)) return atTime(new Date(now), END_OF_DAY);
  if (/next week/.test(s)) return atTime(addDays(7), MORNING);
  if (/this week|end of (the )?week|by friday/.test(s)) {
    const day = now.getDay();
    const untilFriday = (5 - day + 7) % 7 || 3;
    return atTime(addDays(untilFriday), END_OF_DAY);
  }

  // Named weekday → the next occurrence.
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < 7; i++) {
    if (s.includes(weekdays[i])) {
      const diff = (i - now.getDay() + 7) % 7 || 7;
      return partOfDay(addDays(diff));
    }
  }

  // Last resort: loose parse, else give up gracefully.
  const loose = Date.parse(raw);
  return isNaN(loose) ? null : new Date(loose).toISOString();
}
