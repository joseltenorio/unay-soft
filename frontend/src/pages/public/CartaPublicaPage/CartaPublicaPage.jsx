// src/pages/public/CartaPublicaPage/CartaPublicaPage.jsx

import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import "./CartaPublicaPage.css"

const BASE_URL = "http://localhost:3000/api/public"

async function fetchCarta(slug) {
  const res = await fetch(`${BASE_URL}/carta/${slug}`)  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "No se pudo cargar la carta.")
  }
  return res.json()
}

const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
)

const IconFolder = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor"
    strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

export default function CartaPublicaPage() {
  const { slug } = useParams()

  const [establecimiento, setEstablecimiento] = useState(null)
  const [categorias, setCategorias]           = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [catActiva, setCatActiva]             = useState("all")
  const [busqueda, setBusqueda]               = useState("")

  const seccionRefs = useRef({})

  useEffect(() => {
    fetchCarta(slug)
      .then(data => {
        setEstablecimiento(data.establecimiento)
        setCategorias(data.categorias)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  const totalProductos = categorias.reduce((acc, c) => acc + c.productos.length, 0)

  const categoriasFiltradas = categorias
    .map(cat => ({
      ...cat,
      productos: cat.productos.filter(p => {
        if (!busqueda.trim()) return true
        const t = busqueda.toLowerCase()
        return (
          p.nombre?.toLowerCase().includes(t) ||
          p.descripcion?.toLowerCase().includes(t)
        )
      }),
    }))
    .filter(cat => cat.productos.length > 0)

  const categoriasMostradas =
    catActiva === "all"
      ? categoriasFiltradas
      : categoriasFiltradas.filter(c => c.id_categoria === catActiva)

  function handleTabClick(id) {
    setCatActiva(id)
    setBusqueda("")
    setTimeout(() => {
      seccionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="cpub">
      <div className="cpub__header-skeleton" />
      <div className="cpub__main">
        <div className="carta__grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="carta__prod-card carta__skeleton-card">
              <div className="carta__skeleton carta__skeleton--img" />
              <div className="carta__skeleton carta__skeleton--title" />
              <div className="carta__skeleton carta__skeleton--sub" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="cpub">
      <div className="carta__empty" style={{ minHeight: "100vh" }}>
        <IconFolder />
        <p>{error}</p>
      </div>
    </div>
  )

  // ── Render principal ─────────────────────────────────────────────────────
  return (
    <div className="cpub">

      {/* ── HEADER — logo izquierda, nombre derecha (como la imagen 2) ──── */}
      <header className="cpub__header">
        <div className="cpub__header-inner">

          <div className="cpub__header-left">
            <span className="cpub__brand-icon">U</span>
            <span className="cpub__brand-name">Umari</span>
          </div>

          <div className="cpub__header-right">
            {establecimiento?.logo_url ? (
              <img
                className="cpub__est-logo"
                src={establecimiento.logo_url}
                alt={establecimiento.nombre_comercial}
              />
            ) : (
              <div className="cpub__est-logo-placeholder">
                {establecimiento?.nombre_comercial?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <h1 className="cpub__est-name">{establecimiento?.nombre_comercial}</h1>
              <span className="cpub__est-badge">Carta digital</span>
            </div>
          </div>

        </div>
      </header>

      {/* ── BUSCADOR ────────────────────────────────────────────────────── */}
      <div className="cpub__main">
        <div className="carta__search-wrap" style={{ marginBottom: 16, marginLeft: 0 }}>
          <IconSearch />
          <input
            className="carta__search"
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setCatActiva("all") }}
          />
        </div>

        {/* ── TABS — píldoras como CartaPage ──────────────────────────── */}
        <div className="carta__cat-tabs" style={{ marginBottom: 24 }}>
          <button
            className={`carta__cat-tab ${catActiva === "all" ? "carta__cat-tab--active" : ""}`}
            onClick={() => { setCatActiva("all"); setBusqueda("") }}
          >
            Todas
            <span className="carta__cat-count">{totalProductos}</span>
          </button>

          {categorias.map(cat => (
            <button
              key={cat.id_categoria}
              className={`carta__cat-tab ${catActiva === cat.id_categoria ? "carta__cat-tab--active" : ""}`}
              onClick={() => handleTabClick(cat.id_categoria)}
            >
              {cat.nombre}
              <span className="carta__cat-count">{cat.productos.length}</span>
            </button>
          ))}
        </div>

        {/* ── PRODUCTOS ─────────────────────────────────────────────────── */}
        {categoriasMostradas.length === 0 ? (
          <div className="carta__empty">
            <IconFolder />
            <p>No hay productos {busqueda ? `para "${busqueda}"` : "disponibles"}.</p>
          </div>
        ) : (
          categoriasMostradas.map(cat => (
            <section
              key={cat.id_categoria}
              className="cpub__group"
              ref={el => (seccionRefs.current[cat.id_categoria] = el)}
            >
              <div className="cpub__group-hdr">
                <h2 className="cpub__group-title">{cat.nombre}</h2>
                {catActiva === "all" && cat.productos.length > 4 && (
                  <button
                    className="cpub__ver-mas"
                    onClick={() => handleTabClick(cat.id_categoria)}
                  >
                    Ver más {cat.nombre.toLowerCase()} →
                  </button>
                )}
              </div>

              <div className="carta__grid">
                {(catActiva === "all" ? cat.productos.slice(0, 6) : cat.productos)
                  .map(prod => (
                    <ProductoCard
                      key={prod.id_producto}
                      prod={prod}
                      simbolo={establecimiento?.moneda_simbolo || "S/"}
                    />
                  ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ── FOOTER — igual que la imagen 2 ────────────────────────────── */}
      <footer className="cpub__footer">
        <span className="cpub__footer-brand">
          <span className="cpub__footer-icon">U</span> Umari
        </span>
        <p>Gracias por preferirnos ❤️</p>
      </footer>

    </div>
  )
}

// ── Tarjeta de producto — usa exactamente las clases de CartaPage ──────────
function ProductoCard({ prod, simbolo }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="carta__prod-card">
      <div className="carta__prod-img">
        {prod.imagen_referencial && !imgErr ? (
          <img
            src={prod.imagen_referencial}
            alt={prod.nombre}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgErr(true)}
          />
        ) : null}
        <div
          className="carta__prod-img-placeholder"
          style={{ display: prod.imagen_referencial && !imgErr ? "none" : "flex" }}
        >
          🍽
        </div>
      </div>

      <div className="carta__prod-body">
        {prod.etiquetas?.length > 0 && (
          <div className="carta__prod-tags">
            {prod.etiquetas.map((e, i) => (
              <span
                key={i}
                className="carta__tag"
                style={{
                  background: `${e.color_etiqueta}22`,
                  color: e.color_etiqueta,
                  border: `1px solid ${e.color_etiqueta}`,
                }}
              >
                {e.nombre}
              </span>
            ))}
          </div>
        )}

        <h3 className="carta__prod-name">{prod.nombre}</h3>

        {prod.descripcion && (
          <p className="carta__prod-desc">{prod.descripcion}</p>
        )}

        <div className="carta__prod-footer">
          <span className="carta__prod-price">
            {simbolo} {Number(prod.precio_base).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}