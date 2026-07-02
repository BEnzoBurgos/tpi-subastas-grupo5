import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CountdownBadge from '../components/CountdownBadge'
import { formatMoney } from '../utils/format'

const BADGE = {
  BORRADOR:   'badge-borrador',  PUBLICADA:  'badge-publicada',
  ACTIVA:     'badge-activa',    FINALIZADA: 'badge-finalizada',
  ADJUDICADA: 'badge-adjudicada',CANCELADA:  'badge-cancelada',
  EN_DISPUTA: 'badge-en_disputa',
}

function inicial(nombre) {
  return (nombre || '?').charAt(0).toUpperCase()
}

export default function Subastas() {
  const { hasRole } = useAuth()
  const [subastas, setSubastas] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filtro,   setFiltro]   = useState('')

  useEffect(() => {
    const endpoint = hasRole('ADMIN') ? '/api/subastas' : '/api/publico/subastas'
    api.get(endpoint)
      .then(setSubastas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtradas = subastas.filter(s =>
    s.productoNombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    s.estado?.toLowerCase().includes(filtro.toLowerCase())
  )

  if (loading) return <div className="loading">Cargando subastas...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>Subastas</h2>
        <input
          style={{ padding: '0.55rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: '8px', width: 240, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
          placeholder="Buscar por producto o estado..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      {filtradas.length === 0 && (
        <p className="text-muted" style={{ padding: '2rem 0' }}>No hay subastas activas en este momento.</p>
      )}

      <div className="grid">
        {filtradas.map(s => (
          <Link to={`/subastas/${s.id}`} key={s.id} className="auction-card">
            {s.productoImagenesUrl?.[0]
              ? <img src={s.productoImagenesUrl[0]} alt={s.productoNombre} className="auction-card-img" style={{ objectFit: 'cover' }} />
              : <div className="auction-card-img">{inicial(s.productoNombre)}</div>
            }
            <div className="auction-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <div className="auction-card-title">{s.productoNombre}</div>
                <span className={`badge ${BADGE[s.estado] || ''}`} style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                  {s.estado}
                </span>
              </div>
              <div className="auction-card-vendor">
                {s.vendedorNombre} {s.vendedorApellido}
              </div>
              <div className="auction-card-price">{formatMoney(s.montoActual)}</div>
              <div className="auction-card-footer">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Cierre: {new Date(s.fechaCierre).toLocaleDateString()}
                </span>
                <CountdownBadge initialSeconds={s.tiempoRestanteSegundos} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
