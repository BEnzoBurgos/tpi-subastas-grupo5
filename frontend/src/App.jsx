import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar        from './components/Navbar'
import PrivateRoute  from './components/PrivateRoute'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Subastas      from './pages/Subastas'
import DetalleSubasta from './pages/DetalleSubasta'
import CrearProducto from './pages/CrearProducto'
import CrearSubasta  from './pages/CrearSubasta'
import Notificaciones  from './pages/Notificaciones'
import AdminUsuarios   from './pages/AdminUsuarios'
import AdminCategorias from './pages/AdminCategorias'
import MiHistorial    from './pages/MiHistorial'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/subastas"     element={<Subastas />} />
          <Route path="/subastas/:id" element={<DetalleSubasta />} />
          <Route path="/crear-producto" element={
            <PrivateRoute role="SELLER"><CrearProducto /></PrivateRoute>
          } />
          <Route path="/crear-subasta" element={
            <PrivateRoute role="SELLER"><CrearSubasta /></PrivateRoute>
          } />
          <Route path="/notificaciones" element={
            <PrivateRoute><Notificaciones /></PrivateRoute>
          } />
          <Route path="/mi-historial" element={
            <PrivateRoute><MiHistorial /></PrivateRoute>
          } />
          <Route path="/admin/usuarios" element={
            <PrivateRoute role="ADMIN"><AdminUsuarios /></PrivateRoute>
          } />
          <Route path="/admin/categorias" element={
            <PrivateRoute role="ADMIN"><AdminCategorias /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/subastas" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
