import axios from 'axios'

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true, // 重要：讓瀏覽器收/帶 sid Cookie
})

export function login({ username, password }) {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const whoAmI = () => api.get('/auth/me').catch(() => null)
export const logout = () => api.post('/auth/logout')
