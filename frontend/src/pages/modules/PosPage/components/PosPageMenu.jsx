// src/pages/modules/PosPage/components/PosPageMenu.jsx

import { useState } from "react"

import "./PosPageMenu.css"

export default function PosPageMenu({
  selectedTable,
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  setSelectedTable,
  orderItems,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  handleAddProduct,
  handleSendToKitchen,
  handleSendToCashier,
  searchTerm,
  setSearchTerm,
  orderNotes,
  handleUpdateOrderNotes,
}) {

  const [productQuantities, setProductQuantities] =
    useState({})

  // TOTAL

  const total = orderItems.reduce(
    (accumulator, item) =>
      accumulator + (item.price * item.quantity),
    0,
  )

  function getTempQuantity(productId) {

    return productQuantities[productId] || 1
  }

  function increaseTempQuantity(productId) {

    setProductQuantities((prev) => ({

      ...prev,

      [productId]:
        (prev[productId] || 1) + 1,
    }))
  }

  function decreaseTempQuantity(productId) {

    setProductQuantities((prev) => ({

      ...prev,

      [productId]:
        (prev[productId] || 1) - 1 < 1
          ? 1
          : (prev[productId] || 1) - 1,
    }))
  }


  function handleProductAdd(product) {

    const quantityToAdd =
      productQuantities[product.id] || 1

    handleAddProduct(
      product,
      quantityToAdd,
    )

    setProductQuantities((prev) => ({

      ...prev,

      [product.id]: 1,
    }))
  }


  return (

    <section className="pos-menu">

      <div className="pos-menu-content">

        <header className="pos-menu-topbar">

          <div>

            <h2>
              Mesa {selectedTable.number}
            </h2>

          </div>

          <div className="pos-menu-search">

            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

          </div>

        </header>

        <div className="pos-menu-categories">

          {categories.map((category) => (

            <button
              key={category}

              className={
                selectedCategory === category
                  ? "pos-category pos-category--active"
                  : "pos-category"
              }

              onClick={() =>
                setSelectedCategory(category)
              }
            >

              {category}

            </button>

          ))}

        </div>

        <div className="pos-products-grid">

          {products.map((product) => (

            <article
              key={product.id}
              className="pos-product-card"
            >
              <div className="pos-product-emoji">

                {product.emoji}

              </div>

              <div className="pos-product-info">

                <div className="pos-product-header">

                  <h3>
                    {product.name}
                  </h3>

                  <span>
                    S/ {product.price.toFixed(2)}
                  </span>

                </div>

                <small>
                  {product.category}
                </small>

              </div>

              <div className="pos-product-actions">

                <div className="pos-product-quantity">

                  <button
                    type="button"

                    onClick={() =>
                      decreaseTempQuantity(product.id)
                    }
                  >
                    −
                  </button>

                  <span>

                    {getTempQuantity(product.id)}

                  </span>

                  <button
                    type="button"

                    onClick={() =>
                      increaseTempQuantity(product.id)
                    }
                  >
                    +
                  </button>

                </div>



                <button
                  className="pos-product-button"

                  onClick={() =>
                    handleProductAdd(product)
                  }
                >
                  Agregar
                </button>

              </div>

            </article>

          ))}

        </div>

      </div>

      <aside className="pos-order-panel">

        <div className="pos-order-header">

          <div>

            <p className="pos-order-subtitle">
              Pedido actual
            </p>

            <h3>
              Mesa {selectedTable.number}
            </h3>

          </div>

          <div>

            <button
              className="pos-back-button"

              onClick={() =>
                setSelectedTable(null)
              }
            >
              Regresar
            </button>

          </div>

        </div>

        {orderItems.length === 0 ? (

          <div className="pos-order-empty">

            <p>
              Todavía no agregaste productos
            </p>

          </div>

        ) : (

          <div className="pos-order-items">

            {orderItems.map((item) => {

              const alreadySent =
                item.sentQuantity > 0

              const pendingQuantity =
                item.quantity - item.sentQuantity

              return (

                <article
                  key={item.id}
                  className="pos-order-item"
                >

                  <div className="pos-order-item-main">

                    <div className="pos-order-item-info">

                      <h4 title={item.name}>
                        {item.name}
                      </h4>

                      <div className="pos-order-meta">

                        <small>
                          Cantidad: {item.quantity}
                        </small>

                        {alreadySent && (

                          <small className="pos-item-status">

                            Enviado: {item.sentQuantity}

                            {pendingQuantity > 0 && (
                              <>
                                {" "}• Pendiente: {pendingQuantity}
                              </>
                            )}

                          </small>

                        )}

                      </div>

                    </div>

                    <strong>

                      S/ {(item.price * item.quantity).toFixed(2)}

                    </strong>

                  </div>

                  <div className="pos-order-item-actions">

                    <div className="pos-quantity-controls">

                      <button
                        onClick={() =>
                          handleDecreaseQuantity(item.id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleIncreaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                </article>
              )
            })}

            <div className="pos-order-notes">

              <label>
                Notas del pedido
              </label>

              <textarea
                className="pos-order-notes-input"

                placeholder="Ej: 1 lomo sin cebolla..."

                value={orderNotes}

                onChange={(event) =>
                  handleUpdateOrderNotes(
                    event.target.value,
                  )
                }
              />

            </div>

          </div>

        )}


        <div className="pos-order-summary">

          <div className="pos-order-row">

            <span>
              Total
            </span>

            <strong>
              S/ {total.toFixed(2)}
            </strong>

          </div>

        </div>

        <div className="pos-order-actions">

          <button
            className="pos-send-button"
            onClick={handleSendToKitchen}
          >

            Enviar a cocina

          </button>

          <button
            className="pos-payment-button"
            onClick={handleSendToCashier}
          >

            Enviar a caja

          </button>

        </div>

      </aside>

    </section>
  )
}