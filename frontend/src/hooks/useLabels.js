import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '../api/labels';

const LABELS_KEY = ['labels'];

export function useLabels() {
  return useQuery({
    queryKey: LABELS_KEY,
    queryFn:  () => labelsApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5, // labels cambian poco — 5min cache
  });
}

export function useLabelTasks(labelId) {
  return useQuery({
    queryKey: ['labels', labelId, 'tasks'],
    queryFn:  () => labelsApi.getTasksByLabel(labelId).then(r => r.data),
    enabled:  Boolean(labelId),
  });
}

export function useCreateLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => labelsApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: LABELS_KEY }),
  });
}

export function useDeleteLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => labelsApi.remove(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: LABELS_KEY });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
