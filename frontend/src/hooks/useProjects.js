import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';

const PROJECTS_KEY = ['projects'];

export function useProjects(search = '') {
  return useQuery({
    queryKey: [...PROJECTS_KEY, search],
    queryFn:  () => projectsApi.getAll(search).then(r => r.data),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn:  () => projectsApi.getById(id).then(r => r.data),
    enabled:  Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectsApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => projectsApi.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectsApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUploadProjectImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => projectsApi.uploadImage(id, file).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}
