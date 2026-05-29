import { useState, useMemo } from 'react';
import { Sun, ChevronRight } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { WeekCalendarFull } from '../components/WeekCalendarFull';
import { TaskViewModal } from '../components/modals/TaskViewModal';
import { useTasksRange } from '../hooks/useTasks';
import { getWeekStart, getWeekDays, toDateKey } from '../lib/utils';

export default function Hoy() {
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(todayDate));

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const from     = toDateKey(weekDays[0]);
  const to       = toDateKey(weekDays[6]);

  const { data: tasks = [], isLoading } = useTasksRange(from, to);

  const [modal, setModal] = useState(null);
  const close = () => setModal(null);

  const tasksByDate = useMemo(() =>
    tasks.reduce((acc, t) => {
      if (!acc[t.due_date]) acc[t.due_date] = [];
      acc[t.due_date].push(t);
      return acc;
    }, {}),
  [tasks]);

  const navigateWeek = (dir) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  const goToToday = () => setWeekStart(getWeekStart(todayDate));

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-border bg-chrome/60 backdrop-blur px-6 flex items-center shrink-0">
          <div className="text-[13px] text-mute flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink/80">Hoy</span>
          </div>
          {isLoading && (
            <span className="ml-auto text-[12px] text-mute animate-pulse">Cargando…</span>
          )}
        </div>

        {/* Calendar — ocupa todo el espacio restante */}
        <div className="flex-1 p-4 min-h-0">
          <WeekCalendarFull
            weekDays={weekDays}
            tasksByDate={tasksByDate}
            onNavigate={navigateWeek}
            onGoToToday={goToToday}
            onTaskClick={(task) => setModal({ kind: 'view', task })}
          />
        </div>
      </main>

      {/* Modal: ver/editar tarea (inline) */}
      {modal?.kind === 'view' && (
        <TaskViewModal task={modal.task} onClose={close} />
      )}

      {/* Modal: confirmar eliminación */}
      {modal?.kind === 'delete' && (
        <DeleteConfirmModal
          title="¿Eliminar tarea?"
          message={`Se eliminará "${modal.task.title}". Esta acción no se puede deshacer.`}
          onClose={close}
          onConfirm={() => deleteTask.mutate(modal.task.id)}
        />
      )}
    </div>
  );
}
