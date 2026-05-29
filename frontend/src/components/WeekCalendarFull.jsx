import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toDateKey } from '../lib/utils';
import { PRIORITY_TOKEN } from './ui/Badge';

const HOURS     = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM → 9 PM
const CELL_H    = 56; // px per hour
const COL_LEFT  = 56; // width of time gutter
const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function hourLabel(h) {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function parseHora(hora) {
  if (!hora) return null;
  const [h, m] = hora.split(':').map(Number);
  if (isNaN(h)) return null;
  return h + (m || 0) / 60;
}

// Task card posicionada por hora en el time grid
function TaskTimeCard({ task, onClick }) {
  const p     = PRIORITY_TOKEN[task.priority];
  const isDone = task.status === 'done';
  const hour  = parseHora(task.hora_limite);
  if (hour === null || hour < 7 || hour > 22) return null;

  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick(); }}
      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-left transition-all hover:brightness-125 active:scale-[0.98] z-10"
      style={{
        top:        (hour - 7) * CELL_H,
        height:     Math.max(CELL_H * 0.8, 40),
        background: p.bg,
        borderLeft: `3px solid ${p.border}`,
        opacity:    isDone ? 0.6 : 1,
      }}>
      <p className="text-[11px] font-medium truncate leading-tight"
        style={{ color: p.fg, textDecoration: isDone ? 'line-through' : 'none' }}>
        {task.title}
      </p>
      <p className="text-[9px] truncate mt-0.5" style={{ color: `${p.fg}99` }}>
        {task.hora_limite?.slice(0, 5)} · {task.project?.name}
      </p>
    </button>
  );
}

// Task card en la fila "todo el día"
function TaskCalendarCard({ task, onClick }) {
  const p      = PRIORITY_TOKEN[task.priority];
  const isDone  = task.status === 'done';
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick(); }}
      className="w-full text-left rounded-md px-2 py-1.5 mb-1 transition-all hover:brightness-125 active:scale-[0.98]"
      style={{ background: p.bg, borderLeft: `3px solid ${p.border}`, opacity: isDone ? 0.6 : 1 }}>
      <p className="text-[11px] font-medium truncate leading-tight"
        style={{ color: p.fg, textDecoration: isDone ? 'line-through' : 'none' }}>
        {task.title}
      </p>
      {task.project && (
        <p className="text-[10px] truncate mt-0.5" style={{ color: `${p.fg}99` }}>
          {task.project.name}
        </p>
      )}
    </button>
  );
}

// Línea roja de hora actual
function CurrentTimeLine({ weekDays }) {
  const [top, setTop]       = useState(null);
  const [colIdx, setColIdx] = useState(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h   = now.getHours() + now.getMinutes() / 60;
      if (h < 7 || h > 22) { setTop(null); return; }
      setTop((h - 7) * CELL_H);
      const todayKey = toDateKey(now);
      setColIdx(weekDays.findIndex(d => toDateKey(d) === todayKey));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [weekDays]);

  if (top === null || colIdx === null || colIdx < 0) return null;
  return (
    <div className="absolute z-20 pointer-events-none flex items-center"
      style={{
        top,
        left:  `calc(${COL_LEFT}px + ${colIdx} * (100% - ${COL_LEFT}px) / 7)`,
        width: `calc((100% - ${COL_LEFT}px) / 7)`,
      }}>
      <div className="w-2.5 h-2.5 rounded-full bg-[#f87171] shrink-0 -ml-1" />
      <div className="flex-1 h-px bg-[#f87171]" />
    </div>
  );
}

