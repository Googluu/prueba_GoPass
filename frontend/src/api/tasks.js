import client from './client';

export const tasksApi = {
  getByProject: (projectId, params) => client.get(`/projects/${projectId}/tasks`, { params }),
  create:       (projectId, data)   => client.post(`/projects/${projectId}/tasks`, data),
  update:       (id, data)          => client.put(`/tasks/${id}`, data),
  updateStatus: (id, status)        => client.patch(`/tasks/${id}/status`, { status }),
  remove:       (id)                => client.delete(`/tasks/${id}`),
  getInbox:        ()           => client.get('/tasks/inbox'),
  getToday:        ()           => client.get('/tasks/today'),
  getByDateRange:  (from, to)   => client.get('/tasks/range', { params: { from, to } }),
};
