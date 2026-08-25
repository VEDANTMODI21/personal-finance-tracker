import api from './api';

export const incomeApi = {
  list: (params) => api.get('/income', { params }),
  get: (id) => api.get(`/income/${id}`),
  create: (payload) => api.post('/income', payload),
  update: (id, payload) => api.put(`/income/${id}`, payload),
  remove: (id) => api.delete(`/income/${id}`),
};
