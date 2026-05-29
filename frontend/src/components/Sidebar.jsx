import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Plus, Moon, Sun } from 'lucide-react';
import logoIcon from '../assets/logo.png';
import { Avatar } from './ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProjects } from '../hooks/useProjects';
import { PROJECT_COLORS, shade } from '../lib/utils';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: projects = [] } = useProjects();
  const navigate = useNavigate();

  const displayName  = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuario';
  const displayEmail = user?.email ?? '';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-56 shrink-0 bg-chrome border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-5 flex items-center gap-2">
        <img src={logoIcon} alt="TaskFlow" className="w-7 h-5" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">TaskFlow</span>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5 min-h-0">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-[11px] uppercase tracking-wider text-mute font-semibold">Projects</span>
          <button
            onClick={() => navigate('/proyectos')}
            title="Nuevo proyecto"
            className="w-5 h-5 rounded grid place-items-center text-mute hover:text-ink hover:bg-white/10 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.map((p, i) => {
          const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
          return (
            <NavLink
              key={p.id}
              to={`/proyectos/${p.id}`}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 h-8 px-2 rounded-md text-[13px] transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                    : 'text-ink/70 hover:text-ink hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-4 h-4 rounded-sm object-cover shrink-0"
                    />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-sm shrink-0 grid place-items-center text-white text-[9px] font-bold"
                      style={{ background: `linear-gradient(135deg, ${color}, ${shade(color, -22)})` }}
                    >
                      {p.name[0]}
                    </span>
                  )}
                  <span className={`truncate ${isActive ? 'text-indigo-400' : ''}`}>{p.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {projects.length === 0 && (
          <button
            onClick={() => navigate('/proyectos')}
            className="px-2 text-[12px] text-mute hover:text-indigo-400 transition-colors text-left"
          >
            + Crear primer proyecto
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 p-1.5 rounded-md">
          <Avatar name={displayName} size={30} color="#6366f1" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink truncate">{displayName}</div>
            <div className="text-[11px] text-mute truncate">{displayEmail}</div>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            className="w-7 h-7 rounded-md grid place-items-center text-mute hover:text-ink hover:bg-border transition-colors"
          >
            {theme === 'dark'
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />
            }
          </button>
          <button
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="w-7 h-7 rounded-md grid place-items-center text-mute hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
