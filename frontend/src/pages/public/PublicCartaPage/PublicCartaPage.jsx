// frontend/src/pages/public/PublicCartaPage/PublicCartaPage.jsx

import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { getPublicCarta } from "../../../services/publicCartaService"

import "./PublicCartaPage.css"

function formatPrice(value, currencySymbol = "S/.") {
  const numericValue = Number(value || 0)

  return `${currencySymbol} ${numericValue.toFixed(2)}`
}

export default function PublicCartaPage() {
  const { public_identifier, tenant_slug, id_establecimiento } = useParams()
  const cartaIdentifier = public_identifier || tenant_slug || id_establecimiento

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadCarta() {
      await Promise.resolve()

      if (!isMounted) return

      setIsLoading(true)
      setErrorMessage("")
      setData(null)

      if (!cartaIdentifier) {
        setErrorMessage("El establecimiento es requerido.")
        setIsLoading(false)
        return
      }

      try {
        const cartaData = await getPublicCarta(cartaIdentifier)

        if (isMounted) {
          setData(cartaData)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "No se pudo cargar la carta.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCarta()

    return () => {
      isMounted = false
    }
  }, [cartaIdentifier])

  const establecimiento = data?.establecimiento
  const categorias = useMemo(() => data?.categorias || [], [data])
  const monedaSimbolo = establecimiento?.moneda_simbolo || "S/."

  if (isLoading) {
    return (
      <main className="public-carta">
        <section className="public-carta__state">
          <div className="public-carta__loader" aria-hidden="true" />
          <p>Cargando carta...</p>
        </section>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="public-carta">
        <section className="public-carta__state">
          <h1>No se pudo cargar la carta</h1>
          <p>{errorMessage}</p>

          <Link to="/" className="public-carta__link">
            Volver al inicio
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="public-carta">
      <section className="public-carta__hero">
        <p className="public-carta__eyebrow">Carta digital</p>

        <h1>{establecimiento?.nombre_comercial || "Restaurante"}</h1>

        <p className="public-carta__subtitle">
          Explora las categorías y productos disponibles.
        </p>
      </section>

      <section className="public-carta__content">
        {categorias.length === 0 ? (
          <div className="public-carta__empty">
            <h2>Carta no disponible</h2>
            <p>Este establecimiento todavía no tiene productos visibles.</p>
          </div>
        ) : (
          categorias.map((categoria) => {
            const productos = categoria.productos || []

            return (
              <article
                className="public-carta__category"
                key={categoria.id_categoria}
              >
                <div className="public-carta__category-header">
                  <h2>{categoria.nombre}</h2>
                  {categoria.descripcion && <p>{categoria.descripcion}</p>}
                </div>

                {productos.length === 0 ? (
                  <div className="public-carta__category-empty">
                    <p>No hay productos disponibles en esta categoría.</p>
                  </div>
                ) : (
                  <div className="public-carta__products">
                    {productos.map((producto) => (
                      <article
                        className="public-carta__product"
                        key={producto.id_producto}
                      >
                        {producto.imagen_referencial && (
                          <img
                            className="public-carta__product-image"
                            src={producto.imagen_referencial}
                            alt={producto.nombre}
                            loading="lazy"
                          />
                        )}

                        <div className="public-carta__product-body">
                          <div className="public-carta__product-main">
                            <h3>{producto.nombre}</h3>
                            {producto.descripcion && (
                              <p>{producto.descripcion}</p>
                            )}
                          </div>

                          <strong className="public-carta__price">
                            {formatPrice(producto.precio_base, monedaSimbolo)}
                          </strong>

                          {producto.etiquetas?.length > 0 && (
                            <div className="public-carta__tags">
                              {producto.etiquetas.map((etiqueta) => (
                                <span key={etiqueta.nombre}>
                                  {etiqueta.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
