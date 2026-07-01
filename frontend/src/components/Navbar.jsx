import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/subastas') }

  return (
    <nav className="navbar">
      <Link to="/subastas" className="navbar-brand">
        TPI Subastas <span>Beta</span>
      </Link>
      <div className="navbar-links">
        <Link to="/subastas">Subastas</Link>

        {user && (
          <>
            {hasRole('SELLER') && <Link to="/crear-producto">Nuevo Producto</Link>}
            {hasRole('SELLER') && <Link to="/crear-subasta">Nueva Subasta</Link>}
            {hasRole('ADMIN')  && <Link to="/admin/usuarios">Usuarios</Link>}
            {hasRole('ADMIN')  && <Link to="/admin/categorias">Categorias</Link>}
            <Link to="/mi-historial">Mi Historial</Link>
            <Link to="/notificaciones">Notificaciones</Link>
            <span className="navbar-user">{user.nombre} ({user.roles?.join(', ')})</span>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '0.4rem 0.75rem', borderRadius: '4px', transition: 'background 0.15s' }}>
              Iniciar sesion
            </Link>
            <Link to="/register">
              <button style={{ background: '#fff', color: 'var(--primary)', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'opacity 0.15s' }}>
                Registrarse
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
