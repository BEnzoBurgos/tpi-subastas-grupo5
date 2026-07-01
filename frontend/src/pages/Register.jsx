import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ nombre: '', apellido: '', email: '', password: '', fechaNacimiento: '' })
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
        <div className="auth-logo">
          <h1>TPI Subastas</h1>
          <p>Crea tu cuenta gratuitamente</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={set('nombre')} placeholder="Juan" required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input value={form.apellido} onChange={set('apellido')} placeholder="Perez" required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label>Contrasena</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Minimo 6 caracteres" required />
          </div>
          <div className="form-group">
            <label>Fecha de nacimiento</label>
            <input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} required />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-divider">
          Ya tenes cuenta? <Link to="/login">Iniciar sesion</Link>
        </div>
      </div>
    </div>
  )
}
