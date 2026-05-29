import client from './client';

export const labelsApi = {
  getAll:       ()       => client.get('/labels'),
  create:       (data)   => client.post('/labels', data),
  remove:       (id)     => client.delete(`/labels/${id}`),
  getTasksByLabel: (id)  => client.get(`/labels/${id}/tasks`),
};
