import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, ChevronRight, ArrowRight, Calendar } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { useLabels, useLabelTasks } from '../hooks/useLabels';
import { formatDate } from '../lib/utils';

const STATUS_OPTS   = [
  { value: '',            label: 'Todos' },
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];
const PRIORITY_OPTS = [
  { value: '',       label: 'Todas' },
  { value: 'high',   label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low',    label: 'Baja' },
];

function FilterBar({ statusFilter, priorityFilter, onStatus, onPriority }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status pills */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => onStatus(o.value)}
            className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors ${
              statusFilter === o.value
                ? 'bg-indigo-500 text-white'
                : 'text-mute hover:text-ink hover:bg-white/5'
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Priority pills */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
        {PRIORITY_OPTS.map(o => (
          <button key={o.value} onClick={() => onPriority(o.value)}
            className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors ${
              priorityFilter === o.value
                ? 'bg-indigo-500 text-white'
                : 'text-mute hover:text-ink hover:bg-white/5'
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      {(statusFilter || priorityFilter) && (
        <button onClick={() => { onStatus(''); onPriority(''); }}
          className="h-7 px-3 rounded-md text-[12px] text-mute hover:text-ink hover:bg-white/5 border border-border transition-colors">
          Limpiar
        </button>
      )}
    </div>
  );
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
        <p className={`text-[13px] font-medium truncate ${task.status === 'done' ? 'line-through text-mute' : 'text-ink'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-[12px] text-mute truncate mt-0.5">{task.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge value={task.status} />
        <PriorityBadge value={task.priority} />
        {task.due_date && (
          <span className="inline-flex items-center gap-1 text-[11px] text-mute">
            <Calendar className="w-3 h-3" />{formatDate(task.due_date)}
          </span>
        )}
        <span className="text-[11px] text-mute flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />{task.project.name}
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
        <div className="h-5 w-16 bg-border rounded-full" />
        <div className="h-5 w-12 bg-border rounded-full" />
      </div>
    </div>
  );
}

export default function EtiquetaDetail() {
  const { id } = useParams();
  const { data: labels = [] } = useLabels();
  const { data: tasks = [], isLoading } = useLabelTasks(id);

  const [statusFilter,   setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const label = labels.find(l => l.id === id);

  // Sort: upcoming due date first (nulls last), then most recent
  const filtered = useMemo(() => {
    let result = [...tasks];

    if (statusFilter)   result = result.filter(t => t.status   === statusFilter);
    if (priorityFilter) result = result.filter(t => t.priority === priorityFilter);

    result.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return result;
  }, [tasks, statusFilter, priorityFilter]);

  const done    = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.length - done;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header bar */}
        <div className="h-14 border-b border-border bg-chrome/60 backdrop-blur px-6 flex items-center gap-3 sticky top-0 z-10">
          <div className="text-[13px] text-mute flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Etiquetas</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink/80">{label?.name ?? '...'}</span>
          </div>
        </div>

        {/* Page header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            {label && <span className="w-4 h-4 rounded" style={{ background: label.color }} />}
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">{label?.name ?? ''}</h1>
          </div>
          <p className="text-[13.5px] text-mute">
            {isLoading ? '…' : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} · ${done} completada${done !== 1 ? 's' : ''} · ${pending} pendiente${pending !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filters */}
        <div className="px-8 pb-5">
          <FilterBar
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatus={setStatusFilter}
            onPriority={setPriorityFilter}
          />
        </div>

        {/* Task list */}
        <div className="px-8 pb-10 flex flex-col gap-1.5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            : filtered.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border bg-surface/40">
                <Tag className="w-12 h-12 text-mute/30 mb-3" />
                <h3 className="text-[15px] font-semibold text-ink">Sin tareas</h3>
                <p className="text-[13px] text-mute mt-1">
                  {statusFilter || priorityFilter ? 'Ninguna tarea coincide con los filtros.' : 'Ninguna tarea tiene esta etiqueta aún.'}
                </p>
              </div>
            )
            : filtered.map(t => <TaskRow key={t.id} task={t} />)
          }
        </div>
      </main>
    </div>
  );
}
