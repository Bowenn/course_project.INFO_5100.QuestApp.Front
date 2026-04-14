import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 errors globally - just clear token, don't redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('token-expired'))
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password, role = 'GIVER') => api.post('/auth/register', { username, email, password, role }),
}

export const tasksAPI = {
  list: () => api.get('/tasks'),
  listPublished: () => api.get('/tasks/published'),
  create: (title, description, bounty) => api.post('/tasks', { title, description, bounty }),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  publish: (id) => api.post(`/tasks/${id}/publish`),
  accept: (id) => api.post(`/tasks/${id}/accept`),
  confirm: (id) => api.post(`/tasks/${id}/confirm`),
  cancel: (id) => api.post(`/tasks/${id}/cancel`),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const assignmentsAPI = {
  list: () => api.get('/assignments'),
  update: (id, status, note = '') => api.put(`/assignments/${id}`, { status, note }),
  confirm: (id) => api.post(`/assignments/${id}/confirm`),
}

export const usersAPI = {
  me: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  listAll: () => api.get('/users'),
  deposit: (amount) => api.post('/users/deposit', { amount }),
  withdraw: (amount) => api.post('/users/withdraw', { amount }),
}
