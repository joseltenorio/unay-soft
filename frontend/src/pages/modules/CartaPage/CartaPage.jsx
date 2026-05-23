// src/pages/modules/CartaPage/CartaPage.jsx

import { useEffect, useState } from "react"

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
import RequirePermission from "../../../components/auth/RequirePermission"
import CategoriaModal from "./components/CategoriaModal"
import ProductoModal from "./components/ProductoModal"

import "./CartaPage.css"

const IconPlus = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const IconEdit = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const IconFolder = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const IconDots = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

const IconTrash = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

const IconEye = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default function CartaPage() {
  const { showToast } = useToast()

  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  const [categoriaActiva, setCategoriaActiva] = useState("all")
  const [busqueda, setBusqueda] = useState("")

  const [catModal, setCatModal] = useState({ open: false, data: null })
  const [prodModal, setProdModal] = useState({
    open: false,
    data: null,
    defaultCategoryId: null,
  })

  const [catMenuOpen, setCatMenuOpen] = useState(null)
  const [prodMenuOpen, setProdMenuOpen] = useState(null)
  const [catVisibility, setCatVisibility] = useState({})

  useEffect(() => {
    let isMounted = true

    Promise.all([getCategorias(), getProductos()])
      .then(([cats, prods]) => {
        if (!isMounted) return

        setCategorias(cats)
        setProductos(prods)
      })
      .catch((err) => {
        if (!isMounted) return

        showToast({
          type: "error",
          title: "Error al cargar",
          message: err.message || "No se pudieron cargar los datos.",
        })
      })
      .finally(() => {
        if (!isMounted) return

        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [showToast])

  async function recargarDatosCarta() {
    const [cats, prods] = await Promise.all([getCategorias(), getProductos()])

    setCategorias(cats)
    setProductos(prods)
  }

  const productosFiltrados = productos.filter((producto) => {
    const busquedaNormalizada = busqueda.trim().toLowerCase()

    const matchCategoria =
      categoriaActiva === "all" || producto.id_categoria === categoriaActiva

    const matchBusqueda =
      busquedaNormalizada === "" ||
      producto.nombre.toLowerCase().includes(busquedaNormalizada) ||
      (producto.categoria_nombre || "").toLowerCase().includes(busquedaNormalizada)

    return matchCategoria && matchBusqueda
  })

  async function handleSaveCategoria(payload, id) {
    try {
      if (id) {
        const updated = await updateCategoria(id, payload)

        setCategorias((prevCategorias) =>
          prevCategorias.map((categoria) =>
            categoria.id_categoria === id ? updated : categoria,
          ),
        )

        showToast({
          type: "success",
          title: "Categoría actualizada",
          message: "La categoría fue modificada correctamente.",
        })
      } else {
        const nueva = await createCategoria(payload)

        setCategorias((prevCategorias) => [...prevCategorias, nueva])

        showToast({
          type: "success",
          title: "Categoría creada",
          message: "La categoría fue agregada correctamente.",
        })
      }

      setCatModal({ open: false, data: null })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleDeleteCategoria(cat) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${cat.nombre}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) return

    try {
      await deleteCategoria(cat.id_categoria)

      setCategorias((prevCategorias) =>
        prevCategorias.filter(
          (categoria) => categoria.id_categoria !== cat.id_categoria,
        ),
      )

      showToast({
        type: "success",
        title: "Categoría eliminada",
        message: "La categoría fue eliminada correctamente.",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleToggleCategoria(cat) {
    try {
      const updated = await toggleCategoriaStatus(cat.id_categoria, !cat.estado)

      setCategorias((prevCategorias) =>
        prevCategorias.map((categoria) =>
          categoria.id_categoria === cat.id_categoria ? updated : categoria,
        ),
      )

      showToast({
        type: "success",
        title: updated.estado ? "Categoría activada" : "Categoría desactivada",
        message: `La categoría fue ${
          updated.estado ? "activada" : "desactivada"
        } correctamente.`,
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

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

      setLoading(true)
      await recargarDatosCarta()
      setLoading(false)

      showToast({
        type: "success",
        title: id ? "Producto actualizado" : "Producto creado",
        message: id
          ? "El producto fue modificado correctamente."
          : "El producto fue agregado correctamente.",
      })

      setProdModal({ open: false, data: null, defaultCategoryId: null })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })

      setLoading(false)
    }
  }

  async function handleToggleProducto(prod) {
    try {
      const updated = await toggleProductoStatus(prod.id_producto, !prod.estado)

      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id_producto === prod.id_producto ? updated : producto,
        ),
      )

      showToast({
        type: "success",
        title: updated.estado ? "Producto activado" : "Producto desactivado",
        message: `El producto fue ${
          updated.estado ? "activado" : "desactivado"
        } correctamente.`,
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleDeleteProducto(prod) {
    const confirmed = window.confirm(`¿Eliminar el producto "${prod.nombre}"?`)

    if (!confirmed) return

    try {
      await deleteProducto(prod.id_producto)

      setProductos((prevProductos) =>
        prevProductos.filter(
          (producto) => producto.id_producto !== prod.id_producto,
        ),
      )

      showToast({
        type: "success",
        title: "Producto eliminado",
        message: "El producto fue eliminado correctamente.",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  return (
    <div className="carta">
      <div className="carta__header">
        <div>
          <span className="carta__breadcrumb">CARTA</span>
          <h1 className="carta__title">Gestión de Carta</h1>
          <p className="carta__sub">
            Categorías y productos del menú de tu restaurante.
          </p>
        </div>

        <div className="carta__header-actions">
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
              onClick={() =>
                setProdModal({
                  open: true,
                  data: null,
                  defaultCategoryId: null,
                })
              }
            >
              <IconPlus /> Nuevo producto
            </button>
          </RequirePermission>
        </div>
      </div>

      <div className="carta__toolbar">
        <div className="carta__cat-tabs">
          <button
            className={`carta__cat-tab ${
              categoriaActiva === "all" ? "carta__cat-tab--active" : ""
            }`}
            onClick={() => setCategoriaActiva("all")}
          >
            Todas
            <span className="carta__cat-count">{productos.length}</span>
          </button>

          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              className={`carta__cat-tab ${
                categoriaActiva === cat.id_categoria
                  ? "carta__cat-tab--active"
                  : ""
              } ${!cat.estado ? "carta__cat-tab--inactive" : ""}`}
              onClick={() => setCategoriaActiva(cat.id_categoria)}
            >
              {cat.nombre}
              <span className="carta__cat-count">
                {
                  productos.filter(
                    (producto) => producto.id_categoria === cat.id_categoria,
                  ).length
                }
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
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
      </div>

      <div className="carta__main">
        {loading ? (
          <div className="carta__grid">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="carta__prod-card carta__skeleton-card"
              >
                <div className="carta__skeleton carta__skeleton--img" />
                <div className="carta__skeleton carta__skeleton--title" />
                <div className="carta__skeleton carta__skeleton--sub" />
              </div>
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="carta__empty">
            <IconFolder />
            <p>
              No hay productos
              {busqueda ? ` para "${busqueda}"` : " en esta categoría"}.
            </p>

            <RequirePermission permission="carta.gestionar">
              <button
                className="carta__btn carta__btn--primary"
                style={{ marginTop: 16 }}
                onClick={() =>
                  setProdModal({
                    open: true,
                    data: null,
                    defaultCategoryId: null,
                  })
                }
              >
                <IconPlus /> Agregar producto
              </button>
            </RequirePermission>
          </div>
        ) : (
          categorias
            .filter(
              (cat) =>
                categoriaActiva === "all" ||
                cat.id_categoria === categoriaActiva,
            )
            .map((cat) => {
              const todosItems = productosFiltrados.filter(
                (producto) => producto.id_categoria === cat.id_categoria,
              )

              const items = catVisibility[cat.id_categoria]
                ? todosItems
                : todosItems.filter(
                    (producto) =>
                      producto.estado && producto.disponibilidad !== false,
                  )

              if (items.length === 0 && !catVisibility[cat.id_categoria]) {
                return null
              }

              return (
                <section key={cat.id_categoria} className="carta__group">
                  <div className="carta__group-hdr">
                    <h2 className="carta__group-title">{cat.nombre}</h2>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        className="carta__group-count"
                        style={{ marginRight: 8 }}
                      >
                        #{" "}
                        {
                          productos.filter(
                            (producto) =>
                              producto.id_categoria === cat.id_categoria,
                          ).length
                        }{" "}
                        productos
                      </span>

                      <button
                        className="carta__icon-btn"
                        title={
                          catVisibility[cat.id_categoria]
                            ? "Ocultar inactivos/agotados"
                            : "Ver inactivos/agotados"
                        }
                        onClick={() =>
                          setCatVisibility((prevVisibility) => ({
                            ...prevVisibility,
                            [cat.id_categoria]: !prevVisibility[cat.id_categoria],
                          }))
                        }
                      >
                        {catVisibility[cat.id_categoria] ? (
                          <IconEyeOff />
                        ) : (
                          <IconEye />
                        )}
                      </button>

                      <RequirePermission permission="carta.gestionar">
                        <button
                          className="carta__icon-btn"
                          title="Agregar producto"
                          onClick={() =>
                            setProdModal({
                              open: true,
                              data: null,
                              defaultCategoryId: cat.id_categoria,
                            })
                          }
                        >
                          <IconPlus />
                        </button>
                      </RequirePermission>

                      <RequirePermission permission="carta.gestionar">
                        <div className="carta__cat-menu-wrap">
                          <button
                            className="carta__icon-btn carta__dots-btn"
                            onClick={() =>
                              setCatMenuOpen(
                                catMenuOpen === cat.id_categoria
                                  ? null
                                  : cat.id_categoria,
                              )
                            }
                          >
                            <IconDots />
                          </button>

                          {catMenuOpen === cat.id_categoria && (
                            <div className="carta__dropdown">
                              <button
                                onClick={() => {
                                  setCatModal({ open: true, data: cat })
                                  setCatMenuOpen(null)
                                }}
                              >
                                <IconEdit /> Editar categoría
                              </button>

                              <button
                                onClick={() => {
                                  handleToggleCategoria(cat)
                                  setCatMenuOpen(null)
                                }}
                              >
                                {cat.estado ? <IconEyeOff /> : <IconEye />}
                                {cat.estado
                                  ? " Desactivar categoría"
                                  : " Activar categoría"}
                              </button>

                              <button
                                className="carta__dropdown-danger"
                                onClick={() => {
                                  handleDeleteCategoria(cat)
                                  setCatMenuOpen(null)
                                }}
                              >
                                <IconTrash /> Eliminar categoría
                              </button>
                            </div>
                          )}
                        </div>
                      </RequirePermission>
                    </div>
                  </div>

                  <div className="carta__grid">
                    {items.map((prod) => (
                      <div
                        key={prod.id_producto}
                        className={`carta__prod-card ${
                          !prod.estado ? "carta__prod-card--inactive" : ""
                        }`}
                      >
                        <div className="carta__prod-menu-wrap">
                          <button
                            className="carta__prod-dots"
                            onClick={() =>
                              setProdMenuOpen(
                                prodMenuOpen === prod.id_producto
                                  ? null
                                  : prod.id_producto,
                              )
                            }
                          >
                            <IconDots />
                          </button>

                          {prodMenuOpen === prod.id_producto && (
                            <div className="carta__dropdown">
                              <RequirePermission permission="carta.gestionar">
                                <button
                                  onClick={() => {
                                    setProdModal({
                                      open: true,
                                      data: prod,
                                      defaultCategoryId: null,
                                    })
                                    setProdMenuOpen(null)
                                  }}
                                >
                                  <IconEdit /> Editar producto
                                </button>
                              </RequirePermission>

                              <button
                                onClick={() => {
                                  handleToggleProducto(prod)
                                  setProdMenuOpen(null)
                                }}
                              >
                                {prod.estado ? <IconEyeOff /> : <IconEye />}
                                {prod.estado ? " Desactivar" : " Activar"}
                              </button>

                              <RequirePermission permission="carta.gestionar">
                                <button
                                  className="carta__dropdown-danger"
                                  onClick={() => {
                                    handleDeleteProducto(prod)
                                    setProdMenuOpen(null)
                                  }}
                                >
                                  <IconTrash /> Eliminar producto
                                </button>
                              </RequirePermission>
                            </div>
                          )}
                        </div>

                        <div className="carta__prod-img">
                          {prod.imagen_referencial ? (
                            <img
                              src={prod.imagen_referencial}
                              alt={prod.nombre}
                              onError={(event) => {
                                event.currentTarget.style.display = "none"

                                const placeholder =
                                  event.currentTarget.nextElementSibling

                                if (placeholder) {
                                  placeholder.style.display = "flex"
                                }
                              }}
                            />
                          ) : null}

                          <div
                            className="carta__prod-img-placeholder"
                            style={{
                              display: prod.imagen_referencial ? "none" : "flex",
                            }}
                          >
                            🍽
                          </div>

                          {!prod.estado && (
                            <span className="carta__prod-badge carta__prod-badge--off">
                              Inactivo
                            </span>
                          )}

                          {prod.estado && prod.disponibilidad === false && (
                            <span className="carta__prod-badge carta__prod-badge--agotado">
                              Agotado
                            </span>
                          )}
                        </div>

                        <div className="carta__prod-body">
                          {prod.etiquetas && prod.etiquetas.length > 0 && (
                            <div className="carta__prod-tags">
                              {prod.etiquetas.map((etiqueta) => (
                                <span
                                  key={etiqueta.id_etiqueta}
                                  className="carta__tag"
                                  style={{
                                    background: `${etiqueta.color_etiqueta}22`,
                                    color: etiqueta.color_etiqueta,
                                    border: `1px solid ${etiqueta.color_etiqueta}`,
                                  }}
                                >
                                  {etiqueta.nombre}
                                </span>
                              ))}
                            </div>
                          )}

                          <h3 className="carta__prod-name">{prod.nombre}</h3>

                          {prod.descripcion && (
                            <p className="carta__prod-desc">
                              {prod.descripcion}
                            </p>
                          )}

                          <div className="carta__prod-footer">
                            <span className="carta__prod-price">
                              S/ {Number(prod.precio_base).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <RequirePermission permission="carta.gestionar">
                      <div
                        className="carta__prod-card carta__prod-card--add"
                        onClick={() =>
                          setProdModal({
                            open: true,
                            data: null,
                            defaultCategoryId: cat.id_categoria,
                          })
                        }
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
          categorias={categorias.filter((categoria) => categoria.estado)}
          onSave={handleSaveProducto}
          onClose={() =>
            setProdModal({
              open: false,
              data: null,
              defaultCategoryId: null,
            })
          }
        />
      )}
    </div>
  )
}