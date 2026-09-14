import { useEffect, useState } from 'react'
import { apiError, client } from '../api/client'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const TYPES = [
  { value: 'in', label: 'Entrada' },
  { value: 'out', label: 'Salida' },
  { value: 'adjust', label: 'Ajuste' },
]

export default function Movements() {
  const { can } = useAuth()
  const editable = can('admin', 'manager')

  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [products, setProducts] = useState([])
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ product_id: '', type: 'in', quantity: 1, note: '' })
  const [error, setError] = useState('')

  function load() {
    client
      .get('/api/movements', { params: { type: type || undefined, page, per_page: 10 } })
      .then(({ data }) => setData(data))
  }

  useEffect(() => {
    client
      .get('/api/products', { params: { per_page: 100 } })
      .then(({ data }) => setProducts(data.items))
  }, [])

  useEffect(load, [type, page])

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      await client.post('/api/movements', {
        ...form,
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
      })
      setOpen(false)
      load()
    } catch (err) {
      setError(apiError(err, 'No se pudo registrar el movimiento.'))
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Movimientos</h1>
        {editable && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({ product_id: products[0]?.id || '', type: 'in', quantity: 1, note: '' })
              setError('')
              setOpen(true)
            }}
          >
            Registrar movimiento
          </button>
        )}
      </header>

      <div className="card">
        <div className="filters">
          <select
            value={type}
            onChange={(e) => {
              setPage(1)
              setType(e.target.value)
            }}
          >
            <option value="">Todos los tipos</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th className="num">Cantidad</th>
              <th className="num">Stock final</th>
              <th>Usuario</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((m) => (
              <tr key={m.id}>
                <td className="muted">{new Date(m.created_at).toLocaleString('es-CR')}</td>
                <td>{m.product?.name}</td>
                <td>
                  <span className={`badge badge-${m.type}`}>
                    {TYPES.find((t) => t.value === m.type)?.label}
                  </span>
                </td>
                <td className="num">{m.quantity}</td>
                <td className="num">{m.stock_after}</td>
                <td>{m.user?.username}</td>
                <td className="muted">{m.note}</td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  Sin movimientos.
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
            Página {data.page} de {data.pages || 1} · {data.total} movimientos
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

      {open && (
        <Modal title="Registrar movimiento" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            {error && <div className="alert">{String(error)}</div>}
            <label>
              Producto
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} (stock {p.stock})
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                Tipo
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {form.type === 'adjust' ? 'Stock final' : 'Cantidad'}
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              Nota
              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Factura 1042, devolución, conteo físico…"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Registrar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
