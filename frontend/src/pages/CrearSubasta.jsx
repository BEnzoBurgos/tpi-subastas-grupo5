import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function CrearSubasta() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({
    productoId: '', precioBase: '', incrementoMinimo: '',
    fechaInicio: '', fechaCierre: '', descripcion: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/productos').then(setProductos).catch(console.error)
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        productoId:       Number(form.productoId),
        precioBase:       parseFloat(form.precioBase),
        incrementoMinimo: parseFloat(form.incrementoMinimo),
        fechaInicio:      form.fechaInicio,
        fechaCierre:      form.fechaCierre,
        descripcion:      form.descripcion,
      }
      const subasta = await api.post('/api/subastas', payload)
      navigate(`/subastas/${subasta.id}`)
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
          <h2>Crear Subasta</h2>
          <button className="btn btn-sm" style={{ background: '#eee' }} onClick={() => navigate('/subastas')}>
            ← Volver
          </button>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Producto</label>
              <select value={form.productoId} onChange={set('productoId')} required>
                <option value="">Seleccioná un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — {p.categoriaNombre}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Precio base ($)</label>
                <input type="number" step="0.01" min="0.01" value={form.precioBase}
                  onChange={set('precioBase')} placeholder="100.00" required />
              </div>
              <div className="form-group">
                <label>Incremento mínimo ($)</label>
                <input type="number" step="0.01" min="0.01" value={form.incrementoMinimo}
                  onChange={set('incrementoMinimo')} placeholder="10.00" required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Fecha de inicio</label>
                <input type="datetime-local" value={form.fechaInicio} onChange={set('fechaInicio')} required />
              </div>
              <div className="form-group">
                <label>Fecha de cierre</label>
                <input type="datetime-local" value={form.fechaCierre} onChange={set('fechaCierre')} required />
              </div>
            </div>
            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea value={form.descripcion} onChange={set('descripcion')} rows={3}
                placeholder="Detalle adicional sobre la subasta..." />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Subasta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
