import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Notificaciones() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = () =>
    api.get('/api/notificaciones/mis-notificaciones')
      .then(setNotifs)
      .catch(console.error)
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const marcarLeida = async (id) => {
    try {
      await api.put(`/api/notificaciones/${id}/leer`)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    } catch (err) { console.error(err) }
  }

  const noLeidas = notifs.filter(n => !n.leida).length

  if (loading) return <div className="loading">Cargando notificaciones...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>
          Notificaciones
          {noLeidas > 0 && (
            <span style={{
              marginLeft: '0.75rem',
              background: 'var(--red)',
              color: '#fff',
              borderRadius: '12px',
              padding: '2px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              verticalAlign: 'middle',
            }}>
              {noLeidas} nueva{noLeidas > 1 ? 's' : ''}
            </span>
          )}
        </h2>
      </div>

      {notifs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No tenes notificaciones.
        </div>
      )}

      {notifs.map(n => (
        <div key={n.id} className={`notif-item ${!n.leida ? 'no-leida' : ''}`}>
          <div style={{ flex: 1 }}>
            <div className="notif-tipo">{n.tipo.replace(/_/g, ' ')}</div>
            <div className="notif-mensaje">{n.mensaje}</div>
            <div className="notif-fecha">{new Date(n.fecha).toLocaleString()}</div>
          </div>
          {!n.leida && (
            <button
              className="btn btn-sm"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid #c5cae9', whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => marcarLeida(n.id)}
            >
              Marcar leida
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
