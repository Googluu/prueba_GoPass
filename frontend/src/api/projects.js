import client from './client';

export const projectsApi = {
  getAll:      (search)      => client.get('/projects', { params: search ? { search } : {} }),
  getById:     (id)          => client.get(`/projects/${id}`),
  create:      (data)        => client.post('/projects', data),
  update:      (id, data)    => client.put(`/projects/${id}`, data),
  remove:      (id)          => client.delete(`/projects/${id}`),
  uploadImage: (id, file)    => {
    const form = new FormData();
    form.append('image', file);
    return client.post(`/projects/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
