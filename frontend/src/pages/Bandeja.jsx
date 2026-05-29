import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { useInbox } from '../hooks/useTasks';
import { formatDate, timeAgo } from '../lib/utils';

function dateGroup(createdAt) {
  const now   = new Date();
  const date  = new Date(createdAt);
  const diffH = (now - date) / (1000 * 60 * 60);
  if (diffH < 24)  return 'Hoy';
  if (diffH < 48)  return 'Ayer';
  if (diffH < 168) return 'Esta semana';
  return 'Antes';
}

function TaskRow({ task }) {
  const navigate = useNavigate();
  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-surface hover:border-indigo-500/40 hover:bg-surface-hover transition-colors cursor-pointer"
      onClick={() => navigate(`/proyectos/${task.project_id}`)}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/proyectos/${task.project_id}`); }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-mute">{task.project.name}</span>
          <span className="text-[10px] text-mute/50">·</span>
          <span className="text-[11px] text-mute/60">{timeAgo(task.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge value={task.status} />
        <PriorityBadge value={task.priority} />
        {task.due_date && (
          <span className="inline-flex items-center gap-1 text-[11px] text-mute">
            <Calendar className="w-3 h-3" />{formatDate(task.due_date)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-bg border border-border text-[11px] text-mute group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
          {task.project.name}
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-surface animate-pulse">
      <div className="flex-1">
        <div className="h-3 bg-border rounded w-2/3 mb-2" />
        <div className="h-3 bg-border rounded w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-12 bg-border rounded-full" />
        <div className="h-5 w-24 bg-border rounded-md" />
      </div>
    </div>
  );
}

const GROUP_ORDER = ['Hoy', 'Ayer', 'Esta semana', 'Antes'];

export default function Bandeja() {
  const { data: tasks = [], isLoading } = useInbox();

  // Group by relative date (tasks already sorted by createdAt DESC from backend)
  const grouped = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      const g = dateGroup(t.createdAt);
      if (!map[g]) map[g] = [];
      map[g].push(t);
    }
    return GROUP_ORDER.filter(g => map[g]).map(g => ({ label: g, tasks: map[g] }));
  }, [tasks]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="h-14 border-b border-border bg-chrome/60 backdrop-blur px-6 flex items-center sticky top-0 z-10">
          <div className="text-[13px] text-mute flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5" />
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink/80">Bandeja</span>
          </div>
        </div>

        <div className="px-8 pt-8 pb-6">
          <h1 className="text-[26px] font-semibold tracking-tight text-ink">Bandeja de entrada</h1>
          <p className="text-[13.5px] text-mute mt-1">
            {isLoading ? '…' : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} activa${tasks.length !== 1 ? 's' : ''} · ordenadas por actividad reciente`}
          </p>
        </div>

        <div className="px-8 pb-10 flex flex-col gap-6">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border bg-surface/40">
              <Inbox className="w-12 h-12 text-indigo-400/50 mb-3" />
              <h3 className="text-[15px] font-semibold text-ink">Bandeja vacía</h3>
              <p className="text-[13px] text-mute mt-1">No tienes tareas activas. ¡Buen trabajo!</p>
            </div>
          ) : (
            grouped.map(({ label, tasks: groupTasks }) => (
              <section key={label}>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-mute mb-2 px-1">
                  {label} · {groupTasks.length}
                </h2>
                <div className="flex flex-col gap-1.5">
                  {groupTasks.map(t => <TaskRow key={t.id} task={t} />)}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
