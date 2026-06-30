import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('user')  || 'null'))
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const saveSession = async (token) => {
    localStorage.setItem('token', token)
    setToken(token)
    const profile = await api.get('/api/usuarios/me')
    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)
    return profile
  }

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    return saveSession(data.token)
  }

  const register = async (formData) => {
    const data = await api.post('/api/auth/register', formData)
    return saveSession(data.token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const hasRole = (role) => user?.roles?.includes(role) ?? false

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
