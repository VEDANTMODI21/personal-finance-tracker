import api from './api';

export const dashboardApi = {
  get: (params) => api.get('/dashboard', { params }),
};

export const transactionApi = {
  list: (params) => api.get('/transactions', { params }),
};
