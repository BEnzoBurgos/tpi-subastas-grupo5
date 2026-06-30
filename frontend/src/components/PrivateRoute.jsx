import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, role }) {
  const { token, hasRole } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (role && !hasRole(role)) return <Navigate to="/subastas" replace />

  return children
}
