import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/subastas" className="navbar-brand">🏷️ TPI Subastas</Link>
      <div className="navbar-links">
        <Link to="/subastas">Subastas</Link>
        {hasRole('SELLER') && <Link to="/crear-producto">Crear Producto</Link>}
        {hasRole('SELLER') && <Link to="/crear-subasta">Crear Subasta</Link>}
        {hasRole('ADMIN') && <Link to="/admin/usuarios">Usuarios</Link>}
        {hasRole('ADMIN') && <Link to="/admin/categorias">Categorias</Link>}
        <Link to="/notificaciones">Notificaciones</Link>
        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
          {user?.nombre} ({user?.roles?.join(', ')})
        </span>
        <button className="btn-logout" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  )
}
