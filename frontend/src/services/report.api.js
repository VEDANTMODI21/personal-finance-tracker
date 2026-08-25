import api from './api';

export const reportApi = {
  monthly: (month) => api.get('/reports/monthly', { params: { month } }),
  downloadPdf: (month) => api.get('/reports/monthly/pdf', { params: { month }, responseType: 'blob' }),
  downloadExcel: (month) => api.get('/reports/monthly/excel', { params: { month }, responseType: 'blob' }),
  downloadCsv: (month) => api.get('/reports/monthly/csv', { params: { month }, responseType: 'blob' }),
};

export function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
