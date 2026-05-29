import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { ModalOverlay, ModalHeader, ModalFooter } from '../ui/Modal';
import { Field, TextInput, TextArea } from '../ui/FormFields';
import { Button } from '../ui/Button';
import { useUploadProjectImage } from '../../hooks/useProjects';

export function ProjectFormModal({ mode = 'create', initial, onClose, onSubmit }) {
  const [name, setName]               = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image_url ?? null);
  const [error, setError]         = useState(false);
  const [apiError, setApiError]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const uploadImage = useUploadProjectImage();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async () => {
    if (submitting) return;
    if (!name.trim()) { setError(true); return; }
    setSubmitting(true);
    try {
      const result    = await onSubmit({ name: name.trim(), description: description.trim() });
      const projectId = result?.data?.id ?? initial?.id;
      if (imageFile && projectId) {
        await uploadImage.mutateAsync({ id: projectId, file: imageFile });
      }
      onClose();
    } catch (e) {
      setApiError(e?.message ?? 'Error al guardar');
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="project-modal-title">
      <ModalHeader id="project-modal-title"
        title={mode === 'edit' ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        onClose={onClose} />

      <div className="px-5 pb-5 flex flex-col gap-4">
        {apiError && (
          <div className="text-[12px] text-[#f87171] bg-[#3f1515]/50 border border-[#b13b3d]/40 rounded-lg px-3 py-2">
            {apiError}
          </div>
        )}

        <Field id="project-name" label="Nombre del proyecto" required
          error={error ? 'El nombre del proyecto es obligatorio.' : null}>
          <TextInput id="project-name" value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(false); setApiError(''); }}
            placeholder="Ej: App de ecommerce" error={error} autoFocus />
        </Field>

        <Field id="project-desc" label="Descripción" hint="Opcional">
          <TextArea id="project-desc" rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el proyecto, su objetivo y a quién va dirigido..." />
        </Field>

        {/* Image upload */}
        <div>
          <p className="text-[12px] font-medium text-ink/80 mb-2">
            Imagen del proyecto <span className="text-mute font-normal">(Opcional)</span>
          </p>
          {imagePreview ? (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={clearImage}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-bg/80 backdrop-blur grid place-items-center text-mute hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-24 rounded-lg border border-dashed border-border hover:border-indigo-500/50 bg-surface/40 hover:bg-indigo-500/3 flex flex-col items-center justify-center gap-1.5 transition-colors">
              <ImagePlus className="w-5 h-5 text-mute" />
              <span className="text-[12px] text-mute">Haz clic para subir una imagen</span>
              <span className="text-[10.5px] text-mute/60">PNG, JPG, WEBP · máx. 5 MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button onClick={submit} disabled={submitting}>
          {submitting ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear Proyecto'}
        </Button>
      </ModalFooter>
    </ModalOverlay>
  );
}
