import axios from 'axios'

const API = axios.create({
  baseURL: 'https://task-manager-api-aa1y.onrender.com'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', new URLSearchParams(data))
export const getMe = () => API.get('/auth/me')
export const getTasks = (filters) => API.get('/tasks', { params: filters })
export const createTask = (data) => API.post('/tasks', data)
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data)
export const deleteTask = (id) => API.delete(`/tasks/${id}`)
export const completeTask = (id) => API.put(`/tasks/${id}/complete`)
export const getStats = () => API.get('/tasks/stats')