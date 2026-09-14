import { useEffect, useState } from 'react'
import { client } from '../api/client'

const TYPE_LABEL = { in: 'Entrada', out: 'Salida', adjust: 'Ajuste' }

const money = (value) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })
    .format(Number(value || 0))

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [movements, setMovements] = useState([])

  useEffect(() => {
    Promise.all([
      client.get('/api/stats'),
      client.get('/api/products/low-stock'),
      client.get('/api/movements', { params: { per_page: 5 } }),
    ]).then(([s, l, m]) => {
      setStats(s.data)
      setLowStock(l.data)
      setMovements(m.data.items)
    })
  }, [])

  if (!stats) return <div className="loading">Cargando…</div>

  const cards = [
    { label: 'Productos', value: stats.total_products },
    { label: 'Categorías', value: stats.total_categories },
    { label: 'Bajo mínimo', value: stats.low_stock_count, alert: stats.low_stock_count > 0 },
    { label: 'Valor del inventario', value: money(stats.inventory_value) },
    { label: 'Movimientos (7 días)', value: stats.movements_last_7_days },
  ]

  return (
    <>
      <header className="page-head">
        <h1>Resumen</h1>
      </header>

      <section className="kpis">
        {cards.map((c) => (
          <div key={c.label} className={`card kpi ${c.alert ? 'kpi-alert' : ''}`}>
            <span className="kpi-label">{c.label}</span>
            <span className="kpi-value">{c.value}</span>
          </div>
        ))}
      </section>

      <section className="grid-2">
        <div className="card">
          <h2>Productos bajo mínimo</h2>
          {lowStock.length === 0 ? (
            <p className="muted">Todo el inventario está sobre el mínimo.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th className="num">Stock</th>
                  <th className="num">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.sku}</td>
                    <td>{p.name}</td>
                    <td className="num danger">{p.stock}</td>
                    <td className="num">{p.min_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Últimos movimientos</h2>
          {movements.length === 0 ? (
            <p className="muted">Sin movimientos registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th className="num">Cant.</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.product?.name}</td>
                    <td>
                      <span className={`badge badge-${m.type}`}>{TYPE_LABEL[m.type]}</span>
                    </td>
                    <td className="num">{m.quantity}</td>
                    <td>{m.user?.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}
