// src/pages/modules/CartaPage/CartaPage.jsx

import { useEffect, useState } from "react"

import {
  asignarEtiquetas,
  createCategoria,
  createProducto,
  deleteCategoria,
  deleteProducto,
  getCategorias,
  getEtiquetas,
  getProductos,
  toggleCategoriaStatus,
  toggleProductoDisponibilidad,
  toggleProductoStatus,
  updateCategoria,
  updateProducto,
} from "../../../services/cartaService"

import RequirePermission from "../../../components/auth/RequirePermission"
import useToast from "../../../components/common/Toast/useToast"

import CategoriaModal from "./components/CategoriaModal"
import ConfirmModal from "./components/ConfirmModal"
import ProductoModal from "./components/ProductoModal"

import "./CartaPage.css"

const IconPlus = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const IconEdit = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconSearch = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const IconFolder = () => (
  <svg
    width="32"
    height="32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const IconDots = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

const IconTrash = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

const IconEye = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const IconLock = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="3"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <rect x="3" y="11" width="18" height="11" rx="3" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <path d="M12 15v2" strokeWidth="2.5" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" />
  </svg>
)

export default function CartaPage() {
  const { showToast } = useToast()

  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [loading, setLoading] = useState(true)

  const [categoriaActiva, setCategoriaActiva] = useState("all")
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState(null)

  const [catModal, setCatModal] = useState({ open: false, data: null })
  const [prodModal, setProdModal] = useState({
    open: false,
    data: null,
    defaultCategoryId: null,
  })
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    mensaje: "",
    onConfirm: null,
  })

  const [catMenuOpen, setCatMenuOpen] = useState(null)
  const [prodMenuOpen, setProdMenuOpen] = useState(null)
  const [catVisibility, setCatVisibility] = useState({})

  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [cats, prods, tags] = await Promise.all([
          getCategorias(),
          getProductos(),
          getEtiquetas(),
        ])

        if (!isMounted) return

        setCategorias(cats)
        setProductos(prods)
        setEtiquetas(tags)
      } catch (err) {
        if (!isMounted) return

        showToast({
          type: "error",
          title: "Error al cargar",
          message: err.message || "No se pudieron cargar los datos.",
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [showToast])

  async function recargarCarta({ showLoader = true } = {}) {
    if (showLoader) {
      setLoading(true)
    }

    try {
      const [cats, prods, tags] = await Promise.all([
        getCategorias(),
        getProductos(),
        getEtiquetas(),
      ])

      setCategorias(cats)
      setProductos(prods)
      setEtiquetas(tags)
    } catch (err) {
      showToast({
        type: "error",
        title: "Error al cargar",
        message: err.message || "No se pudieron cargar los datos.",
      })
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  const productosAgotados = productos.filter(
    (producto) => producto.estado && !producto.disponibilidad,
  ).length

  const productosInactivos = productos.filter(
    (producto) => !producto.estado,
  ).length

  const categoriasInactivas = categorias.filter(
    (categoria) => !categoria.estado,
  ).length

  const productosFiltrados = productos.filter((producto) => {
    const searchTerm = busqueda.trim().toLowerCase()

    const matchCat =
      categoriaActiva === "all" || producto.id_categoria === categoriaActiva

    const matchBusq =
      searchTerm === "" ||
      producto.nombre?.toLowerCase().includes(searchTerm) ||
      producto.descripcion?.toLowerCase().includes(searchTerm) ||
      (producto.etiquetas || []).some((etiqueta) =>
        etiqueta.nombre?.toLowerCase().includes(searchTerm),
      )

    const matchFiltro =
      filtroEstado === "agotado"
        ? producto.estado && !producto.disponibilidad
        : filtroEstado === "inactivo"
          ? !producto.estado
          : true

    return matchCat && matchBusq && matchFiltro
  })

  async function handleSaveCategoria(payload, id) {
    try {
      if (id) {
        const updated = await updateCategoria(id, payload)

        setCategorias((prev) =>
          prev.map((categoria) =>
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

        setCategorias((prev) => [...prev, nueva])

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

  function handleDeleteCategoria(cat) {
    setConfirmModal({
      open: true,
      mensaje: `¿Seguro que desea eliminar la categoría "${cat.nombre}"?\nEsta categoría se eliminará permanentemente.`,
      onConfirm: async () => {
        try {
          await deleteCategoria(cat.id_categoria)

          setCategorias((prev) =>
            prev.filter(
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
      },
    })
  }

  async function handleToggleCategoria(cat) {
    try {
      const updated = await toggleCategoriaStatus(
        cat.id_categoria,
        !cat.estado,
      )

      setCategorias((prev) =>
        prev.map((categoria) =>
          categoria.id_categoria === cat.id_categoria ? updated : categoria,
        ),
      )

      showToast({
        type: "success",
        title: updated.estado ? "Categoría activada" : "Categoría desactivada",
        message: updated.estado
          ? "La categoría fue activada correctamente."
          : "La categoría fue desactivada correctamente.",
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

      await recargarCarta({ showLoader: false })

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
    }
  }

  async function handleToggleProducto(prod) {
    try {
      const updated = await toggleProductoStatus(
        prod.id_producto,
        !prod.estado,
      )

      setProductos((prev) =>
        prev.map((producto) =>
          producto.id_producto === prod.id_producto
            ? { ...producto, ...updated }
            : producto,
        ),
      )

      showToast({
        type: "success",
        title: updated.estado ? "Producto activado" : "Producto desactivado",
        message: updated.estado
          ? "El producto fue activado correctamente."
          : "El producto fue desactivado correctamente.",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleToggleProductoDisponibilidad(prod) {
    try {
      const updated = await toggleProductoDisponibilidad(
        prod.id_producto,
        !prod.disponibilidad,
      )

      setProductos((prev) =>
        prev.map((producto) =>
          producto.id_producto === prod.id_producto
            ? { ...producto, ...updated }
            : producto,
        ),
      )

      showToast({
        type: updated.disponibilidad ? "success" : "warning",
        title: updated.disponibilidad
          ? "Producto disponible"
          : "Producto marcado como agotado",
        message: updated.disponibilidad
          ? "El producto vuelve a estar disponible para la operación."
          : "El producto ya no estará disponible temporalmente.",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  function handleDeleteProducto(prod) {
    setConfirmModal({
      open: true,
      mensaje: `¿Seguro que desea eliminar el producto "${prod.nombre}"?\nEste producto se eliminará permanentemente.`,
      onConfirm: async () => {
        try {
          await deleteProducto(prod.id_producto)

          setProductos((prev) =>
            prev.filter(
              (producto) => producto.id_producto !== prod.id_producto,
            ),
          )

          showToast({
            type: "success",
            title: "Producto eliminado",
            message: "El producto fue eliminado correctamente.",
          })
        } catch (err) {
          const mensaje = err.message?.includes("fk_item_orden_producto")
            ? "No se puede eliminar este producto porque tiene órdenes asociadas."
            : err.message

          showToast({
            type: "error",
            title: "Error",
            message: mensaje,
          })
        }
      },
    })
  }

  async function handleConfirmAction() {
    const action = confirmModal.onConfirm

    if (!action) {
      setConfirmModal({ open: false, mensaje: "", onConfirm: null })
      return
    }

    await action()
    setConfirmModal({ open: false, mensaje: "", onConfirm: null })
  }

  function handleToggleCategoryVisibility(cat) {
    const nuevoEstado = !catVisibility[cat.id_categoria]

    setCatVisibility((prev) => ({
      ...prev,
      [cat.id_categoria]: nuevoEstado,
    }))

    showToast({
      type: "success",
      title: nuevoEstado
        ? "Mostrando todos los productos"
        : "Ocultando productos inactivos",
      message: nuevoEstado
        ? "Se muestran productos inactivos y agotados."
        : "Solo se muestran productos activos y disponibles.",
    })
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
              type="button"
              onClick={() => setCatModal({ open: true, data: null })}
            >
              <IconPlus /> Nueva categoría
            </button>
          </RequirePermission>

          <RequirePermission permission="carta.gestionar">
            <button
              className="carta__btn carta__btn--primary"
              type="button"
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
            type="button"
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
              type="button"
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
      </div>

      <div className="carta__search-alerts">
        {productosAgotados > 0 && (
          <div className="carta__alert carta__alert--warning">
            <span className="carta__alert-icon" style={{ color: "#dc2626" }}>
              <IconLock />
            </span>

            <div>
              <strong>
                {productosAgotados} producto
                {productosAgotados !== 1 ? "s" : ""} agotado
                {productosAgotados !== 1 ? "s" : ""}
              </strong>
              <p>No disponibles temporalmente</p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFiltroEstado(
                  filtroEstado === "agotado" ? null : "agotado",
                )
              }
            >
              <span style={{ textDecoration: "underline" }}>
                {filtroEstado === "agotado" ? "Quitar" : "Ver"}
              </span>
            </button>
          </div>
        )}

        {productosInactivos > 0 && (
          <div className="carta__alert carta__alert--inactive">
            <span className="carta__alert-icon" style={{ color: "#6b7280" }}>
              <IconLock />
            </span>

            <div>
              <strong>
                {productosInactivos} producto
                {productosInactivos !== 1 ? "s" : ""} inactivo
                {productosInactivos !== 1 ? "s" : ""}
              </strong>
              <p>No visible para clientes</p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFiltroEstado(
                  filtroEstado === "inactivo" ? null : "inactivo",
                )
              }
            >
              <span style={{ textDecoration: "underline" }}>
                {filtroEstado === "inactivo" ? "Quitar" : "Ver"}
              </span>
            </button>
          </div>
        )}

        {categoriasInactivas > 0 && (
          <div className="carta__alert carta__alert--inactive">
            <span className="carta__alert-icon" style={{ color: "#6b7280" }}>
              <IconLock />
            </span>

            <div>
              <strong>
                {categoriasInactivas} categoría
                {categoriasInactivas !== 1 ? "s" : ""} inactiva
                {categoriasInactivas !== 1 ? "s" : ""}
              </strong>
              <p>No visible para clientes</p>
            </div>
          </div>
        )}

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
              {busqueda
                ? ` para "${busqueda}"`
                : filtroEstado
                  ? ` ${filtroEstado === "agotado" ? "agotados" : "inactivos"}`
                  : " en esta categoría"}
              .
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              {filtroEstado && (
                <button
                  className="carta__btn carta__btn--primary"
                  type="button"
                  onClick={() => setFiltroEstado(null)}
                >
                  Ver todos los productos
                </button>
              )}

              <RequirePermission permission="carta.gestionar">
                {!filtroEstado && (
                  <button
                    className="carta__btn carta__btn--primary"
                    type="button"
                    onClick={() =>
                      setProdModal({
                        open: true,
                        data: null,
                        defaultCategoryId:
                          categoriaActiva === "all" ? null : categoriaActiva,
                      })
                    }
                  >
                    <IconPlus /> Agregar producto
                  </button>
                )}
              </RequirePermission>
            </div>
          </div>
        ) : (
          categorias
            .filter((cat) =>
              categoriaActiva === "all"
                ? cat.estado
                : cat.id_categoria === categoriaActiva,
            )
            .map((cat) => {
              const todosItems = productosFiltrados.filter(
                (producto) => producto.id_categoria === cat.id_categoria,
              )

              const items =
                catVisibility[cat.id_categoria] || filtroEstado
                  ? todosItems
                  : todosItems.filter(
                      (producto) =>
                        producto.estado && producto.disponibilidad !== false,
                    )

              if (
                items.length === 0 &&
                (categoriaActiva !== "all" || filtroEstado || busqueda)
              ) {
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
                        type="button"
                        title="Ver productos ocultos"
                        onClick={() => handleToggleCategoryVisibility(cat)}
                      >
                        {catVisibility[cat.id_categoria] ? (
                          <IconEyeOff />
                        ) : (
                          <IconEye />
                        )}
                      </button>

                      <RequirePermission permission="carta.gestionar">
                        <div className="carta__cat-menu-wrap">
                          <button
                            className="carta__icon-btn carta__dots-btn"
                            type="button"
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
                                type="button"
                                onClick={() => {
                                  setCatModal({ open: true, data: cat })
                                  setCatMenuOpen(null)
                                }}
                              >
                                <IconEdit /> Editar categoría
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleToggleCategoria(cat)
                                  setCatMenuOpen(null)
                                }}
                              >
                                {cat.estado ? <IconEyeOff /> : <IconEye />}
                                {cat.estado ? " Desactivar" : " Activar"}
                              </button>

                              <button
                                className="carta__dropdown-danger"
                                type="button"
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
                        <RequirePermission permission="carta.gestionar">
                          <div className="carta__prod-menu-wrap">
                            <button
                              className="carta__prod-dots"
                              type="button"
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
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProdModal({ open: true, data: prod })
                                    setProdMenuOpen(null)
                                  }}
                                >
                                  <IconEdit /> Editar producto
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleProductoDisponibilidad(prod)
                                    setProdMenuOpen(null)
                                  }}
                                >
                                  {prod.disponibilidad ? (
                                    <IconEyeOff />
                                  ) : (
                                    <IconEye />
                                  )}
                                  {prod.disponibilidad
                                    ? " Marcar agotado"
                                    : " Marcar disponible"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleProducto(prod)
                                    setProdMenuOpen(null)
                                  }}
                                >
                                  {prod.estado ? <IconEyeOff /> : <IconEye />}
                                  {prod.estado ? " Desactivar" : " Activar"}
                                </button>

                                <button
                                  className="carta__dropdown-danger"
                                  type="button"
                                  onClick={() => {
                                    handleDeleteProducto(prod)
                                    setProdMenuOpen(null)
                                  }}
                                >
                                  <IconTrash /> Eliminar producto
                                </button>
                              </div>
                            )}
                          </div>
                        </RequirePermission>

                        <div className="carta__prod-img">
                          {prod.imagen_referencial ? (
                            <img
                              src={prod.imagen_referencial}
                              alt={prod.nombre}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(event) => {
                                event.currentTarget.style.display = "none"

                                if (event.currentTarget.nextSibling) {
                                  event.currentTarget.nextSibling.style.display =
                                    "flex"
                                }
                              }}
                            />
                          ) : null}

                          <div
                            className="carta__prod-img-placeholder"
                            style={{
                              display: prod.imagen_referencial
                                ? "none"
                                : "flex",
                            }}
                          >
                            🍽
                          </div>
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

                          {!prod.estado && (
                            <span className="carta__tag">Inactivo</span>
                          )}

                          {prod.estado && !prod.disponibilidad && (
                            <span className="carta__tag">Agotado</span>
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
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setProdModal({
                            open: true,
                            data: null,
                            defaultCategoryId: cat.id_categoria,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            setProdModal({
                              open: true,
                              data: null,
                              defaultCategoryId: cat.id_categoria,
                            })
                          }
                        }}
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
          categorias={categorias}
          etiquetas={etiquetas}
          defaultCategoryId={prodModal.defaultCategoryId}
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

      {confirmModal.open && (
        <ConfirmModal
          mensaje={confirmModal.mensaje}
          onConfirm={handleConfirmAction}
          onClose={() =>
            setConfirmModal({ open: false, mensaje: "", onConfirm: null })
          }
        />
      )}
    </div>
  )
}