import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/movimientos', label: 'Movimientos' },
  { to: '/usuarios', label: 'Usuarios', adminOnly: true },
]

export default function Layout() {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Inventario</div>
        <nav>
          {LINKS.filter((l) => !l.adminOnly || can('admin')).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="who">
            <strong>{user?.username}</strong>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