export function WeekCalendarFull({ weekDays, tasksByDate, onNavigate, onGoToToday, onTaskClick }) {
  // Un único contenedor scroll — elimina el mismatch de ancho del scrollbar entre header y grid
  const scrollRef = useRef(null);
  const todayKey  = toDateKey(new Date());
  const monthYear = weekDays[3].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Auto-scroll a la hora actual al montar
  useEffect(() => {
    if (!scrollRef.current) return;
    const h = new Date().getHours();
    // Desplazar hasta la hora actual - 1 (para contexto), después del sticky header (~80px)
    if (h >= 7) scrollRef.current.scrollTop = Math.max(0, (h - 7 - 1) * CELL_H);
  }, []);

  const totalWeek = weekDays.reduce((s, d) => s + (tasksByDate[toDateKey(d)]?.length ?? 0), 0);

  function splitTasks(tasks) {
    const timed  = tasks.filter(t => t.hora_limite && parseHora(t.hora_limite) !== null);
    const allDay = tasks.filter(t => !t.hora_limite || parseHora(t.hora_limite) === null);
    return { timed, allDay };
  }

  const hasAllDay = weekDays.some(d => splitTasks(tasksByDate[toDateKey(d)] ?? []).allDay.length > 0);

  return (
    <div className="flex flex-col h-full bg-bg rounded-xl border border-border overflow-hidden">

      {/* ── Navigation header (fuera del scroll) ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
        <button onClick={onGoToToday}
          className="px-3 h-8 rounded-lg border border-border text-[13px] text-ink/80 hover:bg-white/5 transition-colors">
          Hoy
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onNavigate(-1)}
            className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-mute hover:text-ink transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => onNavigate(1)}
            className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-mute hover:text-ink transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-[15px] font-semibold text-ink capitalize">{monthYear}</span>
        {totalWeek > 0 && (
          <span className="ml-auto text-[12px] text-mute">
            {totalWeek} tarea{totalWeek !== 1 ? 's' : ''} esta semana
          </span>
        )}
      </div>

      {/* ── Único contenedor scroll — headers sticky dentro de él ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">

        {/* Headers pegajosos (sticky) — misma anchura que el time grid = sin desalineación */}
        <div className="sticky top-0 z-20 bg-bg border-b border-border">
          {/* Day headers */}
          <div className="grid" style={{ gridTemplateColumns: `${COL_LEFT}px repeat(7, 1fr)` }}>
            <div /> {/* gutter vacío */}
            {weekDays.map(day => {
              const key     = toDateKey(day);
              const isToday = key === todayKey;
              const dow     = day.getDay();
              return (
                <div key={key}
                  className={`py-3 flex flex-col items-center gap-1 border-l border-border ${isToday ? 'bg-indigo-500/5' : ''}`}>
                  <span className={`text-[10.5px] font-semibold tracking-widest uppercase ${isToday ? 'text-indigo-400' : 'text-mute'}`}>
                    {DAY_NAMES[dow]}
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[17px] font-bold transition-colors ${
                    isToday ? 'bg-indigo-500 text-white shadow-[0_0_14px_-4px_rgba(99,102,241,0.8)]' : 'text-ink/80'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day row (si hay tareas sin hora) */}
          {hasAllDay && (
            <div className="grid border-t border-border"
              style={{ gridTemplateColumns: `${COL_LEFT}px repeat(7, 1fr)` }}>
              <div className="text-[10px] text-mute text-right pr-2 pt-2 leading-tight select-none">
                todo<br />el<br />día
              </div>
              {weekDays.map(day => {
                const key    = toDateKey(day);
                const { allDay } = splitTasks(tasksByDate[key] ?? []);
                const isToday = key === todayKey;
                return (
                  <div key={key}
                    className={`border-l border-border px-1 py-1 min-h-9 ${isToday ? 'bg-indigo-500/4' : ''}`}>
                    {allDay.map(t => (
                      <TaskCalendarCard key={t.id} task={t} onClick={() => onTaskClick(t)} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Time grid (dentro del mismo scroll container) ── */}
        <div className="relative" style={{ height: CELL_H * HOURS.length }}>
          <div className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `${COL_LEFT}px repeat(7, 1fr)` }}>

            {/* Labels de hora */}
            <div className="relative select-none">
              {HOURS.map(h => (
                <div key={h} style={{ height: CELL_H }}
                  className="relative flex items-start justify-end pr-3">
                  <span className="text-[11px] text-mute tabular-nums -mt-2">{hourLabel(h)}</span>
                </div>
              ))}
            </div>

            {/* Columnas de días con tareas posicionadas */}
            {weekDays.map(day => {
              const key     = toDateKey(day);
              const isToday = key === todayKey;
              const { timed } = splitTasks(tasksByDate[key] ?? []);
              return (
                <div key={key}
                  className={`border-l border-border relative ${isToday ? 'bg-indigo-500/2.5' : ''}`}>
                  {HOURS.map(h => (
                    <div key={h} style={{ height: CELL_H }} className="border-b border-border/25" />
                  ))}
                  {timed.map(t => (
                    <TaskTimeCard key={t.id} task={t} onClick={() => onTaskClick(t)} />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Línea de hora actual */}
          <CurrentTimeLine weekDays={weekDays} />
        </div>
      </div>
    </div>
  );
}
