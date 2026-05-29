export const PROJECT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b'];

// ─── Calendar utilities ────────────────────────────────────────────────────

// YYYY-MM-DD string from a Date (local, no UTC shift)
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Monday of the week that contains `date`
export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

// Array of 7 Date objects Mon → Sun
export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// "26 may — 1 jun" label for a week
export function formatWeekRange(days) {
  const fmt = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${fmt(days[0])} — ${fmt(days[6])}`;
}

// "miércoles, 28 de mayo" full day label
export function formatDayFull(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const DAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  if (mins  < 1)   return 'ahora mismo';
  if (hours < 1)   return `hace ${mins}m`;
  if (days  < 1)   return `hace ${hours}h`;
  if (days  < 7)   return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (weeks < 4)   return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  return `hace más de un mes`;
}

export function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}
