import { useEffect, useState } from 'react'
import { api } from '../api/client'

const ROLES = ['USER', 'SELLER', 'ADMIN']

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(true)

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
    } catch (e) {
      setError(e.message)
    }
  }

  const toggleBloqueo = async (usuario) => {
    try {
      const endpoint = usuario.bloqueado
        ? `/api/admin/usuarios/${usuario.id}/desbloquear`
        : `/api/admin/usuarios/${usuario.id}/bloquear`
      const updated = await api.put(endpoint)
      setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className="container"><p>Cargando usuarios...</p></div>

  return (
    <div className="container">
      <h2 style={{ marginBottom: '1.5rem' }}>Gestion de Usuarios</h2>
      {error && <div className="error-msg">{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
              <th style={th}>ID</th>
              <th style={th}>Nombre</th>
              <th style={th}>Email</th>
              <th style={th}>Roles</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee', opacity: u.bloqueado ? 0.6 : 1 }}>
                <td style={td}>{u.id}</td>
                <td style={td}>{u.nombre} {u.apellido}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {ROLES.map(rol => (
                      <button
                        key={rol}
                        onClick={() => toggleRol(u, rol)}
                        style={{
                          padding: '2px 10px',
                          borderRadius: '12px',
                          border: '1.5px solid',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: u.roles.includes(rol) ? roleColor(rol) : '#fff',
                          color: u.roles.includes(rol) ? '#fff' : '#888',
                          borderColor: roleColor(rol),
                          transition: 'all 0.15s',
                        }}
                      >
                        {rol}
                      </button>
                    ))}
                  </div>
                </td>
                <td style={td}>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: u.bloqueado ? '#fee2e2' : '#dcfce7',
                    color: u.bloqueado ? '#dc2626' : '#16a34a',
                  }}>
                    {u.bloqueado ? 'Bloqueado' : 'Activo'}
                  </span>
                </td>
                <td style={td}>
                  <button
                    onClick={() => toggleBloqueo(u)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      background: u.bloqueado ? '#16a34a' : '#dc2626',
                      color: '#fff',
                    }}
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
  )
}

const th = { padding: '12px 16px', fontWeight: 600, fontSize: '0.85rem', color: '#555' }
const td = { padding: '12px 16px', fontSize: '0.9rem' }

function roleColor(rol) {
  if (rol === 'ADMIN')  return '#7c3aed'
  if (rol === 'SELLER') return '#ea580c'
  return '#2563eb'
}
