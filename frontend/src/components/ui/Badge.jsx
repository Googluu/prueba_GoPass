export const PRIORITY_TOKEN = {
  high:   { label: 'Alta',   bg: '#3f1515', fg: '#f87171', dot: '#ef4444', border: '#ef4444' },
  medium: { label: 'Media',  bg: '#2d2a10', fg: '#fbbf24', dot: '#fbbf24', border: '#fbbf24' },
  low:    { label: 'Baja',   bg: '#0f2d1a', fg: '#34d399', dot: '#34d399', border: '#34d399' },
};

export const STATUS_TOKEN = {
  todo:        { label: 'To Do',       bg: '#1e293b', fg: '#94a3b8' },
  in_progress: { label: 'In Progress', bg: '#1e1a3f', fg: '#818cf8' },
  done:        { label: 'Done',        bg: '#0f2d1a', fg: '#34d399' },
};

export function PriorityBadge({ value, size = 'sm' }) {
  const t = PRIORITY_TOKEN[value];
  if (!t) return null;
  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${pad}`}
      style={{ background: t.bg, color: t.fg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
      {t.label}
    </span>
  );
}

export function StatusBadge({ value }) {
  const t = STATUS_TOKEN[value];
  if (!t) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: t.bg, color: t.fg }}>
      {t.label}
    </span>
  );
}
