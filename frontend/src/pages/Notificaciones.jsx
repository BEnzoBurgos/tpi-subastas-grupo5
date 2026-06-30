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
    } catch (err) {
      console.error(err)
    }
  }

  const noLeidas = notifs.filter(n => !n.leida).length

  if (loading) return <div className="loading">Cargando notificaciones...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>
          Mis Notificaciones
          {noLeidas > 0 && (
            <span className="badge badge-activa" style={{ marginLeft: '0.7rem', fontSize: '0.85rem' }}>
              {noLeidas} nueva{noLeidas > 1 ? 's' : ''}
            </span>
          )}
        </h2>
      </div>

      {notifs.length === 0 && <p style={{ color: '#aaa' }}>No tenés notificaciones.</p>}

      {notifs.map(n => (
        <div key={n.id} className={`notif-item ${!n.leida ? 'no-leida' : ''}`}>
          <div>
            <div className="notif-tipo">{n.tipo.replace(/_/g, ' ')}</div>
            <div className="notif-mensaje">{n.mensaje}</div>
            <div className="notif-fecha">{new Date(n.fecha).toLocaleString()}</div>
          </div>
          {!n.leida && (
            <button
              className="btn btn-sm"
              style={{ background: '#e8f4fd', color: '#2980b9', border: '1px solid #aed6f1', whiteSpace: 'nowrap' }}
              onClick={() => marcarLeida(n.id)}
            >
              Marcar leída
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
