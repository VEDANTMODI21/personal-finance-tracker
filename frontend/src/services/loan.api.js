import api from './api';

export const loanApi = {
  list: (params) => api.get('/loans', { params }),
  get: (id) => api.get(`/loans/${id}`),
  create: (payload) => api.post('/loans', payload),
  update: (id, payload) => api.put(`/loans/${id}`, payload),
  remove: (id) => api.delete(`/loans/${id}`),
  dashboard: () => api.get('/loans/dashboard'),
  addPayment: (id, payload) => api.post(`/loans/${id}/payments`, payload),
  listPayments: (id) => api.get(`/loans/${id}/payments`),
  removePayment: (id, paymentId) => api.delete(`/loans/${id}/payments/${paymentId}`),
};
