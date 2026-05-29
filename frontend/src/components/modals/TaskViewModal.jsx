import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Folder, Calendar, Clock, Tag, Trash2, CheckCircle2,
  Circle, RefreshCw, Flame, Minus, ArrowDown, Hash, AlignLeft, List, Code2,
} from 'lucide-react';
import { useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { useLabels } from '../../hooks/useLabels';
import { formatDate, timeAgo } from '../../lib/utils';

// ── Save indicator ─────────────────────────────────────────────────────────────

function SaveIndicator({ state }) {
  if (state === 'idle')   return null;
  if (state === 'saving') return <span className="text-[11px] text-mute animate-pulse">Guardando…</span>;
  if (state === 'saved')  return <span className="text-[11px] text-[#34d399]">✓ Guardado</span>;
  return null;
}

// ── Slash command menu ─────────────────────────────────────────────────────────

const SLASH_COMMANDS = [
  { id: 'h1',   icon: Hash,      label: 'Título 1',  desc: 'Encabezado grande',   prefix: '# ' },
  { id: 'h2',   icon: Hash,      label: 'Título 2',  desc: 'Encabezado mediano',  prefix: '## ' },
  { id: 'h3',   icon: Hash,      label: 'Título 3',  desc: 'Encabezado pequeño',  prefix: '### ' },
  { id: 'p',    icon: AlignLeft, label: 'Párrafo',   desc: 'Texto normal',        prefix: '' },
  { id: 'li',   icon: List,      label: 'Lista',     desc: 'Lista con viñetas',   prefix: '• ' },
  { id: 'code', icon: Code2,     label: 'Código',    desc: 'Bloque de código',    prefix: '`' },
];

function SlashMenu({ filter, onSelect, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const filtered = SLASH_COMMANDS.filter(c =>
    !filter || c.label.toLowerCase().includes(filter.toLowerCase()) || c.id.startsWith(filter)
  );

  useEffect(() => { setActiveIdx(0); }, [filter]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[activeIdx]) onSelect(filtered[activeIdx]); }
      if (e.key === 'Escape')    onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, activeIdx, onSelect, onClose]);

  if (!filtered.length) return null;

  return (
    <div className="absolute left-0 z-50 w-64 bg-surface border border-border rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden mt-1">
      <div className="px-3 py-2 text-[10.5px] uppercase tracking-wider text-mute border-b border-border">
        Bloques básicos
      </div>
      {filtered.map((cmd, i) => (
        <button key={cmd.id} type="button"
          onClick={() => onSelect(cmd)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${i === activeIdx ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-white/5 text-ink'}`}>
          <div className="w-8 h-8 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
            <cmd.icon className="w-4 h-4 text-mute" />
          </div>
          <div>
            <div className="text-[13px] font-medium">{cmd.label}</div>
            <div className="text-[11px] text-mute">{cmd.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Rich text area ─────────────────────────────────────────────────────────────

function RichEditor({ value, onChange }) {
  const ref      = useRef(null);
  const [slash, setSlash] = useState(null); // { start, filter }

  const autoResize = () => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = ref.current.scrollHeight + 'px';
  };

  useEffect(() => { autoResize(); }, [value]);

  const handleChange = (e) => {
    const val      = e.target.value;
    const cursor   = e.target.selectionStart;
    onChange(val);

    // Detect "/" at start of current word (not inside a word)
    const lineStart = val.lastIndexOf('\n', cursor - 1) + 1;
    const lineText  = val.slice(lineStart, cursor);

    if (lineText.startsWith('/')) {
      setSlash({ start: lineStart, filter: lineText.slice(1) });
    } else {
      setSlash(null);
    }
  };

  const selectCommand = useCallback((cmd) => {
    if (!ref.current || !slash) return;
    const ta       = ref.current;
    const before   = value.slice(0, slash.start);
    const after    = value.slice(slash.start + 1 + slash.filter.length);
    const newVal   = before + cmd.prefix + after;
    onChange(newVal);
    setSlash(null);
    setTimeout(() => {
      ta.focus();
      const pos = before.length + cmd.prefix.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  }, [value, slash, onChange]);

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={e => { if (e.key === 'Escape' && slash) { e.stopPropagation(); setSlash(null); } }}
        placeholder="Agrega notas, contexto o detalles… Presiona '/' para insertar bloques"
        rows={3}
        className="w-full bg-transparent resize-none outline-none text-[14px] text-ink/90 leading-relaxed placeholder:text-mute/40 font-mono"
      />
      {slash !== null && (
        <SlashMenu
          filter={slash.filter}
          onSelect={selectCommand}
          onClose={() => setSlash(null)}
        />
      )}
    </div>
  );
}

// ── Inline property selectors ──────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       color: '#64748b', icon: Circle },
  { value: 'in_progress', label: 'In Progress', color: '#818cf8', icon: RefreshCw },
  { value: 'done',        label: 'Done',        color: '#34d399', icon: CheckCircle2 },
];

const PRIORITY_OPTIONS = [
  { value: 'high',   label: 'Alta',  color: '#ef4444', icon: Flame },
  { value: 'medium', label: 'Media', color: '#fbbf24', icon: Minus },
  { value: 'low',    label: 'Baja',  color: '#34d399', icon: ArrowDown },
];

function InlineSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value) ?? options[0];

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors">
        <current.icon className="w-3.5 h-3.5 shrink-0" style={{ color: current.color }} />
        <span className="text-[13px] font-medium" style={{ color: current.color }}>{current.label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-44 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
            {options.map(o => (
              <button key={o.value} type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors ${o.value === value ? 'bg-white/5' : ''}`}>
                <o.icon className="w-3.5 h-3.5 shrink-0" style={{ color: o.color }} />
                <span className="text-[13px]" style={{ color: o.color }}>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PropRow({ label, children }) {
  return (
    <div className="flex items-start gap-0 min-h-8 py-0.5">
      <div className="w-32 shrink-0 text-[13px] text-mute flex items-center h-8">{label}</div>
      <div className="flex-1 flex items-center">{children}</div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────

export function TaskViewModal({ task, onClose }) {
  const { data: labels = [] } = useLabels();
  const updateTask = useUpdateTask(task.project_id);
  const deleteTask = useDeleteTask(task.project_id);

  // Local state — source of truth for display (no deps on cache after init)
  const [title,      setTitle]      = useState(task.title ?? '');
  const [status,     setStatus]     = useState(task.status ?? 'todo');
  const [priority,   setPriority]   = useState(task.priority ?? 'medium');
  const [dueDate,    setDueDate]    = useState(task.due_date?.slice(0, 10) ?? '');
  const [horaLimite, setHoraLimite] = useState(task.hora_limite?.slice(0, 5) ?? '');
  const [content,    setContent]    = useState(task.description ?? '');
  const [labelIds,   setLabelIds]   = useState(task.labels?.map(l => l.id) ?? []);
  const [saveState,  setSaveState]  = useState('idle'); // idle | saving | saved

  const titleSaved = useRef(task.title ?? '');
  const debounceRef = useRef(null);
  const savedTimer  = useRef(null);

  const save = useCallback((updates) => {
    setSaveState('saving');
    clearTimeout(savedTimer.current);
    updateTask.mutate(
      { id: task.id, ...updates },
      {
        onSuccess: () => {
          setSaveState('saved');
          savedTimer.current = setTimeout(() => setSaveState('idle'), 2000);
        },
      }
    );
  }, [task.id, updateTask]);

  // Debounced save for free-text fields (title, content)
  const debouncedSave = useCallback((updates) => {
    clearTimeout(debounceRef.current);
    setSaveState('saving');
    debounceRef.current = setTimeout(() => save(updates), 800);
  }, [save]);

  // Immediate save for discrete fields (status, priority, date, labels)
  const quickSave = useCallback((updates) => {
    clearTimeout(debounceRef.current);
    save({ ...updates, labelIds });
  }, [save, labelIds]);

  useEffect(() => () => { clearTimeout(debounceRef.current); clearTimeout(savedTimer.current); }, []);

  const handleTitleChange = (val) => {
    setTitle(val);
    debouncedSave({ title: val || titleSaved.current, description: content, labelIds });
  };

  const handleContentChange = (val) => {
    setContent(val);
    debouncedSave({ title, description: val || null, labelIds });
  };

  const handleStatus = (val) => {
    setStatus(val);
    quickSave({ title, description: content || null, status: val, priority, due_date: dueDate || null, hora_limite: horaLimite ? `${horaLimite}:00` : null });
  };

  const handlePriority = (val) => {
    setPriority(val);
    quickSave({ title, description: content || null, status, priority: val, due_date: dueDate || null, hora_limite: horaLimite ? `${horaLimite}:00` : null });
  };

  const handleDueDate = (val) => {
    setDueDate(val);
    quickSave({ title, description: content || null, status, priority, due_date: val || null, hora_limite: horaLimite ? `${horaLimite}:00` : null });
  };

  const handleHora = (val) => {
    setHoraLimite(val);
    quickSave({ title, description: content || null, status, priority, due_date: dueDate || null, hora_limite: val ? `${val}:00` : null });
  };

  const handleLabelToggle = (id) => {
    const next = labelIds.includes(id) ? labelIds.filter(x => x !== id) : [...labelIds, id];
    setLabelIds(next);
    save({ title, description: content || null, status, priority, due_date: dueDate || null, hora_limite: horaLimite ? `${horaLimite}:00` : null, labelIds: next });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
    onClose();
  };

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="relative w-full bg-surface border border-border rounded-2xl shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
        style={{ maxWidth: 740 }}
        onClick={e => e.stopPropagation()}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-7 pt-5 pb-0 shrink-0">
          <div className="flex items-center gap-1.5 text-[12px] text-mute">
            <Folder className="w-3.5 h-3.5" />
            <span>{task.project?.name ?? 'Sin proyecto'}</span>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator state={saveState} />
            <button type="button" onClick={onClose}
              className="w-7 h-7 rounded-lg grid place-items-center text-mute hover:text-ink hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-7 pt-4 pb-6 min-h-0">

          {/* Title — editable, large */}
          <textarea
            value={title}
            onChange={e => {
              const val = e.target.value.replace(/\n/g, '');
              setTitle(val);
              handleTitleChange(val);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            placeholder="Sin título"
            rows={1}
            className="w-full text-[30px] font-bold text-ink bg-transparent resize-none outline-none leading-tight placeholder:text-mute/30 mb-5 overflow-hidden"
            style={{ height: 'auto' }}
          />

          {/* ── Properties ── */}
          <div className="flex flex-col gap-0 mb-6 border-b border-border pb-5">
            <PropRow label="Estado">
              <InlineSelect options={STATUS_OPTIONS} value={status} onChange={handleStatus} />
            </PropRow>

            <PropRow label="Prioridad">
              <InlineSelect options={PRIORITY_OPTIONS} value={priority} onChange={handlePriority} />
            </PropRow>

            <PropRow label="Fecha límite">
              <input type="date" value={dueDate} onChange={e => handleDueDate(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-transparent hover:bg-white/5 border border-transparent hover:border-border text-[13px] text-ink outline-none focus:border-indigo-500 transition-colors cursor-pointer" />
            </PropRow>

            <PropRow label="Hora límite">
              <input type="time" value={horaLimite} onChange={e => handleHora(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-transparent hover:bg-white/5 border border-transparent hover:border-border text-[13px] text-ink outline-none focus:border-indigo-500 transition-colors cursor-pointer" />
            </PropRow>

            <PropRow label="Etiquetas">
              <div className="flex flex-wrap gap-1.5 py-1">
                {labels.map(l => {
                  const active = labelIds.includes(l.id);
                  return (
                    <button key={l.id} type="button" onClick={() => handleLabelToggle(l.id)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                      style={{
                        background:   active ? `${l.color}22` : 'transparent',
                        color:        active ? l.color : '#64748b',
                        borderColor:  active ? l.color : '#2a2a3a',
                      }}>
                      {l.name}
                    </button>
                  );
                })}
                {labels.length === 0 && <span className="text-[12px] text-mute">Sin etiquetas creadas</span>}
              </div>
            </PropRow>
          </div>

          {/* ── Content editor ── */}
          <RichEditor value={content} onChange={handleContentChange} />

          {/* ── Footer ── */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-[11.5px] text-mute/50">
              {task.createdAt ? `Creado ${timeAgo(task.createdAt)}` : ''}
            </p>
            <button type="button" onClick={handleDelete}
              disabled={deleteTask.isPending}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] text-mute hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
