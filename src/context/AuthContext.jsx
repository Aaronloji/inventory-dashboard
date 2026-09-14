import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { client } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    client
      .get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const { data } = await client.post('/api/auth/login', { username, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    const me = await client.get('/api/auth/me')
    setUser(me.data)
  }

  function logout() {
    localStorage.clear()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      // El backend es la autoridad; esto solo decide qué se muestra en pantalla.
      can: (...roles) => !!user && roles.includes(user.role),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
