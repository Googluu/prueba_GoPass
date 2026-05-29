import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';

const taskKey = (projectId) => ['tasks', projectId];

export function useTasks(projectId, filters = {}) {
  return useQuery({
    queryKey: [...taskKey(projectId), filters],
    queryFn:  () => tasksApi.getByProject(projectId, filters).then(r => r.data),
    enabled:  Boolean(projectId),
  });
}

export function useCreateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.create(projectId, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tasksApi.update(id, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateTaskStatus(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateStatus(id, status),

    // 1. Antes de la petición: actualiza el cache local al instante
    onMutate: async ({ id, status }) => {
      // Cancela refetches pendientes para que no sobreescriban el cambio optimista
      await qc.cancelQueries({ queryKey: taskKey(projectId) });

      // Guarda snapshot de todos los queries que coincidan (con o sin filtros)
      const previousData = qc.getQueriesData({ queryKey: taskKey(projectId) });

      // Actualiza el cache inmediatamente → la tarea salta de columna al instante
      qc.setQueriesData({ queryKey: taskKey(projectId) }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(task => task.id === id ? { ...task, status } : task);
      });

      return { previousData };
    },

    // 2. Si el backend falla: revierte al estado anterior
    onError: (_err, _vars, context) => {
      context?.previousData?.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    // 3. Siempre al terminar: sincroniza con el servidor
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useTasksRange(from, to) {
  return useQuery({
    queryKey: ['tasks', 'range', from, to],
    queryFn:  () => tasksApi.getByDateRange(from, to).then(r => r.data),
    enabled:  Boolean(from && to),
  });
}

export function useInbox() {
  return useQuery({
    queryKey: ['tasks', 'inbox'],
    queryFn:  () => tasksApi.getInbox().then(r => r.data),
  });
}

export function useToday() {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn:  () => tasksApi.getToday().then(r => r.data),
  });
}

export function useDeleteTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksApi.remove(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
