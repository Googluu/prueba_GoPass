import { shade } from '../../lib/utils';

export function Avatar({ name, size = 32, color = '#6366f1' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="rounded-full grid place-items-center font-semibold text-white shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${color} 0%, ${shade(color, -18)} 100%)`,
      }}>
      {initials}
    </div>
  );
}
