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
  deleteCategoria,
  deleteProducto,
} from "../../../services/cartaService"
import useToast from "../../../components/common/Toast/useToast"
import RequirePermission from "../../../components/auth/RequirePermission"  // ← NUEVO
import CategoriaModal from "./components/CategoriaModal"
import ProductoModal from "./components/ProductoModal"
import "./CartaPage.css"

// ── Iconos ────────────────────────────────────────────────────────────────────
const IconPlus    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
const IconEdit    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconSearch  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
const IconFolder  = () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
const IconDots    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
const IconTrash   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const IconEye     = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconEyeOff  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

export default function CartaPage() {
  const { showToast } = useToast()

  const [categorias, setCategorias]   = useState([])
  const [productos, setProductos]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState("all")
  const [busqueda, setBusqueda]       = useState("")
  const [catModal, setCatModal]       = useState({ open: false, data: null })
  const [prodModal, setProdModal]     = useState({ open: false, data: null, defaultCategoryId: null })
  const [catMenuOpen, setCatMenuOpen] = useState(null)
  const [prodMenuOpen, setProdMenuOpen] = useState(null)
  const [catVisibility, setCatVisibility] = useState({})

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, prods] = await Promise.all([getCategorias(), getProductos()])
      setCategorias(cats)
      setProductos(prods)
    } catch (err) {
      showToast({ type: "error", title: "Error al cargar", message: err.message || "No se pudieron cargar los datos." })
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
        showToast({ type: "success", title: "Categoría actualizada", message: "La categoría fue modificada correctamente." })
      } else {
        const nueva = await createCategoria(payload)
        setCategorias((prev) => [...prev, nueva])
        showToast({ type: "success", title: "Categoría creada", message: "La categoría fue agregada correctamente." })
      }
      setCatModal({ open: false, data: null })
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.message })
    }
  }

  async function handleDeleteCategoria(cat) {
    const confirmed = window.confirm(`¿Eliminar la categoría "${cat.nombre}"? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    try {
      await deleteCategoria(cat.id_categoria)
      setCategorias((prev) => prev.filter((c) => c.id_categoria !== cat.id_categoria))
      showToast({ type: "success", title: "Categoría eliminada", message: "La categoría fue eliminada correctamente." })
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.message })
    }
  }

  async function handleToggleCategoria(cat) {
    try {
      const updated = await toggleCategoriaStatus(cat.id_categoria, !cat.estado)
      setCategorias((prev) => prev.map((c) => (c.id_categoria === cat.id_categoria ? updated : c)))
      showToast({ type: "success", title: updated.estado ? "Categoría activada" : "Categoría desactivada", message: `La categoría fue ${updated.estado ? "activada" : "desactivada"} correctamente.` })
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.message })
    }
  }

  // ── Handlers Producto ─────────────────────────────────────────────────────
  async function handleSaveProducto(payload, id) {
    try {
      const { tag_ids, ...productoData } = payload
      if (id) {
        await updateProducto(id, productoData)
        await asignarEtiquetas(id, tag_ids || [])
      } else {
        const nuevo = await createProducto(productoData)
        await asignarEtiquetas(nuevo.id_producto, tag_ids || [])
      }
      await cargarDatos()
      showToast({ type: "success", title: id ? "Producto actualizado" : "Producto creado", message: id ? "El producto fue modificado correctamente." : "El producto fue agregado correctamente." })
      setProdModal({ open: false, data: null, defaultCategoryId: null })
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.message })
    }
  }

  async function handleToggleProducto(prod) {
    try {
      const updated = await toggleProductoStatus(prod.id_producto, !prod.estado)
      setProductos((prev) => prev.map((p) => (p.id_producto === prod.id_producto ? updated : p)))
      showToast({ type: "success", title: updated.estado ? "Producto activado" : "Producto desactivado", message: `El producto fue ${updated.estado ? "activado" : "desactivado"} correctamente.` })
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.message })
    }
  }

  async function handleDeleteProducto(prod) {
    const confirmed = window.confirm(`¿Eliminar el producto "${prod.nombre}"?`)
    if (!confirmed) return
    try {
      await deleteProducto(prod.id_producto)
      setProductos((prev) => prev.filter((p) => p.id_producto !== prod.id_producto))
      showToast({ type: "success", title: "Producto eliminado", message: "El producto fue eliminado correctamente." })
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.message })
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="carta">

      {/* ── PUNTO 1: Header — botones Nueva categoría y Nuevo producto ── */}
      <div className="carta__header">
        <div>
          <span className="carta__breadcrumb">CARTA</span>
          <h1 className="carta__title">Gestión de Carta</h1>
          <p className="carta__sub">Categorías y productos del menú de tu restaurante.</p>
        </div>
        <div className="carta__header-actions">
          {/* Solo admin ve estos botones */}
          <RequirePermission permission="carta.gestionar">
            <button
              className="carta__btn carta__btn--secondary"
              onClick={() => setCatModal({ open: true, data: null })}
            >
              <IconPlus /> Nueva categoría
            </button>
          </RequirePermission>
          <RequirePermission permission="carta.gestionar">
            <button
              className="carta__btn carta__btn--primary"
              onClick={() => setProdModal({ open: true, data: null, defaultCategoryId: null })}
            >
              <IconPlus /> Nuevo producto
            </button>
          </RequirePermission>
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

      {/* ── Panel productos ── */}
      <div className="carta__main">
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
            {/* Solo admin ve el botón de agregar en estado vacío */}
            <RequirePermission permission="carta.gestionar">
              <button
                className="carta__btn carta__btn--primary"
                style={{ marginTop: 16 }}
                onClick={() => setProdModal({ open: true, data: null, defaultCategoryId: null })}
              >
                <IconPlus /> Agregar producto
              </button>
            </RequirePermission>
          </div>
        ) : (
          categorias
            .filter((cat) => categoriaActiva === "all" || cat.id_categoria === categoriaActiva)
            .map((cat) => {
              const todosItems = productosFiltrados.filter((p) => p.id_categoria === cat.id_categoria)
              const items = catVisibility[cat.id_categoria]
                ? todosItems
                : todosItems.filter((p) => p.estado && p.disponibilidad !== false)
              if (items.length === 0 && !catVisibility[cat.id_categoria]) return null

              return (
                <section key={cat.id_categoria} className="carta__group">

                  {/* ── PUNTO 2: Header de grupo — ojo (todos), + y ··· (solo admin) ── */}
                  <div className="carta__group-hdr">
                    <h2 className="carta__group-title">{cat.nombre}</h2>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>

                      {/* Contador — visible para todos */}
                      <span className="carta__group-count" style={{ marginRight: 8 }}>
                        # {productos.filter(p => p.id_categoria === cat.id_categoria).length} productos
                      </span>

                      {/* Ojo — visible para TODOS (admin y mozo) */}
                      <button
                        className="carta__icon-btn"
                        title={catVisibility[cat.id_categoria] ? "Ocultar inactivos/agotados" : "Ver inactivos/agotados"}
                        onClick={() =>
                          setCatVisibility(prev => ({
                            ...prev,
                            [cat.id_categoria]: !prev[cat.id_categoria]
                          }))
                        }
                      >
                        {catVisibility[cat.id_categoria] ? <IconEyeOff /> : <IconEye />}
                      </button>

                      {/* PUNTO 2A: Botón + — solo admin */}
                      <RequirePermission permission="carta.gestionar">
                        <button
                          className="carta__icon-btn"
                          title="Agregar producto"
                          onClick={() =>
                            setProdModal({
                              open: true,
                              data: null,
                              defaultCategoryId: cat.id_categoria
                            })
                          }
                        >
                          <IconPlus />
                        </button>
                      </RequirePermission>

                      {/* PUNTO 2B: Menú ··· categoría — solo admin */}
                      <RequirePermission permission="carta.gestionar">
                        <div className="carta__cat-menu-wrap">
                          <button
                            className="carta__icon-btn carta__dots-btn"
                            onClick={() =>
                              setCatMenuOpen(catMenuOpen === cat.id_categoria ? null : cat.id_categoria)
                            }
                          >
                            <IconDots />
                          </button>
                          {catMenuOpen === cat.id_categoria && (
                            <div className="carta__dropdown">
                              <button onClick={() => { setCatModal({ open: true, data: cat }); setCatMenuOpen(null) }}>
                                <IconEdit /> Editar categoría
                              </button>
                              <button
                                className="carta__dropdown-danger"
                                onClick={() => { handleDeleteCategoria(cat); setCatMenuOpen(null) }}
                              >
                                <IconTrash /> Eliminar categoría
                              </button>
                            </div>
                          )}
                        </div>
                      </RequirePermission>

                    </div>
                  </div>

                  {/* ── Grid de productos ── */}
                  <div className="carta__grid">
                    {items.map((prod) => (
                      <div
                        key={prod.id_producto}
                        className={`carta__prod-card ${!prod.estado ? "carta__prod-card--inactive" : ""}`}
                      >

                        {/* ── PUNTO 3: Menú ··· producto — editar/eliminar solo admin, toggle todos ── */}
                        <div className="carta__prod-menu-wrap">
                          <button
                            className="carta__prod-dots"
                            onClick={() =>
                              setProdMenuOpen(prodMenuOpen === prod.id_producto ? null : prod.id_producto)
                            }
                          >
                            <IconDots />
                          </button>

                          {prodMenuOpen === prod.id_producto && (
                            <div className="carta__dropdown">

                              {/* Editar — solo admin */}
                              <RequirePermission permission="carta.gestionar">
                                <button onClick={() => { setProdModal({ open: true, data: prod }); setProdMenuOpen(null) }}>
                                  <IconEdit /> Editar producto
                                </button>
                              </RequirePermission>

                              {/* Toggle activo/inactivo — visible para TODOS (admin y mozo) */}
                              <button onClick={() => { handleToggleProducto(prod); setProdMenuOpen(null) }}>
                                {prod.estado ? <IconEyeOff /> : <IconEye />}
                                {prod.estado ? " Desactivar" : " Activar"}
                              </button>

                              {/* Eliminar — solo admin */}
                              <RequirePermission permission="carta.gestionar">
                                <button
                                  className="carta__dropdown-danger"
                                  onClick={() => { handleDeleteProducto(prod); setProdMenuOpen(null) }}
                                >
                                  <IconTrash /> Eliminar producto
                                </button>
                              </RequirePermission>

                            </div>
                          )}
                        </div>

                        {/* Imagen */}
                        <div className="carta__prod-img">
                          {prod.imagen_referencial ? (
                            <img
                              src={prod.imagen_referencial}
                              alt={prod.nombre}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextSibling.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className="carta__prod-img-placeholder"
                            style={{ display: prod.imagen_referencial ? "none" : "flex" }}
                          >
                            🍽
                          </div>
                          {!prod.estado && (
                            <span className="carta__prod-badge carta__prod-badge--off">Inactivo</span>
                          )}
                          {prod.estado && prod.disponibilidad === false && (
                            <span className="carta__prod-badge carta__prod-badge--agotado">Agotado</span>
                          )}
                        </div>

                        {/* Cuerpo */}
                        <div className="carta__prod-body">
                          {prod.etiquetas && prod.etiquetas.length > 0 && (
                            <div className="carta__prod-tags">
                              {prod.etiquetas.map((e) => (
                                <span
                                  key={e.id_etiqueta}
                                  className="carta__tag"
                                  style={{
                                    background: e.color_etiqueta + "22",
                                    color: e.color_etiqueta,
                                    border: `1px solid ${e.color_etiqueta}`
                                  }}
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
                          </div>
                        </div>

                      </div>
                    ))}

                    {/* PUNTO 4: Tarjeta agregar — solo admin */}
                    <RequirePermission permission="carta.gestionar">
                      <div
                        className="carta__prod-card carta__prod-card--add"
                        onClick={() => setProdModal({ open: true, data: null, defaultCategoryId: cat.id_categoria })}
                      >
                        <div className="carta__prod-add-icon">+</div>
                        <span>Agregar producto</span>
                      </div>
                    </RequirePermission>

                  </div>
                </section>
              )
            })
        )}
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
          defaultCategoryId={prodModal.defaultCategoryId}
          categorias={categorias.filter((c) => c.estado)}
          onSave={handleSaveProducto}
          onClose={() => setProdModal({ open: false, data: null, defaultCategoryId: null })}
        />
      )}

    </div>
  )
}