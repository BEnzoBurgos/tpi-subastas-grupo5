import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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

export default function DetalleSubasta() {
  const { id }  = useParams()
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()

  const [subasta, setSubasta] = useState(null)
  const [pujas,   setPujas]   = useState([])
  const [monto,   setMonto]   = useState('')
  const [msg,     setMsg]     = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    const s = await api.get(`/api/publico/subastas/${id}`)
    setSubasta(s)
    if (user) {
      const p = await api.get(`/api/subastas/${id}/pujas`)
      setPujas(p)
    }
  }

  useEffect(() => { cargar().catch(console.error).finally(() => setLoading(false)) }, [id, user])

  const esVendedor    = user?.id === subasta?.vendedorId
  const puedePublicar = hasRole('SELLER') && esVendedor && subasta?.estado === 'BORRADOR'
  const puedeCancelar = (hasRole('SELLER') && esVendedor) || hasRole('ADMIN')
  const puedePujar    = user && hasRole('USER') && !esVendedor && subasta?.estado === 'ACTIVA'

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }

  const handlePujar = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/api/subastas/${id}/pujas`, { monto: parseFloat(monto) })
      setMonto('')
      showMsg('success', 'Puja registrada con exito.')
      await cargar()
    } catch (err) { showMsg('error', err.message) }
  }

  const handlePublicar = async () => {
    try {
      await api.put(`/api/subastas/${id}/publicar`)
      showMsg('success', 'Subasta publicada.')
      await cargar()
    } catch (err) { showMsg('error', err.message) }
  }

  const handleCancelar = async () => {
    if (!confirm('Confirmas la cancelacion?')) return
    try {
      await api.put(`/api/subastas/${id}/cancelar`, { motivo: 'Cancelado por el usuario' })
      showMsg('success', 'Subasta cancelada.')
      await cargar()
    } catch (err) { showMsg('error', err.message) }
  }

  if (loading) return <div className="loading">Cargando subasta...</div>
  if (!subasta) return <div className="container"><p>Subasta no encontrada.</p></div>

  return (
    <div className="container">
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
        onClick={() => navigate('/subastas')}
      >
        ← Volver a subastas
      </button>

      {msg.text && (
        <div className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>
      )}

      {/* Cabecera */}
      <div className="card">
        <div className="card-header" style={{ alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              {subasta.productoNombre}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Vendedor: {subasta.vendedorNombre} {subasta.vendedorApellido}
            </p>
          </div>
          <span className={`badge ${BADGE[subasta.estado] || ''}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.85rem' }}>
            {subasta.estado}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-info">
            {subasta.descripcion && (
              <p><strong>Descripcion:</strong> {subasta.descripcion}</p>
            )}
            <p><strong>Precio base:</strong> {formatMoney(subasta.precioBase)}</p>
            <p><strong>Incremento minimo:</strong> {formatMoney(subasta.incrementoMinimo)}</p>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Monto actual
            </p>
            <div className="price-display">{formatMoney(subasta.montoActual)}</div>

            {/* Formulario de puja si el usuario puede pujar */}
            {puedePujar && (
              <form onSubmit={handlePujar} style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>Tu oferta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder={`Minimo ${formatMoney(subasta.montoActual + subasta.incrementoMinimo)}`}
                    required
                  />
                </div>
                <button className="btn btn-success" type="submit" style={{ width: '100%' }}>
                  Realizar puja
                </button>
              </form>
            )}

            {/* Mensaje para usuarios no autenticados en subastas activas */}
            {!user && subasta.estado === 'ACTIVA' && (
              <div style={{
                marginTop: '0.75rem',
                padding: '1rem 1.25rem',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius)',
                border: '1px solid #c5cae9',
                textAlign: 'center',
              }}>
                <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                  Inicia sesion para ofertar
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Link to="/login" className="btn btn-primary btn-sm">Iniciar sesion</Link>
                  <Link to="/register" className="btn btn-secondary btn-sm">Registrarse</Link>
                </div>
              </div>
            )}

            <div className="flex-gap mt-2">
              {puedePublicar && (
                <button className="btn btn-warning btn-sm" onClick={handlePublicar}>Publicar</button>
              )}
              {puedeCancelar && !['CANCELADA', 'FINALIZADA', 'ADJUDICADA'].includes(subasta.estado) && (
                <button className="btn btn-danger btn-sm" onClick={handleCancelar}>Cancelar subasta</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de pujas — solo visible para usuarios logueados */}
      {user && (
        <div className="card">
          <h3 className="section-title">Historial de pujas ({pujas.length})</h3>
          {pujas.length === 0 ? (
            <p className="text-muted">Todavia no hay pujas.</p>
          ) : (
            pujas.map((p, i) => (
              <div className="puja-item" key={p.id}>
                <div>
                  <strong style={{ color: i === 0 ? 'var(--green)' : 'var(--text)' }}>
                    {i === 0 && '* '}{p.usuarioNombre} {p.usuarioApellido}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '0.75rem' }}>
                    {new Date(p.fechaHora).toLocaleString()}
                  </span>
                </div>
                <strong style={{ color: 'var(--green)', fontSize: '1.05rem' }}>
                  {formatMoney(p.monto)}
                </strong>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
