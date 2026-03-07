import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
}

export const tasksAPI = {
  list: () => api.get('/tasks'),
  listPublished: () => api.get('/tasks/published'),
  create: (title, description) => api.post('/tasks', { title, description }),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  publish: (id) => api.post(`/tasks/${id}/publish`),
  accept: (id) => api.post(`/tasks/${id}/accept`),
  cancel: (id) => api.post(`/tasks/${id}/cancel`),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const assignmentsAPI = {
  list: () => api.get('/assignments'),
  update: (id, status, note = '') => api.put(`/assignments/${id}`, { status, note }),
}

export const usersAPI = {
  me: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  listAll: () => api.get('/users'),
}
