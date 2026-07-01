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

export default function MiHistorial() {
  const [historial, setHistorial] = useState(null)
  const [tab,       setTab]       = useState('pujas')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    api.get('/api/usuarios/me/historial')
      .then(setHistorial)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container"><p>Cargando historial...</p></div>
  if (error)   return <div className="container"><div className="error-msg">{error}</div></div>

  const count = (key) => historial?.[key]?.length ?? 0

  return (
    <div className="container">
      <h2 style={{ marginBottom: '1.5rem' }}>Mi Historial</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.5rem 1.1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#2563eb' : '#555',
              borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {t.label}
            <span style={{
              marginLeft: '0.4rem', fontSize: '0.75rem', background: '#f0f0f0',
              borderRadius: '10px', padding: '1px 7px', color: '#666'
            }}>
              {count(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="card" style={{ padding: '1.25rem' }}>
        {tab === 'pujas'               && <TablaPujas               rows={historial.pujas} />}
        {tab === 'subastasGanadas'     && <TablaSubastas            rows={historial.subastasGanadas}     emptyMsg="No ganaste ninguna subasta todavía." />}
        {tab === 'subastasPerdidas'    && <TablaSubastas            rows={historial.subastasPerdidas}    emptyMsg="No perdiste ninguna subasta." />}
        {tab === 'productosPublicados' && <TablaProductos           rows={historial.productosPublicados} />}
        {tab === 'disputasIniciadas'   && <TablaDisputas            rows={historial.disputasIniciadas} />}
      </div>
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

function TablaSubastas({ rows, emptyMsg }) {
  if (!rows.length) return <Empty msg={emptyMsg} />
  return (
    <Table
      headers={['ID', 'Producto', 'Monto final', 'Cierre', 'Estado']}
      rows={rows.map(s => [
        <Link to={`/subastas/${s.id}`} className="link">#{s.id}</Link>,
        s.productoNombre,
        formatMoney(s.montoActual),
        new Date(s.fechaCierre).toLocaleString(),
        <BadgeEstado estado={s.estado} />,
      ])}
    />
  )
}

function TablaProductos({ rows }) {
  if (!rows.length) return <Empty msg="No publicaste ningún producto todavía." />
  return (
    <Table
      headers={['ID', 'Nombre', 'Categoría', 'Descripción']}
      rows={rows.map(p => [
        p.id,
        p.nombre,
        p.categoriaNombre,
        p.descripcion || '—',
      ])}
    />
  )
}

function TablaDisputas({ rows }) {
  if (!rows.length) return <Empty msg="No iniciaste ninguna disputa." />
  return (
    <Table
      headers={['ID', 'Producto', 'Motivo', 'Apertura', 'Resuelta']}
      rows={rows.map(d => [
        d.id,
        d.subastaProductoNombre,
        d.motivo,
        new Date(d.fechaApertura).toLocaleString(),
        d.fechaResolucion
          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Sí</span>
          : <span style={{ color: '#ea580c', fontWeight: 600 }}>Pendiente</span>,
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
