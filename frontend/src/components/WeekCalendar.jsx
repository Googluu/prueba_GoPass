import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DAY_SHORT, toDateKey, formatWeekRange } from '../lib/utils';
import { PRIORITY_TOKEN } from './ui/Badge';

// Dots: up to 3 priority dots per day
function TaskDots({ tasks }) {
  if (!tasks?.length) return <div className="h-3" />;
  const visible = tasks.slice(0, 3);
  return (
    <div className="flex items-center justify-center gap-0.5 h-3 mt-1">
      {visible.map((t, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: PRIORITY_TOKEN[t.priority]?.dot ?? '#64748b' }} />
      ))}
      {tasks.length > 3 && (
        <span className="text-[9px] text-mute leading-none">+</span>
      )}
    </div>
  );
}

function DayCell({ date, tasks = [], isSelected, isToday, isWeekend, onClick }) {
  const count = tasks.length;

  let bg = 'bg-transparent hover:bg-white/5';
  let textColor = isWeekend ? 'text-mute' : 'text-ink/80';
  let ring = '';

  if (isToday && !isSelected) {
    ring = 'ring-1 ring-indigo-500/60';
    textColor = 'text-indigo-400';
  }
  if (isSelected) {
    bg = 'bg-indigo-500';
    textColor = 'text-white';
    ring = '';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer ${bg} ${ring}`}
    >
      <span className={`text-[10px] font-medium uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-mute'}`}>
        {DAY_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
      </span>
      <span className={`text-[15px] font-semibold mt-0.5 leading-none ${textColor}`}>
        {date.getDate()}
      </span>
      {isSelected ? (
        <div className="h-3 mt-1 flex items-center">
          {count > 0 && (
            <span className="text-[10px] text-indigo-200 font-medium">{count}</span>
          )}
        </div>
      ) : (
        <TaskDots tasks={tasks} />
      )}
    </button>
  );
}

export function WeekCalendar({ weekDays, tasksByDate, selectedDate, onSelectDate, onNavigate }) {
  const todayKey = toDateKey(new Date());

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Navigation header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          type="button"
          onClick={() => onNavigate(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-mute hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[13px] font-medium text-ink capitalize">
            {formatWeekRange(weekDays)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate(1)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-mute hover:text-ink transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 p-3">
        {weekDays.map((day) => {
          const key     = toDateKey(day);
          const dow     = day.getDay();
          return (
            <DayCell
              key={key}
              date={day}
              tasks={tasksByDate[key] ?? []}
              isSelected={selectedDate === key}
              isToday={key === todayKey}
              isWeekend={dow === 0 || dow === 6}
              onClick={() => onSelectDate(key)}
            />
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <span className="text-[11px] text-mute">
          {weekDays.reduce((s, d) => s + (tasksByDate[toDateKey(d)]?.length ?? 0), 0)} tareas esta semana
        </span>
        <div className="flex items-center gap-2 ml-auto">
          {[['high','Alta'],['medium','Media'],['low','Baja']].map(([p, label]) => (
            <span key={p} className="inline-flex items-center gap-1 text-[10px] text-mute">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_TOKEN[p].dot }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
