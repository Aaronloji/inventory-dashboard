import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Categories from './pages/Categories'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Movements from './pages/Movements'
import Products from './pages/Products'
import Users from './pages/Users'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<Products />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="movimientos" element={<Movements />} />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
