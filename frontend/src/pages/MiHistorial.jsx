import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { formatMoney } from '../utils/format'

const TABS = [
  { key: 'pujas',               label: 'Mis Pujas'          },
  { key: 'subastasGanadas',     label: 'Subastas Ganadas'   },
  { key: 'subastasPerdidas',    label: 'Subastas Perdidas'  },
  { key: 'productosPublicados', label: 'Mis Productos'      },
  { key: 'disputasIniciadas',   label: 'Mis Disputas'       },
]

const FORM_VACIO = { motivo: '', descripcion: '' }

export default function MiHistorial() {
  const [historial,     setHistorial]     = useState(null)
  const [tab,           setTab]           = useState('pujas')
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [modalDisputa,  setModalDisputa]  = useState(null)
  const [formDisputa,   setFormDisputa]   = useState(FORM_VACIO)
  const [enviando,      setEnviando]      = useState(false)
  const [ok,            setOk]            = useState('')
  const [verDisputa,    setVerDisputa]    = useState(null)

  const cargar = () =>
    api.get('/api/usuarios/me/historial')
      .then(setHistorial)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const abrirModal = (subasta) => {
    setModalDisputa(subasta)
    setFormDisputa(FORM_VACIO)
    setError('')
  }

  const cerrarModal = () => {
    setModalDisputa(null)
    setFormDisputa(FORM_VACIO)
    setError('')
  }

  const handleSubmitDisputa = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await api.post(`/api/subastas/${modalDisputa.id}/disputas`, formDisputa)
      cerrarModal()
      setOk('Disputa abierta correctamente. El equipo la revisara a la brevedad.')
      setTimeout(() => setOk(''), 5000)
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div className="container"><p>Cargando historial...</p></div>

  const count = (key) => historial?.[key]?.length ?? 0

  return (
    <div className="container">
      <h2 style={{ marginBottom: '1.5rem' }}>Mi Historial</h2>

      {ok && <div className="success-msg">{ok}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.5rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#2563eb' : '#555',
              borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {t.label}
            <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', background: '#f0f0f0', borderRadius: '10px', padding: '1px 7px', color: '#666' }}>
              {count(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="card" style={{ padding: '1.25rem' }}>
        {tab === 'pujas'               && <TablaPujas     rows={historial.pujas} />}
        {tab === 'subastasGanadas'     && <TablaSubastas  rows={historial.subastasGanadas}  emptyMsg="No ganaste ninguna subasta todavía." onAbrirDisputa={abrirModal} />}
        {tab === 'subastasPerdidas'    && <TablaSubastas  rows={historial.subastasPerdidas} emptyMsg="No perdiste ninguna subasta." />}
        {tab === 'productosPublicados' && <TablaProductos rows={historial.productosPublicados} />}
        {tab === 'disputasIniciadas'   && <TablaDisputas  rows={historial.disputasIniciadas} onVerDisputa={setVerDisputa} />}
      </div>

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
              <Row label="Producto"     value={verDisputa.subastaProductoNombre} />
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
            {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
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

/* ── Tablas ──────────────────────────────────────────────────────────── */

function TablaPujas({ rows }) {
  if (!rows.length) return <Empty msg="No realizaste ninguna puja todavía." />
  return (
    <Table
      headers={['Subasta', 'Producto', 'Monto', 'Fecha']}
      rows={rows.map(p => [
        <Link to={`/subastas/${p.subastaId}`} className="link">#{p.subastaId}</Link>,
        p.subastaProductoNombre,
        formatMoney(p.monto),
        new Date(p.fechaHora).toLocaleString(),
      ])}
    />
  )
}

function TablaSubastas({ rows, emptyMsg, onAbrirDisputa }) {
  if (!rows.length) return <Empty msg={emptyMsg} />
  const conAccion = !!onAbrirDisputa
  return (
    <Table
      headers={['ID', 'Producto', 'Monto final', 'Cierre', 'Estado', ...(conAccion ? ['Acciones'] : [])]}
      rows={rows.map(s => [
        <Link to={`/subastas/${s.id}`} className="link">#{s.id}</Link>,
        s.productoNombre,
        formatMoney(s.montoActual),
        new Date(s.fechaCierre).toLocaleString(),
        <BadgeEstado estado={s.estado} />,
        ...(conAccion ? [
          s.estado === 'ADJUDICADA'
            ? <button className="btn btn-danger btn-sm" onClick={() => onAbrirDisputa(s)}>Abrir Disputa</button>
            : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
        ] : []),
      ])}
    />
  )
}

function TablaProductos({ rows }) {
  if (!rows.length) return <Empty msg="No publicaste ningún producto todavía." />
  return (
    <Table
      headers={['ID', 'Nombre', 'Categoría', 'Descripción']}
      rows={rows.map(p => [p.id, p.nombre, p.categoriaNombre, p.descripcion || '—'])}
    />
  )
}

function TablaDisputas({ rows, onVerDisputa }) {
  if (!rows.length) return <Empty msg="No iniciaste ninguna disputa." />
  return (
    <Table
      headers={['Producto', 'Motivo', 'Apertura', 'Estado', 'Acciones']}
      rows={rows.map(d => [
        d.subastaProductoNombre,
        d.motivo,
        new Date(d.fechaApertura).toLocaleString(),
        d.fechaResolucion
          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>RESUELTA</span>
          : <span style={{ color: '#ea580c', fontWeight: 600 }}>PENDIENTE</span>,
        <button className="btn btn-secondary btn-sm" onClick={() => onVerDisputa(d)}>
          Ver Detalle
        </button>,
      ])}
    />
  )
}

/* ── Componentes auxiliares ──────────────────────────────────────────── */

function Table({ headers, rows }) {
  return (
    <div className="table-wrapper" style={{ border: 'none' }}>
      <table>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>{cells.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const BADGE_COLORS = {
  ACTIVA:     { bg: '#dcfce7', color: '#16a34a' },
  PUBLICADA:  { bg: '#dbeafe', color: '#2563eb' },
  BORRADOR:   { bg: '#f3f4f6', color: '#6b7280' },
  FINALIZADA: { bg: '#f3f4f6', color: '#6b7280' },
  ADJUDICADA: { bg: '#fef9c3', color: '#ca8a04' },
  CANCELADA:  { bg: '#fee2e2', color: '#dc2626' },
  EN_DISPUTA: { bg: '#fce7f3', color: '#db2777' },
}

function BadgeEstado({ estado }) {
  const { bg, color } = BADGE_COLORS[estado] || { bg: '#f3f4f6', color: '#555' }
  return (
    <span style={{ background: bg, color, padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
      {estado}
    </span>
  )
}

function Empty({ msg }) {
  return <p style={{ color: '#aaa', padding: '0.5rem 0' }}>{msg}</p>
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'start' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: '0.9rem', color: highlight ? 'var(--primary)' : 'var(--text)', fontWeight: highlight ? 600 : 400, lineHeight: 1.5 }}>{value}</span>
    </div>
  )
}
