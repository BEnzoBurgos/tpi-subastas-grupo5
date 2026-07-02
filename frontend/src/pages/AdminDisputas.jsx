import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AdminDisputas() {
  const [disputas,    setDisputas]    = useState([])
  const [filtro,      setFiltro]      = useState('todas')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [ok,          setOk]          = useState('')
  const [verDisputa,  setVerDisputa]  = useState(null)
  const [modalRes,    setModalRes]    = useState(null)
  const [resolucion,  setResolucion]  = useState('')
  const [estadoFinal, setEstadoFinal] = useState('ADJUDICADA')
  const [enviando,    setEnviando]    = useState(false)
  const [errorModal,  setErrorModal]  = useState('')

  const cargar = async (f = filtro) => {
    setLoading(true)
    setError('')
    try {
      const endpoint = f === 'pendientes'
        ? '/api/admin/disputas/pendientes'
        : '/api/admin/disputas'
      setDisputas(await api.get(endpoint))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const cambiarFiltro = (f) => {
    setFiltro(f)
    cargar(f)
  }

  const handleResolver = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setErrorModal('')
    try {
      const actualizada = await api.put(`/api/disputas/${modalRes.id}/resolver`, { resolucion, estadoFinal })
      setModalRes(null)
      setResolucion('')
      setOk(`Disputa #${actualizada.id} resuelta correctamente.`)
      setTimeout(() => setOk(''), 4000)
      cargar()
    } catch (err) {
      setErrorModal(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const pendientes = disputas.filter(d => !d.fechaResolucion).length
  const resueltas  = disputas.filter(d =>  d.fechaResolucion).length

  return (
    <div className="container">
      <div className="page-header">
        <h2>Gestion de Disputas</h2>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span>
            <strong style={{ color: 'var(--red)' }}>{pendientes}</strong> pendientes
          </span>
          <span>
            <strong style={{ color: 'var(--green)' }}>{resueltas}</strong> resueltas
          </span>
        </div>
      </div>

      {ok    && <div className="success-msg">{ok}</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* Filtro */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'todas',      label: 'Todas'      },
          { key: 'pendientes', label: 'Pendientes' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => cambiarFiltro(f.key)}
            className={filtro === f.key ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Cargando disputas...</div>
      ) : disputas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          {filtro === 'pendientes' ? 'No hay disputas pendientes.' : 'No hay disputas registradas.'}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Iniciada por</th>
                <th>Motivo</th>
                <th>Apertura</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {disputas.map(d => (
                <tr key={d.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{d.id}</td>
                  <td style={{ fontWeight: 600 }}>{d.subastaProductoNombre}</td>
                  <td>{d.usuarioNombre} {d.usuarioApellido}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.motivo}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(d.fechaApertura).toLocaleString()}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                      background: d.fechaResolucion ? '#dcfce7' : '#fee2e2',
                      color:      d.fechaResolucion ? '#16a34a' : '#dc2626',
                    }}>
                      {d.fechaResolucion ? 'RESUELTA' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-secondary btn-sm" onClick={() => setVerDisputa(d)}>
                        Ver
                      </button>
                      {!d.fechaResolucion && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setModalRes(d); setResolucion(''); setEstadoFinal('ADJUDICADA'); setErrorModal('') }}>
                          Resolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ver detalle */}
      {verDisputa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', maxWidth: 520, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Disputa #{verDisputa.id}</h3>
              <span style={{
                padding: '2px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                background: verDisputa.fechaResolucion ? '#dcfce7' : '#fee2e2',
                color:      verDisputa.fechaResolucion ? '#16a34a' : '#dc2626',
              }}>
                {verDisputa.fechaResolucion ? 'RESUELTA' : 'PENDIENTE'}
              </span>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Row label="Producto"       value={verDisputa.subastaProductoNombre} />
              <Row label="Iniciada por"   value={`${verDisputa.usuarioNombre} ${verDisputa.usuarioApellido}`} />
              <Row label="Motivo"         value={verDisputa.motivo} />
              <Row label="Descripcion"    value={verDisputa.descripcion} />
              <Row label="Fecha apertura" value={new Date(verDisputa.fechaApertura).toLocaleString()} />
              {verDisputa.resolucion && <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                <Row label="Resolucion"       value={verDisputa.resolucion} highlight />
                <Row label="Fecha resolucion" value={new Date(verDisputa.fechaResolucion).toLocaleString()} />
              </>}
            </div>
            <div className="flex-gap" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              {!verDisputa.fechaResolucion && (
                <button className="btn btn-primary" onClick={() => { setVerDisputa(null); setModalRes(verDisputa); setResolucion(''); setEstadoFinal('ADJUDICADA'); setErrorModal('') }}>
                  Resolver disputa
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setVerDisputa(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal resolver */}
      {modalRes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', maxWidth: 480, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>Resolver Disputa #{modalRes.id}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {modalRes.subastaProductoNombre} — {modalRes.motivo}
            </p>
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {modalRes.descripcion}
            </div>
            {errorModal && <div className="error-msg" style={{ marginBottom: '1rem' }}>{errorModal}</div>}
            <form onSubmit={handleResolver}>
              <div className="form-group">
                <label>Estado final de la subasta <span style={{ color: 'var(--red)' }}>*</span></label>
                <select value={estadoFinal} onChange={e => setEstadoFinal(e.target.value)} required>
                  <option value="ADJUDICADA">ADJUDICADA — mantener al ganador original</option>
                  <option value="FINALIZADA">FINALIZADA — sin adjudicacion</option>
                  <option value="CANCELADA">CANCELADA — anular la subasta</option>
                </select>
              </div>
              <div className="form-group">
                <label>Resolucion del administrador <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea
                  value={resolucion}
                  onChange={e => setResolucion(e.target.value)}
                  placeholder="Describí la decision tomada y los pasos a seguir..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalRes(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Guardando...' : 'Confirmar Resolucion'}
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
