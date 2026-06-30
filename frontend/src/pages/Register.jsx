import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', fechaNacimiento: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/subastas')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🏷️ TPI Subastas</h2>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555', fontWeight: 400 }}>Crear cuenta</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={set('nombre')} placeholder="Juan" required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input value={form.apellido} onChange={set('apellido')} placeholder="Pérez" required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="form-group">
            <label>Fecha de nacimiento</label>
            <input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p className="text-center mt-2">
          ¿Ya tenés cuenta? <Link to="/login" className="link">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
