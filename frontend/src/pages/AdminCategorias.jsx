import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre]         = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [creando, setCreando]       = useState(false)

  useEffect(() => {
    api.get('/api/categorias')
      .then(setCategorias)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const crear = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setError('')
    setCreando(true)
    try {
      const nueva = await api.post('/api/categorias', { nombre: nombre.trim() })
      setCategorias(prev => [...prev, nueva])
      setNombre('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCreando(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta categoria?')) return
    setError('')
    try {
      await api.delete(`/api/categorias/${id}`)
      setCategorias(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className="container"><p>Cargando categorias...</p></div>

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Gestion de Categorias</h2>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={crear} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre de la nueva categoria"
          style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
        />
        <button className="btn btn-primary" type="submit" disabled={creando || !nombre.trim()}>
          {creando ? 'Creando...' : 'Agregar'}
        </button>
      </form>

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {categorias.length === 0 && (
          <p style={{ padding: '1.5rem', color: '#888', textAlign: 'center' }}>No hay categorias cargadas.</p>
        )}
        {categorias.map((cat, i) => (
          <div
            key={cat.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderBottom: i < categorias.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>{cat.nombre}</span>
            <button
              onClick={() => eliminar(cat.id)}
              style={{
                background: 'none',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                borderRadius: '6px',
                padding: '3px 12px',
                cursor: 'pointer',
                fontSize: '0.82rem',
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#aaa' }}>
        {categorias.length} categoria{categorias.length !== 1 ? 's' : ''} en total
      </p>
    </div>
  )
}
