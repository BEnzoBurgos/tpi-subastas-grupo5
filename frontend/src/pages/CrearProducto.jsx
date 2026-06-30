import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function CrearProducto() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [form, setForm]   = useState({ nombre: '', descripcion: '', categoriaId: '' })
  const [error, setError] = useState('')
  const [ok, setOk]       = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/categorias').then(setCategorias).catch(console.error)
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.post('/api/productos', { ...form, categoriaId: Number(form.categoriaId) })
      setOk('Producto creado con éxito.')
      setForm({ nombre: '', descripcion: '', categoriaId: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="page-header">
          <h2>Crear Producto</h2>
          <button className="btn btn-sm" style={{ background: '#eee' }} onClick={() => navigate('/subastas')}>
            ← Volver
          </button>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          {ok    && <div className="success-msg">{ok}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del producto</label>
              <input value={form.nombre} onChange={set('nombre')} placeholder="iPhone 15 Pro" required />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea value={form.descripcion} onChange={set('descripcion')} placeholder="Describí el producto..." rows={4} />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={form.categoriaId} onChange={set('categoriaId')} required>
                <option value="">Seleccioná una categoría</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Producto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
