import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(apiError(err, 'No se pudo iniciar sesión.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>Inventario</h1>
        <p className="muted">Ingrese con su usuario del sistema.</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Usuario
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoFocus
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>

        <div className="demo-hint">
          <strong>Demo:</strong> admin / admin1234 · bodega / bodega1234 · consulta / consulta1234
        </div>
      </form>
    </div>
  )
}
