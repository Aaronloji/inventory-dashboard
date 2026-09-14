import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const client = axios.create({ baseURL })

// Adjunta el access token a cada petición.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el access token expiró, intenta renovarlo una vez con el refresh token.
let refreshing = null

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const refreshToken = localStorage.getItem('refresh_token')

    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true
      try {
        refreshing =
          refreshing ||
          axios.post(
            `${baseURL}/api/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          )
        const { data } = await refreshing
        refreshing = null
        localStorage.setItem('access_token', data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return client(original)
      } catch {
        refreshing = null
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function apiError(error, fallback = 'Ocurrió un error.') {
  return error.response?.data?.message || error.response?.data?.errors?.json || fallback
}
