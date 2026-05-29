import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, closestCenter,
} from '@dnd-kit/core';
import {
  Plus, Circle, RefreshCw, CheckCircle, Calendar, Pencil, Trash2,
  GripVertical, List, Columns2, CalendarDays, LayoutGrid, Camera,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button, IconButton } from '../components/ui/Button';
import { PriorityBadge, StatusBadge, PRIORITY_TOKEN } from '../components/ui/Badge';
import { TaskFormModal } from '../components/modals/TaskFormModal';
import { TaskViewModal } from '../components/modals/TaskViewModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { WeekCalendarFull } from '../components/WeekCalendarFull';
import { useProject, useUpdateProject, useUploadProjectImage } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from '../hooks/useTasks';
import { shade, PROJECT_COLORS, formatDate, timeAgo, toDateKey, getWeekStart, getWeekDays } from '../lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMN_META = {
  todo:        { label: 'To Do',       color: '#64748b', Icon: Circle,      badgeBg: '#1e293b' },
  in_progress: { label: 'In Progress', color: '#818cf8', Icon: RefreshCw,   badgeBg: '#1e1a3f' },
  done:        { label: 'Done',        color: '#34d399', Icon: CheckCircle, badgeBg: '#0f2d1a' },
};

const PRIORITY_FILTERS = [
  { id: 'all',    label: 'Todas' },
  { id: 'high',   label: 'Alta' },
  { id: 'medium', label: 'Media' },
  { id: 'low',    label: 'Baja' },
];

const TABS = [
  { id: 'all',      label: 'All Features', icon: List },
  { id: 'status',   label: 'By Status',    icon: Columns2 },
  { id: 'timeline', label: 'Timeline',     icon: CalendarDays },
  { id: 'feed',     label: 'Feed',         icon: LayoutGrid },
];

// ── Inline-editable field ─────────────────────────────────────────────────────

// Componente re-inicializado con `key={project?.id}` desde el padre —
// no necesita useEffect de sincronización porque el cache nunca sobrescribe el estado local.
function EditableTitle({ value, onSave, placeholder = 'Sin título' }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState(value ?? '');
  const savedRef              = useRef(value ?? '');

  const commit = () => {
    const trimmed = local.trim();
    if (!trimmed) {
      setLocal(savedRef.current);       // revert — campo obligatorio
    } else if (trimmed !== savedRef.current) {
      savedRef.current = trimmed;       // local es fuente de verdad desde ya
      onSave(trimmed);                  // backend en background
    }
    setEditing(false);
  };

  return editing ? (
    <input autoFocus value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter')  { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { setLocal(savedRef.current); setEditing(false); }
      }}
      className="text-[28px] font-bold text-ink bg-transparent outline-none border-b-2 border-indigo-500 w-full leading-tight py-0.5 caret-indigo-400"
    />
  ) : (
    <h1 onClick={() => setEditing(true)} title="Click para editar"
      className="text-[28px] font-bold text-ink leading-tight cursor-text rounded px-1 -mx-1 hover:bg-white/5 transition-colors select-none">
      {local || <span className="text-mute/40 font-normal italic text-[22px]">{placeholder}</span>}
    </h1>
  );
}

