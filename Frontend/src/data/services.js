import api from './api';

// Events
export const eventApi = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Jadwal Pertandingan
export const jadwalApi = {
  getAll: (filters) => api.get('/jadwal-pertandingan', { params: filters }),
  getById: (id) => api.get(`/jadwal-pertandingan/${id}`),
  create: (data) => api.post('/jadwal-pertandingan', data),
  update: (id, data) => api.put(`/jadwal-pertandingan/${id}`, data),
  delete: (id) => api.delete(`/jadwal-pertandingan/${id}`),
};

// Hasil Pertandingan
export const hasilApi = {
  getAll: (filters) => api.get('/hasil-pertandingan', { params: filters }),
  getById: (id) => api.get(`/hasil-pertandingan/${id}`),
  create: (data) => api.post('/hasil-pertandingan', data),
  update: (id, data) => api.put(`/hasil-pertandingan/${id}`, data),
  delete: (id) => api.delete(`/hasil-pertandingan/${id}`),
};

// Pendaftaran
export const pendaftaranApi = {
  getAll: (filters) => api.get('/pendaftaran', { params: filters }),
  getById: (id) => api.get(`/pendaftaran/${id}`),
  create: (data) => api.post('/pendaftaran', data),
  verify: (id, status) => api.post(`/pendaftaran/${id}/verify`, { status }),
  delete: (id) => api.delete(`/pendaftaran/${id}`),
};

// Klasemen
export const klasemenApi = {
  getAll: (filters) => api.get('/klasemen', { params: filters }),
  getById: (id) => api.get(`/klasemen/${id}`),
  create: (data) => api.post('/klasemen', data),
  update: (id, data) => api.put(`/klasemen/${id}`, data),
};

// Notifikasi
export const notifikasiApi = {
  getAll: (filters) => api.get('/notifikasi', { params: filters }),
  getById: (id) => api.get(`/notifikasi/${id}`),
  create: (data) => api.post('/notifikasi', data),
  send: (data) => api.post('/notifikasi', data),
  markAsRead: (id) => api.post(`/notifikasi/${id}/read`),
  delete: (id) => api.delete(`/notifikasi/${id}`),
};

// Audit Log
export const auditLogApi = {
  getAll: (filters) => api.get('/audit-log', { params: filters }),
  getById: (id) => api.get(`/audit-log/${id}`),
  create: (data) => api.post('/audit-log', data),
};

// Tim
export const timApi = {
  getAll: () => api.get('/tim'),
  getById: (id) => api.get(`/tim/${id}`),
  create: (data) => api.post('/tim', data),
  update: (id, data) => api.put(`/tim/${id}`, data),
  delete: (id) => api.delete(`/tim/${id}`),
};

// Users
export const userApi = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getCurrent: () => api.get('/user'),
};

// Auth
export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
};
