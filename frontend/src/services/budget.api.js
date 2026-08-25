import api from './api';

export const budgetApi = {
  list: (month) => api.get('/budgets', { params: { month } }),
  upsert: (payload) => api.post('/budgets', payload),
  remove: (id) => api.delete(`/budgets/${id}`),
};

export const recurringExpenseApi = {
  list: () => api.get('/recurring-expenses'),
  create: (payload) => api.post('/recurring-expenses', payload),
  update: (id, payload) => api.put(`/recurring-expenses/${id}`, payload),
  remove: (id) => api.delete(`/recurring-expenses/${id}`),
  generateDue: () => api.post('/recurring-expenses/generate-due'),
};

export const userApi = {
  updateSettings: (payload) => api.put('/users/settings', payload),
};
