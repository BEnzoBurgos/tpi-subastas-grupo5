import { useEffect, useState } from 'react'
import { api } from '../api/client'

const ROLES = ['USER', 'SELLER', 'ADMIN']

const ROLE_COLORS = {
  ADMIN:  { bg: '#ede7f6', color: '#4527a0', border: '#b39ddb' },
  SELLER: { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
  USER:   { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/api/admin/usuarios')
      .then(setUsuarios)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleRol = async (usuario, rol) => {
    const tieneRol = usuario.roles.includes(rol)
    try {
      const updated = tieneRol
        ? await api.delete(`/api/admin/usuarios/${usuario.id}/roles/${rol}`)
        : await api.put(`/api/admin/usuarios/${usuario.id}/roles/${rol}`)
      setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch (e) { setError(e.message) }
  }

  const toggleBloqueo = async (usuario) => {
    try {
      const endpoint = usuario.bloqueado
        ? `/api/admin/usuarios/${usuario.id}/desbloquear`
        : `/api/admin/usuarios/${usuario.id}/bloquear`
      const updated = await api.put(endpoint)
      setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch (e) { setError(e.message) }
  }

  if (loading) return <div className="loading">Cargando usuarios...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>Gestion de Usuarios</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{usuarios.length} usuarios</span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ opacity: u.bloqueado ? 0.6 : 1 }}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {ROLES.map(rol => {
                        const c = ROLE_COLORS[rol]
                        const activo = u.roles.includes(rol)
                        return (
                          <button
                            key={rol}
                            onClick={() => toggleRol(u, rol)}
                            style={{
                              padding: '2px 10px',
                              borderRadius: '12px',
                              border: `1.5px solid ${activo ? c.border : 'var(--border)'}`,
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: activo ? c.bg : '#fff',
                              color: activo ? c.color : 'var(--text-muted)',
                              transition: 'all 0.15s',
                              letterSpacing: '0.03em',
                            }}
                          >
                            {rol}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: u.bloqueado ? 'var(--red-light)' : 'var(--green-light)',
                      color: u.bloqueado ? 'var(--red)' : 'var(--green)',
                    }}>
                      {u.bloqueado ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleBloqueo(u)}
                      className={`btn btn-sm ${u.bloqueado ? 'btn-success' : 'btn-danger'}`}
                    >
                      {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
