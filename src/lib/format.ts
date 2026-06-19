export function formatDA(n: number): string {
  const v = Math.round(n);
  // Group by thousands with space, Algerian style
  const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${s} DA`;
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Days remaining until ISO date (negative = past). Null if invalid. */
export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export type ExpiryStatus = "expired" | "critical" | "warning" | "safe" | "none";
/** critical <30d, warning <60d, safe otherwise. */
export function expiryStatus(iso?: string): ExpiryStatus {
  const n = daysUntil(iso);
  if (n === null) return "none";
  if (n < 0) return "expired";
  if (n <= 30) return "critical";
  if (n <= 60) return "warning";
  return "safe";
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}
