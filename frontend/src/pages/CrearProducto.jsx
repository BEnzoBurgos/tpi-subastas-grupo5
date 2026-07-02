import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'

const FORM_VACIO = { nombre: '', descripcion: '', categoriaId: '' }
const SLOTS = [
  { orden: 1, label: 'Principal', obligatoria: true  },
  { orden: 2, label: 'Imagen 2',  obligatoria: false },
  { orden: 3, label: 'Imagen 3',  obligatoria: false },
]

async function subirACloudinary(archivo) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  const token = localStorage.getItem('token')
  const res = await fetch('/api/productos/subir-imagen', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Error al subir imagen')
  return data.url
}

function ImagenSlot({ slot, url, subiendo, errorSlot, onChange }) {
  const ref = useRef()

  const handleChange = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    e.target.value = ''
    onChange(archivo, slot.orden)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <div
        className={`img-slot${subiendo ? ' loading' : ''}`}
        onClick={() => !subiendo && ref.current?.click()}
      >
        {/* Imagen cargada */}
        {url && (
          <img src={url} alt={slot.label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Estado vacío */}
        {!url && !subiendo && (
          <div className="img-slot-empty">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Subir imagen</span>
          </div>
        )}

        {/* Spinner de carga */}
        {subiendo && (
          <div className="img-slot-spinner">
            <div className="spinner" />
          </div>
        )}

        {/* Overlay "Cambiar" al hover */}
        {url && !subiendo && (
          <div className="img-slot-overlay">
            <span>Cambiar</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        {slot.label}
        {slot.obligatoria && <span style={{ color: 'var(--red)' }}> *</span>}
      </div>

      {errorSlot && (
        <p style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
          {errorSlot}
        </p>
      )}
    </div>
  )
}

export default function CrearProducto() {
  const [categorias,    setCategorias]    = useState([])
  const [productos,     setProductos]     = useState([])
  const [form,          setForm]          = useState(FORM_VACIO)
  const [editandoId,    setEditandoId]    = useState(null)
  // urls[0..2] = URL de Cloudinary para cada slot (null = vacío)
  const [urls,          setUrls]          = useState([null, null, null])
  const [subiendo,      setSubiendo]      = useState([false, false, false])
  const [erroresSlot,   setErroresSlot]   = useState(['', '', ''])
  const [error,         setError]         = useState('')
  const [ok,            setOk]            = useState('')
  const [loading,       setLoading]       = useState(false)
  const [modalProducto, setModalProducto] = useState(null)

  const cargar = () =>
    Promise.all([
      api.get('/api/categorias'),
      api.get('/api/productos/mis-productos'),
    ]).then(([cats, prods]) => {
      setCategorias(cats)
      setProductos(prods)
    }).catch(console.error)

  useEffect(() => { cargar() }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const resetSlots = () => {
    setUrls([null, null, null])
    setSubiendo([false, false, false])
    setErroresSlot(['', '', ''])
  }

  const iniciarEdicion = (p) => {
    setEditandoId(p.id)
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', categoriaId: String(p.categoriaId) })
    setUrls([p.imagenesUrl?.[0] ?? null, p.imagenesUrl?.[1] ?? null, p.imagenesUrl?.[2] ?? null])
    setErroresSlot(['', '', ''])
    setError(''); setOk('')
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    resetSlots()
    setError(''); setOk('')
  }

  // Llamado cuando el usuario selecciona un archivo en cualquier slot
  const handleSeleccionarImagen = async (archivo, orden) => {
    const idx = orden - 1
    setSubiendo(prev => { const n = [...prev]; n[idx] = true; return n })
    setErroresSlot(prev => { const n = [...prev]; n[idx] = ''; return n })
    try {
      const url = await subirACloudinary(archivo)
      setUrls(prev => { const n = [...prev]; n[idx] = url; return n })

      // En modo edición: asociar inmediatamente al producto existente
      if (editandoId) {
        const updated = await api.post('/api/productos/imagen', { productoId: editandoId, url, orden })
        setProductos(prev => prev.map(p => p.id === editandoId ? { ...p, imagenesUrl: updated.imagenesUrl } : p))
      }
    } catch (err) {
      setErroresSlot(prev => { const n = [...prev]; n[idx] = err.message; return n })
    } finally {
      setSubiendo(prev => { const n = [...prev]; n[idx] = false; return n })
    }
  }

  const haySubiendoAlgo = subiendo.some(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    setLoading(true)
    try {
      const payload = { ...form, categoriaId: Number(form.categoriaId) }

      if (editandoId) {
        await api.put(`/api/productos/${editandoId}`, payload)
        setOk('Producto actualizado con exito.')
        cancelarEdicion()
        cargar()
      } else {
        // 1. Crear el producto
        const creado = await api.post('/api/productos', payload)
        // 2. Asociar cada imagen pre-subida en orden
        for (let i = 0; i < urls.length; i++) {
          if (urls[i]) {
            await api.post('/api/productos/imagen', { productoId: creado.id, url: urls[i], orden: i + 1 })
          }
        }
        setOk('Producto creado con exito.')
        setForm(FORM_VACIO)
        resetSlots()
        cargar()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmarEliminar = async () => {
    try {
      await api.delete(`/api/productos/${modalProducto.id}`)
      setModalProducto(null)
      setOk('Producto eliminado.')
      if (editandoId === modalProducto.id) cancelarEdicion()
      cargar()
    } catch (err) {
      setModalProducto(null)
      setError(err.message)
    }
  }

  const labelBoton = haySubiendoAlgo
    ? 'Esperando imágenes...'
    : loading
      ? (editandoId ? 'Guardando...' : 'Creando...')
      : (editandoId ? 'Guardar cambios' : 'Crear Producto')

  return (
    <div className="container">
      <div className="page-header">
        <h2>Mis Productos</h2>
      </div>

      {ok    && <div className="success-msg">{ok}</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* Lista */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            Productos cargados ({productos.length})
          </h3>
        </div>
        {productos.length === 0 ? (
          <p className="text-muted" style={{ padding: '1.5rem 1.25rem' }}>
            Todavia no tenes productos. Agrega uno abajo.
          </p>
        ) : (
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 56 }}></th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Imagenes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} style={editandoId === p.id ? { background: '#fffde7' } : {}}>
                  <td>
                    {p.imagenesUrl?.[0]
                      ? <img src={p.imagenesUrl[0]} alt={p.nombre}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                      : <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td>{p.categoriaNombre}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        p.imagenesUrl?.[i]
                          ? <img key={i} src={p.imagenesUrl[i]} alt=""
                              style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                          : <div key={i} style={{ width: 28, height: 28, borderRadius: 4, background: '#e5e7eb', border: '1px dashed #d1d5db' }} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex-gap">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => iniciarEdicion(p)}
                        disabled={p.bloqueado}
                        title={p.bloqueado ? 'No se puede editar: el producto ya esta en una subasta publicada' : ''}
                        style={p.bloqueado ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                      >
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setModalProducto(p)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Formulario */}
      <div className="card" style={{ maxWidth: 620 }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>
          {editandoId ? 'Editar producto' : 'Agregar producto'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del producto</label>
            <input value={form.nombre} onChange={set('nombre')} placeholder="iPhone 15 Pro" required />
          </div>
          <div className="form-group">
            <label>Descripcion</label>
            <textarea value={form.descripcion} onChange={set('descripcion')}
              placeholder="Describe el producto en detalle..." rows={3} />
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <select value={form.categoriaId} onChange={set('categoriaId')} required>
              <option value="">Selecciona una categoria</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Slots de imagen — siempre visibles */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
              Imagenes del producto
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {SLOTS.map(slot => (
                <ImagenSlot
                  key={slot.orden}
                  slot={slot}
                  url={urls[slot.orden - 1]}
                  subiendo={subiendo[slot.orden - 1]}
                  errorSlot={erroresSlot[slot.orden - 1]}
                  onChange={handleSeleccionarImagen}
                />
              ))}
            </div>
          </div>

          <div className="flex-gap">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || haySubiendoAlgo}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              {labelBoton}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}
                style={{ padding: '0.75rem 1.25rem' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modal eliminacion */}
      {modalProducto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Eliminar producto</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              ¿Estas seguro de que queres eliminar <strong>{modalProducto.nombre}</strong>?
              Esta accion no se puede deshacer.
            </p>
            <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setModalProducto(null)}>No, cancelar</button>
              <button className="btn btn-danger" onClick={confirmarEliminar}>Si, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
