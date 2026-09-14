import { useEffect, useState } from 'react'
import { apiError, client } from '../api/client'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

export default function Categories() {
  const { can } = useAuth()
  const editable = can('admin', 'manager')

  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  function load() {
    client.get('/api/categories').then(({ data }) => setItems(data))
  }

  useEffect(load, [])

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing === 'new') await client.post('/api/categories', form)
      else await client.put(`/api/categories/${editing.id}`, form)
      setEditing(null)
      load()
    } catch (err) {
      setError(apiError(err, 'No se pudo guardar la categoría.'))
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Categorías</h1>
        {editable && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({ name: '', description: '' })
              setEditing('new')
            }}
          >
            Nueva categoría
          </button>
        )}
      </header>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              {editable && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="muted">{c.description}</td>
                {editable && (
                  <td className="row-actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setForm({ name: c.name, description: c.description || '' })
                        setEditing(c)
                      }}
                    >
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Nueva categoría' : `Editar ${editing.name}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            {error && <div className="alert">{String(error)}</div>}
            <label>
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Descripción
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
