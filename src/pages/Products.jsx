import { useEffect, useState } from 'react'
import { apiError, client } from '../api/client'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const EMPTY = { sku: '', name: '', description: '', unit_price: '', min_stock: 0, category_id: '' }

export default function Products() {
  const { can } = useAuth()
  const editable = can('admin', 'manager')

  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await client.get('/api/products', {
      params: { q: query || undefined, page, per_page: 10 },
    })
    setData(data)
  }

  useEffect(() => {
    client.get('/api/categories').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    load()
  }, [query, page])

  function openNew() {
    setForm({ ...EMPTY, category_id: categories[0]?.id || '' })
    setEditing('new')
    setError('')
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      description: product.description || '',
      unit_price: product.unit_price,
      min_stock: product.min_stock,
      category_id: product.category_id,
    })
    setEditing(product)
    setError('')
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing === 'new') {
        await client.post('/api/products', { ...form, category_id: Number(form.category_id) })
      } else {
        const { sku, ...payload } = form
        await client.patch(`/api/products/${editing.id}`, {
          ...payload,
          category_id: Number(form.category_id),
        })
      }
      setEditing(null)
      load()
    } catch (err) {
      setError(apiError(err, 'No se pudo guardar el producto.'))
    }
  }

  async function remove(product) {
    if (!window.confirm(`¿Eliminar ${product.sku}? Se borra también su historial.`)) return
    try {
      await client.delete(`/api/products/${product.id}`)
      load()
    } catch (err) {
      alert(apiError(err))
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Productos</h1>
        {editable && (
          <button className="btn btn-primary" onClick={openNew}>
            Nuevo producto
          </button>
        )}
      </header>

      <div className="card">
        <input
          className="search"
          placeholder="Buscar por nombre o SKU…"
          value={query}
          onChange={(e) => {
            setPage(1)
            setQuery(e.target.value)
          }}
        />

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="num">Precio</th>
              <th className="num">Stock</th>
              {editable && <th></th>}
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td className="num">{Number(p.unit_price).toLocaleString('es-CR')}</td>
                <td className={`num ${p.low_stock ? 'danger' : ''}`}>{p.stock}</td>
                {editable && (
                  <td className="row-actions">
                    <button className="btn btn-ghost" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    {can('admin') && (
                      <button className="btn btn-danger" onClick={() => remove(p)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pager">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span className="muted">
            Página {data.page} de {data.pages || 1} · {data.total} productos
          </span>
          <button
            className="btn btn-ghost"
            disabled={page >= data.pages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Nuevo producto' : `Editar ${editing.sku}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            {error && <div className="alert">{String(error)}</div>}
            {editing === 'new' && (
              <label>
                SKU
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
              </label>
            )}
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
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Precio unitario
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  required
                />
              </label>
              <label>
                Stock mínimo
                <input
                  type="number"
                  min="0"
                  value={form.min_stock}
                  onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })}
                />
              </label>
            </div>
            <label>
              Categoría
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {editing === 'new' && (
              <p className="muted">El stock inicia en 0 y se carga desde Movimientos.</p>
            )}
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
