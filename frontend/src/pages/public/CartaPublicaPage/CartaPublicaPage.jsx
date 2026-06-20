// src/pages/public/CartaPublicaPage/CartaPublicaPage.jsx

import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import "./CartaPublicaPage.css"
import logoUmari from "../../../assets/icons/logo-umari-black.svg"

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
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
)

const IconFolder = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

export default function CartaPublicaPage() {
  const { slug } = useParams()

  const [establecimiento, setEstablecimiento] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [catActiva, setCatActiva] = useState("all")
  const [busqueda, setBusqueda] = useState("")

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
      })
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


  if (loading) return (
    <div className="carta cpub">
      <div className="cpub__main">
        <div className="carta__grid">
          {[1,2,3,4,5,6].map(i => (
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
    <div className="carta cpub">
      <div className="carta__empty" style={{ minHeight: "100vh" }}>
        <IconFolder />
        <p>{error}</p>
      </div>
    </div>
  )

  return (
    <div className="carta cpub">
      <div className="cpub__main">
        

        {/* HEADER PÚBLICO */}
        <header className="cpub__header">
          
          {/* LOGO DE BRAND EN LA PARTE SUPERIOR */}
          <div className="cpub__header-top">
            <img src={logoUmari} alt="Umari" className="cpub__header-brand" />
          </div>

          <div className="cpub__header-content">
            {/* LADO IZQUIERDO */}
            <div className="cpub__header-left">
              <h1 className="cpub__title">Nuestra carta</h1>
              <p className="cpub__subtitle">Descubre nuestros mejores platos y bebidas</p>
            </div>

            {/* LADO DERECHO */}
            <div className="cpub__header-right">
              <div className="cpub__est-logo-frame">
                {establecimiento?.logo_url ? (
                  <img
                    src={establecimiento.logo_url}
                    alt={establecimiento.nombre_comercial}
                    className="cpub__est-logo"
                  />
                ) : (
                  <div className="cpub__est-logo-placeholder">
                    {establecimiento?.nombre_comercial?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              
              <div className="cpub__est-info">
                <h2 className="cpub__est-name">
                  Restaurante {establecimiento?.nombre_comercial}
                </h2>
                <div className="cpub__est-badge-container">
                  <span className="cpub__est-badge">
                    Carta digital
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </header>

        {/* BUSCADOR */}
        <div className="carta__search-wrap">
          <IconSearch />
          <input
            className="carta__search"
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setCatActiva("all") }}
          />
        </div>

        {/* TABS DE CATEGORÍAS */}
        <div className="carta__cat-tabs">
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
                {catActiva === "all" && cat.productos.length > 6 && (
                  <button
                    className="cpub__ver-mas"
                    onClick={() => handleTabClick(cat.id_categoria)}
                  >
                    Ver más {cat.nombre.toLowerCase()}
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

        <footer className="cpub__footer">
          <p>Gracias por preferirnos ❤️</p>
        </footer>

      </div>
    </div>
  )
}

function ProductoCard({ prod, simbolo }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className={`carta__prod-card ${prod.estado && !prod.disponibilidad ? "carta__prod-card--agotado" : ""}`}>
      <div className="carta__prod-img">
        {prod.imagen_referencial && !imgErr ? (
          <img
            src={prod.imagen_referencial}
            alt={prod.nombre}
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : null}
        
        <div
          className="carta__prod-img-placeholder"
          style={{ display: prod.imagen_referencial && !imgErr ? "none" : "flex" }}
        >
          🍽
        </div>
        
        {prod.estado && !prod.disponibilidad && (
          <div className="carta__prod-overlay carta__prod-overlay--agotado">
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Agotado
            </span>
            <p className="carta__prod-overlay-text">No disponible temporalmente</p>
          </div>
        )}
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