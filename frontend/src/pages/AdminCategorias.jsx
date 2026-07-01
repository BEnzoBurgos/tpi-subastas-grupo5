import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre,  setNombre]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)
  const [creando, setCreando] = useState(false)

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
    if (!confirm('Eliminar esta categoria?')) return
    setError('')
    try {
      await api.delete(`/api/categorias/${id}`)
      setCategorias(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className="loading">Cargando categorias...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>Gestion de Categorias</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{categorias.length} categorias</span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="section-title">Agregar nueva categoria</h3>
        <form onSubmit={crear} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre de la nueva categoria"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" type="submit" disabled={creando || !nombre.trim()}>
            {creando ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          {categorias.length === 0 ? (
            <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No hay categorias cargadas.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th style={{ textAlign: 'right' }}>Accion</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>#{cat.id}</td>
                    <td style={{ fontWeight: 500 }}>{cat.nombre}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => eliminar(cat.id)}
                        className="btn btn-danger btn-sm"
                        style={{ background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
