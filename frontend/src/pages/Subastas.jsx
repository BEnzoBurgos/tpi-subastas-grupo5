import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import CountdownBadge from '../components/CountdownBadge'
import { formatMoney } from '../utils/format'

const BADGE = {
  BORRADOR: 'badge-borrador', PUBLICADA: 'badge-publicada', ACTIVA: 'badge-activa',
  FINALIZADA: 'badge-finalizada', ADJUDICADA: 'badge-adjudicada',
  CANCELADA: 'badge-cancelada', EN_DISPUTA: 'badge-en_disputa'
}

export default function Subastas() {
  const [subastas, setSubastas] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('')

  useEffect(() => {
    api.get('/api/subastas')
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
          className="form-group input"
          style={{ padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: 6, width: 220 }}
          placeholder="Buscar por producto o estado..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      {filtradas.length === 0 && <p style={{ color: '#aaa' }}>No hay subastas para mostrar.</p>}

      <div className="grid">
        {filtradas.map(s => (
          <Link to={`/subastas/${s.id}`} key={s.id} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
              <div className="card-header">
                <h3>{s.productoNombre}</h3>
                <span className={`badge ${BADGE[s.estado] || ''}`}>{s.estado}</span>
              </div>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>Vendedor: {s.vendedorNombre} {s.vendedorApellido}</p>
              <div className="price-display">{formatMoney(s.montoActual)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>
                  Cierre: {new Date(s.fechaCierre).toLocaleString()}
                </p>
                <CountdownBadge initialSeconds={s.tiempoRestanteSegundos} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