function EditableDescription({ value, onSave, placeholder = 'Agrega una descripción...' }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState(value ?? '');
  const savedRef              = useRef(value ?? '');
  const areaRef               = useRef(null);

  useEffect(() => {
    if (editing && areaRef.current) {
      areaRef.current.style.height = 'auto';
      areaRef.current.style.height = areaRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const commit = () => {
    const trimmed = local.trim();
    if (trimmed !== savedRef.current.trim()) {
      savedRef.current = trimmed;
      onSave(trimmed || null);
    }
    setEditing(false);
  };

  return editing ? (
    <textarea ref={areaRef} autoFocus value={local} rows={1}
      onChange={e => {
        setLocal(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Escape') { setLocal(savedRef.current); setEditing(false); }
      }}
      className="text-[14px] text-mute bg-transparent outline-none border-b border-indigo-500/60 w-full leading-relaxed resize-none py-0.5 caret-indigo-400 overflow-hidden"
    />
  ) : (
    <p onClick={() => setEditing(true)} title="Click para editar"
      className="text-[14px] text-mute cursor-text rounded px-1 -mx-1 hover:bg-white/5 transition-colors min-h-5.5 leading-relaxed select-none">
      {local || <span className="text-mute/30 italic">{placeholder}</span>}
    </p>
  );
}

// ── Cover image ───────────────────────────────────────────────────────────────

function CoverImage({ imageUrl, onUpload, uploading }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div
      className="relative w-full h-44 cursor-pointer group overflow-hidden shrink-0"
      onClick={() => !uploading && fileRef.current?.click()}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Portada"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg,
              rgba(99,102,241,0.18) 0%,
              rgba(139,92,246,0.10) 50%,
              rgba(99,102,241,0.06) 100%)`,
            backgroundImage: `
              linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.10)),
              radial-gradient(ellipse 70% 60% at 30% 40%, rgba(99,102,241,0.12), transparent)
            `,
          }}
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-3">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur text-[12px] text-ink/90 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          {uploading ? (
            <span className="animate-pulse">Subiendo...</span>
          ) : (
            <><Camera className="w-3.5 h-3.5" /> Cambiar portada</>
          )}
        </span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  return (
    <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-bg/60 border border-border">
      <span className="text-[11px] text-mute">{label}</span>
      <span className="text-[12px] font-semibold" style={{ color: color || '#e2e8f0' }}>{value}</span>
    </div>
  );
}

// ── All Features tab ──────────────────────────────────────────────────────────

const STATUS_ORDER = { todo: 0, in_progress: 1, done: 2 };

function AllFeaturesTab({ tasks, onView, onEdit, onDelete }) {
  if (!tasks.length) return (
    <EmptyTabState icon={List} message="Sin tareas" hint="Crea la primera tarea del proyecto." />
  );

  const sorted = [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <div className="flex flex-col gap-1.5 pb-8">
      {sorted.map(task => {
        const p = PRIORITY_TOKEN[task.priority];
        const isDone = task.status === 'done';
        return (
          <div key={task.id} onClick={() => onView(task)}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-surface hover:border-indigo-500/40 hover:bg-surface-hover cursor-pointer transition-colors"
            style={{ borderLeftWidth: 3, borderLeftColor: p.border }}>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-medium truncate ${isDone ? 'line-through text-mute' : 'text-ink'}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-[11px] text-mute truncate mt-0.5">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {task.labels?.slice(0, 2).map(l => (
                <span key={l.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ background: `${l.color}22`, color: l.color }}>{l.name}</span>
              ))}
              <StatusBadge value={task.status} />
              <PriorityBadge value={task.priority} />
              {task.due_date && (
                <span className="inline-flex items-center gap-1 text-[11px] text-mute">
                  <Calendar className="w-3 h-3" />{formatDate(task.due_date)}
                </span>
              )}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton icon={Pencil} label="Editar" onClick={e => { e.stopPropagation(); onEdit(task); }} />
                <IconButton icon={Trash2} label="Eliminar" tone="danger" onClick={e => { e.stopPropagation(); onDelete(task); }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── By Status tab (Kanban + DnD) ──────────────────────────────────────────────

function DraggableCard({ task, onEdit, onDelete, onStatusChange, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const p      = PRIORITY_TOKEN[task.priority];
  const isDone = task.status === 'done';
  const style  = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined;

  return (
    <article ref={setNodeRef}
      className={`reveal-host group relative bg-surface border border-border rounded-lg p-3 pl-3.5 transition-colors ${isDragging ? 'opacity-40' : 'hover:border-border-2 hover:bg-surface-hover'}`}
      style={{ borderLeftWidth: 4, borderLeftColor: p.border, ...style }}>
      <div className="flex items-start gap-2">
        <button {...listeners} {...attributes}
          className="mt-0.5 shrink-0 text-mute/30 hover:text-mute cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`text-[13px] font-medium leading-snug ${isDone ? 'text-mute line-through' : 'text-ink'}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-[12px] mt-1 truncate ${isDone ? 'text-mute/70' : 'text-mute'}`}>
              {task.description}
            </p>
          )}
        </div>
      </div>
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.map(l => (
            <span key={l.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: `${l.color}22`, color: l.color }}>{l.name}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <PriorityBadge value={task.priority} />
        {task.due_date && (
          <span className="inline-flex items-center gap-1 text-[11px] text-mute">
            <Calendar className="w-3 h-3" />{formatDate(task.due_date)}
          </span>
        )}
        <div className="ml-auto flex gap-0.5 reveal-target">
          <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-6 pl-1.5 pr-5 rounded text-[11px] bg-bg border border-border text-mute outline-none cursor-pointer appearance-none">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <IconButton icon={Pencil} label="Editar" onClick={onEdit} />
          <IconButton icon={Trash2} label="Eliminar" tone="danger" onClick={onDelete} />
        </div>
      </div>
      {isDone && <div className="absolute inset-0 pointer-events-none rounded-lg bg-bg/20" />}
    </article>
  );
}

function DroppableColumn({ status, tasks, onAddTask, onEditTask, onDeleteTask, onStatusChange, activeTask }) {
  const meta = COLUMN_META[status];
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const isTarget = isOver && activeTask?.status !== status;

  return (
    <section ref={setNodeRef}
      className={`flex flex-col min-w-75 flex-1 rounded-xl border transition-colors ${isTarget ? 'border-indigo-500/60 bg-indigo-500/4' : 'border-border bg-bg/40'}`}>
      <header className="px-3 pt-3 pb-2 flex items-center gap-2">
        <meta.Icon className="w-4 h-4" style={{ color: meta.color }} />
        <h3 className="text-[13px] font-semibold" style={{ color: meta.color }}>{meta.label}</h3>
        <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold"
          style={{ background: meta.badgeBg, color: meta.color }}>{tasks.length}</span>
        <div className="ml-auto">
          <IconButton icon={Plus} label="Agregar" onClick={() => onAddTask(status)} />
        </div>
      </header>
      <div className="px-2.5 pb-2.5 flex flex-col gap-2 flex-1 min-h-20">
        {tasks.map(t => (
          <DraggableCard key={t.id} task={t}
            onEdit={() => onEditTask(t)}
            onDelete={() => onDeleteTask(t)}
            onStatusChange={onStatusChange}
            isDragging={activeTask?.id === t.id} />
        ))}
        <button type="button" onClick={() => onAddTask(status)}
          className="mt-1 flex items-center gap-1.5 px-3 h-9 rounded-lg border border-dashed border-border text-[12.5px] text-mute hover:text-ink hover:border-border-2 hover:bg-white/2 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Agregar tarea
        </button>
      </div>
    </section>
  );
}

function KanbanGhost({ task }) {
  const p = PRIORITY_TOKEN[task.priority];
  return (
    <article className="bg-surface border border-indigo-500/60 rounded-lg p-3 pl-3.5 shadow-2xl rotate-1 cursor-grabbing"
      style={{ borderLeftWidth: 4, borderLeftColor: p.border, width: 290 }}>
      <p className="text-[13px] font-medium text-ink truncate">{task.title}</p>
      <div className="mt-2"><PriorityBadge value={task.priority} /></div>
    </article>
  );
}

function ByStatusTab({ tasks, filter, setFilter, activeTask, sensors, onDragStart, onDragEnd, onAddTask, onEditTask, onDeleteTask, onStatusChange }) {
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.priority === filter);
  const byStatus = {
    todo:        filtered.filter(t => t.status === 'todo'),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    done:        filtered.filter(t => t.status === 'done'),
  };
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-mute font-medium">Prioridad:</span>
        <div className="flex gap-1">
          {PRIORITY_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`h-7 px-3 rounded-md text-[12px] transition-colors ${filter === f.id ? 'bg-indigo-500 text-white font-medium' : 'border border-border text-ink/70 hover:text-ink'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-min">
            {['todo', 'in_progress', 'done'].map(s => (
              <DroppableColumn key={s} status={s} tasks={byStatus[s]}
                activeTask={activeTask}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onStatusChange={onStatusChange} />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeTask ? <KanbanGhost task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

// ── Timeline tab ──────────────────────────────────────────────────────────────

function TimelineTab({ tasks, project, onTaskClick }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const tasksWithProject = useMemo(() =>
    tasks.map(t => ({ ...t, project: { id: project?.id, name: project?.name } })),
    [tasks, project]
  );

  const tasksByDate = useMemo(() =>
    tasksWithProject.reduce((acc, t) => {
      if (!t.due_date) return acc;
      if (!acc[t.due_date]) acc[t.due_date] = [];
      acc[t.due_date].push(t);
      return acc;
    }, {}),
    [tasksWithProject]
  );

  return (
    <div className="pb-4" style={{ height: 'calc(100vh - 250px)' }}>
      <WeekCalendarFull
        weekDays={weekDays}
        tasksByDate={tasksByDate}
        onNavigate={dir => { const d = new Date(weekStart); d.setDate(d.getDate() + dir * 7); setWeekStart(d); }}
        onGoToToday={() => setWeekStart(getWeekStart(today))}
        onTaskClick={onTaskClick}
      />
    </div>
  );
}

// ── Feed tab ──────────────────────────────────────────────────────────────────

function FeedCard({ task, onClick }) {
  const p      = PRIORITY_TOKEN[task.priority];
  const isDone = task.status === 'done';
  return (
    <article onClick={() => onClick(task)}
      className="group bg-surface border border-border rounded-xl p-4 pl-3.75 hover:border-indigo-500/40 hover:bg-surface-hover cursor-pointer transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_rgba(99,102,241,0.3)]"
      style={{ borderLeftWidth: 4, borderLeftColor: p.border }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`text-[13.5px] font-semibold leading-snug ${isDone ? 'line-through text-mute' : 'text-ink'}`}>
          {task.title}
        </h3>
        <PriorityBadge value={task.priority} />
      </div>
      {task.description && (
        <p className="text-[12px] text-mute leading-relaxed line-clamp-2 mb-3">{task.description}</p>
      )}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map(l => (
            <span key={l.id} className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
              style={{ background: `${l.color}18`, color: l.color, borderColor: `${l.color}40` }}>
              {l.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <StatusBadge value={task.status} />
        <div className="flex items-center gap-2 text-[11px] text-mute">
          {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(task.due_date)}</span>}
          {task.createdAt && <span>{timeAgo(task.createdAt)}</span>}
        </div>
      </div>
    </article>
  );
}

function FeedTab({ tasks, onView }) {
  if (!tasks.length) return <EmptyTabState icon={LayoutGrid} message="Sin tareas" hint="Crea la primera tarea del proyecto." />;
  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 pb-8">
      {tasks.map(task => <FeedCard key={task.id} task={task} onClick={onView} />)}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyTabState({ icon: Icon, message, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="w-12 h-12 text-mute/30 mb-3" />
      <p className="text-[14px] font-semibold text-ink">{message}</p>
      <p className="text-[13px] text-mute mt-1">{hint}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonColumn() {
  return (
    <div className="flex flex-col min-w-75 flex-1 bg-bg/40 rounded-xl border border-border p-3 animate-pulse">
      <div className="h-4 bg-border rounded w-24 mb-3" />
      {[1, 2].map(i => (
        <div key={i} className="bg-surface rounded-lg p-3 mb-2 border border-border">
          <div className="h-3 bg-border rounded w-3/4 mb-2" />
          <div className="h-3 bg-border rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id } = useParams();

  const { data: project }                     = useProject(id);
  const { data: allTasks = [], isLoading }    = useTasks(id);
  const updateProject  = useUpdateProject();
  const uploadImage    = useUploadProjectImage();

  const createTask   = useCreateTask(id);
  const updateTask   = useUpdateTask(id);
  const deleteTask   = useDeleteTask(id);
  const updateStatus = useUpdateTaskStatus(id);

  const [tab, setTab]       = useState('status');
  const [filter, setFilter] = useState('all');
  const [modal, setModal]   = useState(null);
  const [activeTask, setActiveTask]                 = useState(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState({});
  const close = () => setModal(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const effectiveTasks = allTasks.map(t =>
    optimisticStatuses[t.id] ? { ...t, status: optimisticStatuses[t.id] } : t
  );

  const counts = {
    total:       effectiveTasks.length,
    todo:        effectiveTasks.filter(t => t.status === 'todo').length,
    in_progress: effectiveTasks.filter(t => t.status === 'in_progress').length,
    done:        effectiveTasks.filter(t => t.status === 'done').length,
  };

  const projectColor = PROJECT_COLORS[0];

  const saveField = (field) => (val) =>
    updateProject.mutate({ id, [field]: val });

  const handleUploadCover = (file) =>
    uploadImage.mutate({ id, file });

  function handleDragStart({ active }) {
    setActiveTask(effectiveTasks.find(t => t.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }) {
    const newStatus = over?.id;
    const task = effectiveTasks.find(t => t.id === active.id);
    if (task && newStatus && task.status !== newStatus && ['todo', 'in_progress', 'done'].includes(newStatus)) {
      setActiveTask(null);
      setOptimisticStatuses(prev => ({ ...prev, [task.id]: newStatus }));
      updateStatus.mutate({ id: task.id, status: newStatus }, {
        onSettled: () => setOptimisticStatuses(prev => { const n = { ...prev }; delete n[task.id]; return n; }),
      });
    } else {
      setActiveTask(null);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Cover image ── */}
        <CoverImage
          imageUrl={project?.image_url}
          onUpload={handleUploadCover}
          uploading={uploadImage.isPending}
        />

        {/* ── Project info ── */}
        <div className="px-8 pt-5 pb-0 shrink-0">
          {/* Icon + editable title */}
          <div className="flex items-start gap-3 mb-1">
            {!project?.image_url && (
              <div className="w-10 h-10 rounded-xl grid place-items-center text-white font-bold text-lg shrink-0 mt-0.5"
                style={{ background: `linear-gradient(135deg, ${projectColor}, ${shade(projectColor, -22)})` }}>
                {project?.name?.[0] ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {/* key={id} re-monta el campo cuando carga el proyecto (no en cada save) */}
              <EditableTitle
                key={project?.id ?? 'title-loading'}
                value={project?.name ?? ''}
                onSave={val => saveField('name')(val)}
              />
            </div>
          </div>

          {/* Editable description */}
          <div className="mt-1 mb-3 ml-0">
            <EditableDescription
              key={project?.id ?? 'desc-loading'}
              value={project?.description ?? ''}
              onSave={val => saveField('description')(val)}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <StatPill label="Total"       value={counts.total} />
            <StatPill label="To Do"       value={counts.todo}        color="#94a3b8" />
            <StatPill label="In Progress" value={counts.in_progress} color="#818cf8" />
            <StatPill label="Done"        value={counts.done}        color="#34d399" />
          </div>

          {/* Tab bar + Nueva Tarea */}
          <div className="flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-0.5">
              {TABS.map(({ id: tabId, label, icon: Icon }) => (
                <button key={tabId} onClick={() => setTab(tabId)}
                  className={`flex items-center gap-1.5 h-9 px-3 rounded-t-md text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
                    tab === tabId
                      ? 'text-indigo-400 border-indigo-500'
                      : 'text-mute hover:text-ink border-transparent hover:border-border'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <div className="pb-1">
              <Button icon={Plus} size="sm" onClick={() => setModal({ kind: 'new-task' })}>
                Nueva Tarea
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 min-h-0">
          {isLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <SkeletonColumn key={i} />)}
            </div>
          ) : (
            <>
              {tab === 'all' && (
                <AllFeaturesTab tasks={effectiveTasks}
                  onView={t => setModal({ kind: 'view', task: t })}
                  onEdit={t => setModal({ kind: 'edit-task', task: t })}
                  onDelete={t => setModal({ kind: 'delete-task', task: t })} />
              )}
              {tab === 'status' && (
                <ByStatusTab
                  tasks={effectiveTasks} filter={filter} setFilter={setFilter}
                  activeTask={activeTask} sensors={sensors}
                  onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                  onAddTask={s => setModal({ kind: 'new-task', defaultStatus: s })}
                  onEditTask={t => setModal({ kind: 'edit-task', task: t })}
                  onDeleteTask={t => setModal({ kind: 'delete-task', task: t })}
                  onStatusChange={(tid, s) => updateStatus.mutate({ id: tid, status: s })} />
              )}
              {tab === 'timeline' && (
                <TimelineTab tasks={effectiveTasks} project={project}
                  onTaskClick={t => setModal({ kind: 'view', task: t })} />
              )}
              {tab === 'feed' && (
                <FeedTab tasks={effectiveTasks}
                  onView={t => setModal({ kind: 'view', task: t })} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {modal?.kind === 'view' && (
        <TaskViewModal task={modal.task} onClose={close} />
      )}
      {modal?.kind === 'new-task' && (
        <TaskFormModal mode="create"
          initial={modal.defaultStatus ? { status: modal.defaultStatus } : undefined}
          onClose={close}
          onSubmit={data => createTask.mutateAsync(data)} />
      )}
      {modal?.kind === 'edit-task' && (
        <TaskFormModal mode="edit" initial={modal.task} onClose={close}
          onSubmit={data => updateTask.mutateAsync({ id: modal.task.id, ...data })} />
      )}
      {modal?.kind === 'delete-task' && (
        <DeleteConfirmModal title="¿Eliminar tarea?"
          message={`Se eliminará "${modal.task.title}". Esta acción no se puede deshacer.`}
          onClose={close}
          onConfirm={() => deleteTask.mutate(modal.task.id)} />
      )}
    </div>
  );
}
