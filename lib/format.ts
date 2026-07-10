// Small formatting helpers shared across the UI.

export function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hrs = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  let phrase: string;
  if (mins < 60) phrase = `${mins}m`;
  else if (hrs < 24) phrase = `${hrs}h`;
  else phrase = `${days}d`;

  return diff >= 0 ? `in ${phrase}` : `${phrase} ago`;
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
