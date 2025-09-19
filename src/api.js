// elder/src/api.js
import axios from 'axios'
const API_BASE = import.meta?.env?.VITE_API_BASE_URL || '/api'
const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export const me = () => api.get('/auth/me')
export const login = ({ email, password }) => api.post('/auth/login', { email, password })

export const transcribe = (file) => {
  const fd = new FormData()
  fd.append('file', file, 'speech.webm')
  return api.post('/transcribe', fd).catch(() => api.post('/audio/transcribe', fd))
}

export const chat = (text) => {
  return api.post('/chat', { text })
}

export const tts = (text) => {
  return api.post('/tts', { text })
}

export default api
