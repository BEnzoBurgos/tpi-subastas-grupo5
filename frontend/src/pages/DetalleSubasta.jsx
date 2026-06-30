import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CountdownBadge from '../components/CountdownBadge'
import { formatMoney } from '../utils/format'

const BADGE = {
  BORRADOR: 'badge-borrador', PUBLICADA: 'badge-publicada', ACTIVA: 'badge-activa',
  FINALIZADA: 'badge-finalizada', ADJUDICADA: 'badge-adjudicada',
  CANCELADA: 'badge-cancelada', EN_DISPUTA: 'badge-en_disputa'
}

export default function DetalleSubasta() {
  const { id } = useParams()
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()

  const [subasta, setSubasta] = useState(null)
  const [pujas,   setPujas]   = useState([])
  const [monto,   setMonto]   = useState('')
  const [msg,     setMsg]     = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    const [s, p] = await Promise.all([
      api.get(`/api/subastas/${id}`),
      api.get(`/api/subastas/${id}/pujas`),
    ])
    setSubasta(s)
    setPujas(p)
  }

  useEffect(() => {
    cargar().catch(console.error).finally(() => setLoading(false))
  }, [id])

  const esVendedor    = user?.email === subasta?.vendedorEmail || user?.id === subasta?.vendedorId
  const puedePublicar = hasRole('SELLER') && esVendedor && subasta?.estado === 'BORRADOR'
  const puedeCancelar = (hasRole('SELLER') && esVendedor) || hasRole('ADMIN')
  const puedePujar    = hasRole('USER') && !esVendedor && subasta?.estado === 'ACTIVA'

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }

  const handlePujar = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/api/subastas/${id}/pujas`, { monto: parseFloat(monto) })
      setMonto('')
      showMsg('success', '¡Puja registrada con éxito!')
      await cargar()
    } catch (err) {
      showMsg('error', err.message)
    }
  }

  const handlePublicar = async () => {
    try {
      await api.put(`/api/subastas/${id}/publicar`)
      showMsg('success', 'Subasta publicada.')
      await cargar()
    } catch (err) {
      showMsg('error', err.message)
    }
  }

  const handleCancelar = async () => {
    if (!confirm('¿Confirmás la cancelación?')) return
    try {
      await api.put(`/api/subastas/${id}/cancelar`, { motivo: 'Cancelado por el usuario' })
      showMsg('success', 'Subasta cancelada.')
      await cargar()
    } catch (err) {
      showMsg('error', err.message)
    }
  }

  if (loading) return <div className="loading">Cargando subasta...</div>
  if (!subasta) return <div className="container"><p>Subasta no encontrada.</p></div>

  return (
    <div className="container">
      <button className="btn btn-sm" style={{ marginBottom: '1rem', background: '#eee' }}
        onClick={() => navigate('/subastas')}>← Volver</button>

      {msg.text && <div className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>{subasta.productoNombre}</h2>
            <p style={{ color: '#888' }}>Vendedor: {subasta.vendedorNombre} {subasta.vendedorApellido}</p>
          </div>
          <span className={`badge ${BADGE[subasta.estado] || ''}`}>{subasta.estado}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-info">
            {subasta.descripcion && <p><strong>Descripción:</strong> {subasta.descripcion}</p>}
            <p><strong>Precio base:</strong> {formatMoney(subasta.precioBase)}</p>
            <p><strong>Incremento mínimo:</strong> {formatMoney(subasta.incrementoMinimo)}</p>
            <p><strong>Inicio:</strong> {new Date(subasta.fechaInicio).toLocaleString()}</p>
            <p><strong>Cierre:</strong> {new Date(subasta.fechaCierre).toLocaleString()}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong>Tiempo restante:</strong>
              <CountdownBadge initialSeconds={subasta.tiempoRestanteSegundos} style={{ fontSize: '0.95rem' }} />
            </p>
            {subasta.ganadorNombre && (
              <p><strong>Ganador:</strong> {subasta.ganadorNombre} {subasta.ganadorApellido}</p>
            )}
          </div>

          <div>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Monto actual</p>
            <div className="price-display">{formatMoney(subasta.montoActual)}</div>

            {puedePujar && (
              <form onSubmit={handlePujar} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Tu oferta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder={`Mínimo ${formatMoney(subasta.montoActual + subasta.incrementoMinimo)}`}
                    required
                  />
                </div>
                <button className="btn btn-success" type="submit" style={{ width: '100%' }}>
                  Pujar
                </button>
              </form>
            )}

            <div className="flex-gap mt-2">
              {puedePublicar && (
                <button className="btn btn-warning btn-sm" onClick={handlePublicar}>Publicar</button>
              )}
              {puedeCancelar && !['CANCELADA','FINALIZADA','ADJUDICADA'].includes(subasta.estado) && (
                <button className="btn btn-danger btn-sm" onClick={handleCancelar}>Cancelar</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Pujas ({pujas.length})</h3>
        {pujas.length === 0
          ? <p style={{ color: '#aaa' }}>Todavía no hay pujas.</p>
          : pujas.map((p, i) => (
            <div className="puja-item" key={p.id}>
              <div>
                <strong>{i === 0 ? '🏆 ' : ''}{p.usuarioNombre} {p.usuarioApellido}</strong>
                <span style={{ color: '#aaa', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                  {new Date(p.fechaHora).toLocaleString()}
                </span>
              </div>
              <strong style={{ color: '#27ae60' }}>{formatMoney(p.monto)}</strong>
            </div>
          ))
        }
      </div>
    </div>
  )
}
