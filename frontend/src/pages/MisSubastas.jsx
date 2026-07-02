import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import CountdownBadge from '../components/CountdownBadge'
import { formatMoney } from '../utils/format'

const BADGE = {
  BORRADOR:   'badge-borrador',  PUBLICADA:  'badge-publicada',
  ACTIVA:     'badge-activa',    FINALIZADA: 'badge-finalizada',
  ADJUDICADA: 'badge-adjudicada',CANCELADA:  'badge-cancelada',
  EN_DISPUTA: 'badge-en_disputa',
}

const FORM_VACIO = { motivo: '', descripcion: '' }

export default function MisSubastas() {
  const [subastas,      setSubastas]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [msg,           setMsg]           = useState({ type: '', text: '' })
  const [modalDisputa,  setModalDisputa]  = useState(null)
  const [formDisputa,   setFormDisputa]   = useState(FORM_VACIO)
  const [enviando,      setEnviando]      = useState(false)
  const [errorModal,    setErrorModal]    = useState('')
  const [verDisputa,    setVerDisputa]    = useState(null)
  const [cargandoDisp, setCargandoDisp]  = useState(false)

  const cargar = () =>
    api.get('/api/subastas/mis-subastas')
      .then(setSubastas)
      .catch(console.error)
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const handlePublicar = async (id) => {
    try {
      await api.put(`/api/subastas/${id}/publicar`)
      showMsg('success', 'Subasta publicada correctamente.')
      cargar()
    } catch (err) { showMsg('error', err.message) }
  }

  const handleCancelar = async (id) => {
    if (!confirm('Confirmas la cancelacion?')) return
    try {
      await api.put(`/api/subastas/${id}/cancelar`, { motivo: 'Cancelado por el vendedor' })
      showMsg('success', 'Subasta cancelada.')
      cargar()
    } catch (err) { showMsg('error', err.message) }
  }

  const verDetalleDisputa = async (disputaId) => {
    setCargandoDisp(true)
    try {
      const d = await api.get(`/api/disputas/${disputaId}`)
      setVerDisputa(d)
    } catch (err) {
      showMsg('error', err.message)
    } finally {
      setCargandoDisp(false)
    }
  }

  const abrirModal = (s) => {
    setModalDisputa(s)
    setFormDisputa(FORM_VACIO)
    setErrorModal('')
  }

  const cerrarModal = () => {
    setModalDisputa(null)
    setFormDisputa(FORM_VACIO)
    setErrorModal('')
  }

  const handleSubmitDisputa = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setErrorModal('')
    try {
      await api.post(`/api/subastas/${modalDisputa.id}/disputas`, formDisputa)
      cerrarModal()
      showMsg('success', 'Disputa abierta correctamente. El equipo la revisara a la brevedad.')
      cargar()
    } catch (err) {
      setErrorModal(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>Mis Subastas</h2>
        <Link to="/crear-subasta" className="btn btn-primary btn-sm">+ Nueva Subasta</Link>
      </div>

      {msg.text && (
        <div className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>
      )}

      {subastas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Todavia no creaste ninguna subasta.</p>
          <Link to="/crear-subasta" className="btn btn-primary">Crear mi primera subasta</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Estado</th>
                <th>Monto actual</th>
                <th>Cierre</th>
                <th>Tiempo restante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subastas.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.productoNombre}</td>
                  <td>
                    <span className={`badge ${BADGE[s.estado] || ''}`}>{s.estado}</span>
                  </td>
                  <td>{formatMoney(s.montoActual)}</td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(s.fechaCierre).toLocaleString()}</td>
                  <td><CountdownBadge initialSeconds={s.tiempoRestanteSegundos} /></td>
                  <td>
                    <div className="flex-gap">
                      {s.estado === 'BORRADOR' && (
                        <button className="btn btn-warning btn-sm" onClick={() => handlePublicar(s.id)}>
                          Publicar
                        </button>
                      )}
                      {!['CANCELADA', 'FINALIZADA', 'ADJUDICADA', 'EN_DISPUTA'].includes(s.estado) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(s.id)}>
                          Cancelar
                        </button>
                      )}
                      {s.estado === 'ADJUDICADA' && (
                        <button className="btn btn-danger btn-sm" onClick={() => abrirModal(s)}>
                          Abrir Disputa
                        </button>
                      )}
                      {s.estado === 'EN_DISPUTA' && s.disputaId && (
                        <button className="btn btn-secondary btn-sm" disabled={cargandoDisp} onClick={() => verDetalleDisputa(s.disputaId)}>
                          Ver Disputa
                        </button>
                      )}
                      {s.estado !== 'BORRADOR' && (
                        <Link to={`/subastas/${s.id}`} className="btn btn-secondary btn-sm">
                          Ver
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ver detalle de disputa */}
      {verDisputa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', maxWidth: 500, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Detalle de Disputa #{verDisputa.id}</h3>
              <span style={{ background: verDisputa.fechaResolucion ? '#dcfce7' : '#fee2e2', color: verDisputa.fechaResolucion ? '#16a34a' : '#dc2626', padding: '2px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                {verDisputa.fechaResolucion ? 'RESUELTA' : 'PENDIENTE'}
              </span>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Row label="Abrió la disputa" value={`${verDisputa.usuarioNombre} ${verDisputa.usuarioApellido}`} />
              <Row label="Motivo"       value={verDisputa.motivo} />
              <Row label="Descripcion"  value={verDisputa.descripcion} />
              <Row label="Fecha apertura" value={new Date(verDisputa.fechaApertura).toLocaleString()} />
              {verDisputa.resolucion && <>
                <Row label="Resolucion del admin" value={verDisputa.resolucion} highlight />
                <Row label="Fecha resolucion" value={new Date(verDisputa.fechaResolucion).toLocaleString()} />
              </>}
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setVerDisputa(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal abrir disputa */}
      {modalDisputa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', maxWidth: 480, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>Abrir disputa</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Subasta #{modalDisputa.id} — {modalDisputa.productoNombre}
            </p>
            {errorModal && <div className="error-msg" style={{ marginBottom: '1rem' }}>{errorModal}</div>}
            <form onSubmit={handleSubmitDisputa}>
              <div className="form-group">
                <label>Motivo <span style={{ color: 'var(--red)' }}>*</span></label>
                <input
                  value={formDisputa.motivo}
                  onChange={e => setFormDisputa(p => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej: Producto no recibido"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripcion <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea
                  value={formDisputa.descripcion}
                  onChange={e => setFormDisputa(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Describí con detalle el problema que tuviste..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Abrir Disputa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: '0.9rem', color: highlight ? 'var(--primary)' : 'var(--text)', fontWeight: highlight ? 600 : 400, lineHeight: 1.5 }}>{value}</span>
    </div>
  )
}
