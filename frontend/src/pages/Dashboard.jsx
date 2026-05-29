import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, List, Clock, RefreshCw, Search, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button, IconButton } from '../components/ui/Button';
import { ProjectFormModal } from '../components/modals/ProjectFormModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { PROJECT_COLORS, shade, timeAgo } from '../lib/utils';

function ProjectCard({ project, color, onEdit, onDelete, onOpen }) {
  return (
    <article role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
      className="reveal-host group bg-surface border border-border rounded-xl p-5 transition-all hover:border-indigo-500/60 hover:-translate-y-px hover:shadow-[0_10px_30px_-12px_rgba(99,102,241,0.35)] cursor-pointer focus:outline-none focus:border-indigo-500">
      <div className="flex items-start justify-between mb-4">
        {project.image_url ? (
          <img src={project.image_url} alt={project.name}
            className="w-10 h-10 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg grid place-items-center text-white font-semibold text-[15px] shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}, ${shade(color, -22)})` }}
            aria-hidden="true">
            {project.name[0]}
          </div>
        )}
      </div>
      <h3 className="text-[15px] font-semibold text-ink leading-snug mb-1.5 line-clamp-1">{project.name}</h3>
      <p className="text-[13px] text-mute leading-relaxed line-clamp-2 min-h-[2.6em]">{project.description}</p>
      <div className="h-px bg-border my-4" />
      <div className="flex items-center gap-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-ink/80">
          <List className="w-3.5 h-3.5 text-mute" />{project.total_tasks} tareas
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-ink/80">
          <Clock className="w-3.5 h-3.5 text-mute" />
          <span className="text-mute">{project.todo_count} pendientes</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-ink/80">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>{project.in_progress_count} en progreso</span>
        </span>
      </div>
      <div className="flex items-center justify-between mt-5 -mb-1">
        <span className="text-[11px] text-mute">Creado {timeAgo(project.createdAt)}</span>
        <div className="flex items-center gap-0.5 reveal-target">
          <IconButton icon={Pencil} label="Editar proyecto"
            onClick={(e) => { e.stopPropagation(); onEdit(); }} />
          <IconButton icon={Trash2} label="Eliminar proyecto" tone="danger"
            onClick={(e) => { e.stopPropagation(); onDelete(); }} />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-dashed border-border bg-surface/40">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-x-2 bottom-0 h-16 rounded-xl bg-bg border border-border" />
        <div className="absolute inset-x-1 bottom-2 h-16 rounded-xl bg-surface border border-border" />
        <div className="absolute inset-x-0 bottom-4 h-16 rounded-xl bg-chrome border border-border-2 grid place-items-center">
          <Folder className="w-8 h-8 text-indigo-400" />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-ink">No tienes proyectos aún</h3>
      <p className="text-[13px] text-mute mt-1 max-w-xs">
        Crea tu primer proyecto para empezar a organizar tareas con tu equipo.
      </p>
      <div className="mt-5">
        <Button icon={Plus} onClick={onCreate}>Crear proyecto</Button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-border mb-4" />
      <div className="h-4 bg-border rounded w-3/4 mb-2" />
      <div className="h-3 bg-border rounded w-full mb-1" />
      <div className="h-3 bg-border rounded w-2/3" />
      <div className="h-px bg-border my-4" />
      <div className="flex gap-4">
        <div className="h-3 bg-border rounded w-16" />
        <div className="h-3 bg-border rounded w-20" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebounced] = useState('');

  // Debounce 350ms — evita una petición por cada tecla
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: projects = [], isLoading } = useProjects(debouncedSearch);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [modal, setModal] = useState(null);
  const close = () => setModal(null);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="h-14 border-b border-border bg-chrome/60 backdrop-blur px-6 flex items-center gap-3 sticky top-0 z-10">
          <div className="text-[13px] text-mute flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" />
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink/80">Proyectos</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-mute absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                className="h-8 w-56 pl-7 pr-3 rounded-md bg-bg border border-border text-[12.5px] placeholder:text-mute focus:border-indigo-500 outline-none text-ink transition-colors"
                placeholder="Buscar proyectos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="px-8 pt-8 pb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">Mis Proyectos</h1>
            <p className="text-[13.5px] text-mute mt-1">
              {debouncedSearch
                ? `${projects.length} resultado${projects.length !== 1 ? 's' : ''} para "${debouncedSearch}"`
                : `${projects.length} proyectos activos · actualizados recientemente`
              }
            </p>
          </div>
          <Button icon={Plus} onClick={() => setModal({ kind: 'new' })}>Nuevo Proyecto</Button>
        </div>

        {/* Grid */}
        <div className="px-8 pb-10 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : projects.length === 0
            ? <EmptyState onCreate={() => setModal({ kind: 'new' })} />
            : projects.map((p, i) => (
              <ProjectCard key={p.id} project={p}
                color={PROJECT_COLORS[i % PROJECT_COLORS.length]}
                onOpen={() => navigate(`/proyectos/${p.id}`)}
                onEdit={() => setModal({ kind: 'edit', project: p })}
                onDelete={() => setModal({ kind: 'delete', project: p })} />
            ))
          }
        </div>
      </main>

      {modal?.kind === 'new' && (
        <ProjectFormModal mode="create" onClose={close}
          onSubmit={(data) => createProject.mutateAsync(data)} />
      )}
      {modal?.kind === 'edit' && (
        <ProjectFormModal mode="edit" initial={modal.project} onClose={close}
          onSubmit={(data) => updateProject.mutateAsync({ id: modal.project.id, ...data })} />
      )}
      {modal?.kind === 'delete' && (
        <DeleteConfirmModal
          title="¿Eliminar proyecto?"
          message={`Se eliminará "${modal.project.name}" y todas sus tareas. Esta acción no se puede deshacer.`}
          onClose={close}
          onConfirm={() => deleteProject.mutate(modal.project.id)} />
      )}
    </div>
  );
}
