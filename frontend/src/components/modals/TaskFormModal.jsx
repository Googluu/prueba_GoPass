import { useState } from 'react';
import { ModalOverlay, ModalHeader, ModalFooter } from '../ui/Modal';
import { Field, TextInput, TextArea, Select, DateInput, TimeInput } from '../ui/FormFields';
import { Button } from '../ui/Button';
import { useLabels } from '../../hooks/useLabels';

function LabelSelector({ selectedIds, onChange }) {
  const { data: labels = [] } = useLabels();

  const toggle = (id) =>
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map(l => {
        const active = selectedIds.includes(l.id);
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => toggle(l.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border"
            style={{
              background:   active ? `${l.color}22` : 'transparent',
              color:        active ? l.color : '#64748b',
              borderColor:  active ? l.color : 'var(--color-border)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
            {l.name}
          </button>
        );
      })}
      {labels.length === 0 && (
        <span className="text-[12px] text-mute">Sin etiquetas creadas.</span>
      )}
    </div>
  );
}

export function TaskFormModal({ mode = 'create', initial, onClose, onSubmit }) {
  const [title, setTitle]           = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus]         = useState(initial?.status ?? 'todo');
  const [priority, setPriority]     = useState(initial?.priority ?? 'medium');
  const [dueDate, setDueDate]       = useState(initial?.due_date?.slice(0, 10) ?? '');
  const [horaLimite, setHoraLimite] = useState(initial?.hora_limite?.slice(0, 5) ?? '');
  const [labelIds, setLabelIds]     = useState(initial?.labels?.map(l => l.id) ?? []);
  const [error, setError]           = useState(false);
  const [apiError, setApiError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    if (!title.trim()) { setError(true); return; }
    setSubmitting(true);
    try {
      await onSubmit({
        title:       title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date:    dueDate || null,
        hora_limite: horaLimite ? `${horaLimite}:00` : null,
        labelIds,
      });
      onClose();
    } catch (e) {
      setApiError(e?.message ?? 'Error al guardar');
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="task-modal-title">
      <ModalHeader id="task-modal-title"
        title={mode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'}
        onClose={onClose} />

      <div className="px-5 pb-5 flex flex-col gap-4">
        {apiError && (
          <div className="text-[12px] text-[#f87171] bg-[#3f1515]/50 border border-[#b13b3d]/40 rounded-lg px-3 py-2">
            {apiError}
          </div>
        )}

        <Field id="task-title" label="Título" required
          error={error ? 'El título es obligatorio.' : null}>
          <TextInput id="task-title" value={title}
            onChange={(e) => { setTitle(e.target.value); if (error) setError(false); }}
            placeholder="Ej: Implementar autenticación con OAuth"
            error={error} autoFocus />
        </Field>

        <Field id="task-desc" label="Descripción" hint="Opcional">
          <TextArea id="task-desc" rows={2} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles, criterios de aceptación..." />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="task-status" label="Estado">
            <Select id="task-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">● To Do</option>
              <option value="in_progress">● In Progress</option>
              <option value="done">● Done</option>
            </Select>
          </Field>
          <Field id="task-priority" label="Prioridad">
            <Select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field id="task-due" label="Fecha límite" hint="Opcional">
            <DateInput id="task-due" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
          <Field id="task-hora" label="Hora límite" hint="Opcional">
            <TimeInput id="task-hora" value={horaLimite} onChange={(e) => setHoraLimite(e.target.value)} />
          </Field>
        </div>

        <Field label="Etiquetas" hint="Opcional">
          <LabelSelector selectedIds={labelIds} onChange={setLabelIds} />
        </Field>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button onClick={submit} disabled={submitting}>
          {submitting ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear Tarea'}
        </Button>
      </ModalFooter>
    </ModalOverlay>
  );
}
