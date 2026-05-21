// src/pages/modules/CartaPage/CartaPage.jsx

import { useEffect, useState, useCallback } from "react"
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  toggleCategoriaStatus,
  getProductos,
  createProducto,
  updateProducto,
  toggleProductoStatus,
  asignarEtiquetas,
} from "../../../services/cartaService"
import  useToast  from "../../../components/common/Toast/useToast"
import CategoriaModal from "./components/CategoriaModal"
import ProductoModal from "./components/ProductoModal"
import "./CartaPage.css"

const IconPlus   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
const IconEdit   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconToggle = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
const IconSearch = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
const IconFolder = () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>

export default function CartaPage() {
  const { showToast } = useToast()

  const [categorias, setCategorias]           = useState([])
  const [productos, setProductos]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState("all")
  const [busqueda, setBusqueda]               = useState("")
  const [catModal, setCatModal]               = useState({ open: false, data: null })
  const [prodModal, setProdModal]             = useState({ open: false, data: null })

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, prods] = await Promise.all([getCategorias(), getProductos()])
      setCategorias(cats)
      setProductos(prods)
    } catch (err) {
      showToast(err.message || "Error al cargar datos", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // ── Filtros ───────────────────────────────────────────────────────────────
  const productosFiltrados = productos.filter((p) => {
    const matchCat  = categoriaActiva === "all" || p.id_categoria === categoriaActiva
    const matchBusq = busqueda.trim() === "" ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.categoria_nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchBusq
  })

  // ── Handlers Categoría ────────────────────────────────────────────────────
  async function handleSaveCategoria(payload, id) {
    try {
      if (id) {
        const updated = await updateCategoria(id, payload)
        setCategorias((prev) => prev.map((c) => (c.id_categoria === id ? updated : c)))
        showToast("Categoría actualizada correctamente.", "success")
      } else {
        const nueva = await createCategoria(payload)
        setCategorias((prev) => [...prev, nueva])
        showToast("Categoría creada correctamente.", "success")
      }
      setCatModal({ open: false, data: null })
    } catch (err) {
      showToast(err.message, "error")
    }
  }

  async function handleToggleCategoria(cat) {
    try {
      const updated = await toggleCategoriaStatus(cat.id_categoria, !cat.estado)
      setCategorias((prev) => prev.map((c) => (c.id_categoria === cat.id_categoria ? updated : c)))
      showToast(`Categoría ${updated.estado ? "activada" : "desactivada"}.`, "success")
    } catch (err) {
      showToast(err.message, "error")
    }
  }

  // ── Handlers Producto ─────────────────────────────────────────────────────
  async function handleSaveProducto(payload, id) {
    try {
      const { tag_ids, ...productoData } = payload  // separa tags del resto

      if (id) {
        await updateProducto(id, productoData)
        await asignarEtiquetas(id, tag_ids || [])
      } else {
        const nuevo = await createProducto(productoData)
        await asignarEtiquetas(nuevo.id_producto, tag_ids || [])
      }

      await cargarDatos()  // recarga todo para traer etiquetas actualizadas
      showToast(id ? "Producto actualizado correctamente." : "Producto creado correctamente.", "success")
      setProdModal({ open: false, data: null })
    } catch (err) {
      showToast(err.message, "error")
    }
  }

  async function handleToggleProducto(prod) {
    try {
      const updated = await toggleProductoStatus(prod.id_producto, !prod.estado)
      setProductos((prev) => prev.map((p) => (p.id_producto === prod.id_producto ? updated : p)))
      showToast(`Producto ${updated.estado ? "activado" : "desactivado"}.`, "success")
    } catch (err) {
      showToast(err.message, "error")
    }
  }

  return (
    <div className="carta">

      {/* ── Header ── */}
      <div className="carta__header">
        <div>
          <h1 className="carta__title">Gestión de Carta</h1>
          <p className="carta__sub">Categorías y productos del menú</p>
        </div>
        <div className="carta__header-actions">
          <button className="carta__btn carta__btn--secondary" onClick={() => setCatModal({ open: true, data: null })}>
            <IconPlus /> Nueva categoría
          </button>
          <button className="carta__btn carta__btn--primary" onClick={() => setProdModal({ open: true, data: null })}>
            <IconPlus /> Nuevo producto
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="carta__toolbar">
        <div className="carta__cat-tabs">
          <button
            className={`carta__cat-tab ${categoriaActiva === "all" ? "carta__cat-tab--active" : ""}`}
            onClick={() => setCategoriaActiva("all")}
          >
            Todas
            <span className="carta__cat-count">{productos.length}</span>
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              className={`carta__cat-tab ${categoriaActiva === cat.id_categoria ? "carta__cat-tab--active" : ""} ${!cat.estado ? "carta__cat-tab--inactive" : ""}`}
              onClick={() => setCategoriaActiva(cat.id_categoria)}
            >
              {cat.nombre}
              <span className="carta__cat-count">
                {productos.filter((p) => p.id_categoria === cat.id_categoria).length}
              </span>
            </button>
          ))}
        </div>

        <div className="carta__search-wrap">
          <IconSearch />
          <input
            className="carta__search"
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="carta__layout">

        {/* Panel categorías */}
        <aside className="carta__sidebar">
          <div className="carta__sidebar-hdr">
            <span>Categorías</span>
              <button className="carta__icon-btn" title="Nueva categoría" onClick={() => setCatModal({ open: true, data: null })}>
                <IconPlus />
              </button>
          </div>

          {loading
            ? [1,2,3].map(i => <div key={i} className="carta__skeleton carta__skeleton--row"/>)
            : categorias.length === 0
              ? <p style={{ fontSize: 13, color: "#6b7280", padding: "8px 0" }}>Sin categorías aún</p>
              : categorias.map((cat) => (
                <div key={cat.id_categoria} className={`carta__cat-item ${!cat.estado ? "carta__cat-item--inactive" : ""}`}>
                  <div className="carta__cat-info">
                    <span className="carta__cat-name">{cat.nombre}</span>
                    {cat.descripcion && <span className="carta__cat-desc">{cat.descripcion}</span>}
                  </div>
                  <div className="carta__cat-actions">
                    <button
                      className="carta__icon-btn"
                      title="Editar"
                      onClick={() => setCatModal({ open: true, data: cat })}
                    >
                      <IconEdit />
                    </button>
                    <button
                      className={`carta__icon-btn ${!cat.estado ? "carta__icon-btn--warning" : ""}`}
                      title={cat.estado ? "Desactivar" : "Activar"}
                      onClick={() => handleToggleCategoria(cat)}
                    >
                      <IconToggle />
                    </button>
                  </div>
                </div>
              ))
          }
        </aside>

        {/* Panel productos */}
        <main className="carta__main">
          {loading ? (
            <div className="carta__grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="carta__prod-card carta__skeleton-card">
                  <div className="carta__skeleton carta__skeleton--img"/>
                  <div className="carta__skeleton carta__skeleton--title"/>
                  <div className="carta__skeleton carta__skeleton--sub"/>
                </div>
              ))}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="carta__empty">
              <IconFolder />
              <p>No hay productos{busqueda ? ` para "${busqueda}"` : " en esta categoría"}.</p>
              <button className="carta__btn carta__btn--primary" style={{ marginTop: 16 }} onClick={() => setProdModal({ open: true, data: null })}>
                <IconPlus /> Agregar producto
              </button>
            </div>
          ) : (
            categorias
              .filter((cat) => categoriaActiva === "all" || cat.id_categoria === categoriaActiva)
              .map((cat) => {
                const items = productosFiltrados.filter((p) => p.id_categoria === cat.id_categoria)
                if (items.length === 0) return null
                return (
                  <section key={cat.id_categoria} className="carta__group">
                    <div className="carta__group-hdr">
                      <h2 className="carta__group-title">{cat.nombre}</h2>
                      <span className="carta__group-count">{items.length} producto{items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="carta__grid">
                        {items.map((prod) => (
                        <div key={prod.id_producto} className={`carta__prod-card ${!prod.estado ? "carta__prod-card--inactive" : ""}`}>
                          {/* ── Imagen ── */}
                          <div className="carta__prod-img">
                            {prod.imagen_referencial
                              ? <img src={prod.imagen_referencial} alt={prod.nombre} />
                              : <span className="carta__prod-img-placeholder">{prod.nombre.charAt(0).toUpperCase()}</span>
                            }
                            {!prod.estado && <span className="carta__prod-badge carta__prod-badge--off">Inactivo</span>}
                            {prod.estado && !prod.disponibilidad && (
                              <span className="carta__prod-badge carta__prod-badge--off">No disponible</span>
                            )}
                          </div>

                          {/* ── Body ── */}
                          <div className="carta__prod-body">
                             {/* Etiquetas */}
                              {prod.etiquetas && prod.etiquetas.length > 0 && (
                                <div className="carta__prod-tags">
                                  {prod.etiquetas.map((e) => (
                                    <span
                                      key={e.id_etiqueta}
                                      className="carta__tag"
                                      style={{ background: e.color_etiqueta + "22", color: e.color_etiqueta, border: `1px solid ${e.color_etiqueta}` }}
                                    >
                                      {e.nombre}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <h3 className="carta__prod-name">{prod.nombre}</h3>
                              {prod.descripcion && <p className="carta__prod-desc">{prod.descripcion}</p>}

                              <div className="carta__prod-footer">
                                <span className="carta__prod-price">
                                  S/ {Number(prod.precio_base).toFixed(2)}
                                </span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button className="carta__icon-btn" title="Editar"
                                    onClick={() => setProdModal({ open: true, data: prod })}>
                                    <IconEdit />
                                  </button>
                                  <button
                                    className={`carta__icon-btn ${!prod.estado ? "carta__icon-btn--warning" : ""}`}
                                    title={prod.estado ? "Desactivar" : "Activar"}
                                    onClick={() => handleToggleProducto(prod)}>
                                    <IconToggle />
                                  </button>
                                </div>
                              </div>
                            </div>                                          
                        </div>
                      ))}
                       {/* Tarjeta agregar */}
                          <div
                            className="carta__prod-card carta__prod-card--add"
                            onClick={() => setProdModal({ open: true, data: null })}
                          >
                            <div className="carta__prod-add-icon">+</div>
                            <span>Agregar producto</span>
                          </div>
                    </div>
                  </section>
                )
              })
          )}
        </main>
      </div>

      {/* ── Modales ── */}
      {catModal.open && (
        <CategoriaModal
          data={catModal.data}
          onSave={handleSaveCategoria}
          onClose={() => setCatModal({ open: false, data: null })}
        />
      )}

      {prodModal.open && (
        <ProductoModal
          data={prodModal.data}
          categorias={categorias.filter((c) => c.estado)}
          onSave={handleSaveProducto}
          onClose={() => setProdModal({ open: false, data: null })}
        />
      )}
    </div>
  )
}