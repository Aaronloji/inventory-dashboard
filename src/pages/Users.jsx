import { useEffect, useState } from 'react'
import { apiError, client } from '../api/client'
import Modal from '../components/Modal'

const ROLES = ['admin', 'manager', 'viewer']

export default function Users() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'viewer' })
  const [error, setError] = useState('')

  function load() {
    client.get('/api/users').then(({ data }) => setItems(data))
  }

  useEffect(load, [])

  async function changeRole(user, role) {
    await client.patch(`/api/users/${user.id}`, { role })
    load()
  }

  async function toggleActive(user) {
    await client.patch(`/api/users/${user.id}`, { is_active: !user.is_active })
    load()
  }

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await client.post('/api/auth/register', form)
      setOpen(false)
      load()
    } catch (err) {
      setError(apiError(err, 'No se pudo crear el usuario.'))
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Usuarios</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm({ username: '', email: '', password: '', role: 'viewer' })
            setError('')
            setOpen(true)
          }}
        >
          Nuevo usuario
        </button>
      </header>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td className="muted">{u.email}</td>
                <td>
                  <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-in' : 'badge-out'}`}>
                    {u.is_active ? 'activo' : 'inactivo'}
                  </span>
                </td>
                <td className="row-actions">
                  <button className="btn btn-ghost" onClick={() => toggleActive(u)}>
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Nuevo usuario" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            {error && <div className="alert">{String(error)}</div>}
            <label>
              Usuario
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Contraseña
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </label>
              <label>
                Rol
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Crear</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
