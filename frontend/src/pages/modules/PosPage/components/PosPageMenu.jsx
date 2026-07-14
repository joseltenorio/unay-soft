// src/pages/modules/PosPage/components/PosPageMenu.jsx

import { useMemo, useState } from "react"

import "./PosPageMenu.css"

const ORDER_STATUS_LABELS = {
  ABIERTA: "Nueva",
  EN_PREPARACION: "En preparación",
  LISTA: "Lista",
  ENTREGADA: "Entregada",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
}

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function formatShortOrderNumber(orderNumber) {
  const match = String(orderNumber || "").match(/(\d{4})$/)

  if (match) {
    return `#${match[1]}`
  }

  return orderNumber || "#----"
}

function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status || "Sin estado"
}

function getOrderStatusClass(status) {
  return `pos-active-order-status pos-active-order-status--${String(
    status || "UNKNOWN",
  ).toLowerCase()}`
}

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
  handleUpdateItemNotes,
  isSendingToKitchen = false,
  activeOrders = [],
  activeOrderCount = 0,
  activeTotal = 0,
  isSupportOrder = false,
  supportOrderMessage = "",
  isAccountLocked = false,
}) {
  const [productQuantities, setProductQuantities] = useState({})

  const total = orderItems.reduce(
    (accumulator, item) => accumulator + (item.price * item.quantity),
    0,
  )

  const hasPendingItems = orderItems.some(
    (item) => item.quantity > item.sentQuantity,
  )

  const activeSummary = useMemo(() => {
    return activeOrders.reduce(
      (summary, order) => {
        const status = order.estado || "SIN_ESTADO"

        return {
          ...summary,
          [status]: (summary[status] || 0) + 1,
        }
      },
      {},
    )
  }, [activeOrders])

  function getTempQuantity(productId) {
    return productQuantities[productId] || 1
  }

  function increaseTempQuantity(productId) {
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }))
  }

  function decreaseTempQuantity(productId) {
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) - 1 < 1
        ? 1
        : (prev[productId] || 1) - 1,
    }))
  }

  function handleProductAdd(product) {
    const quantityToAdd = productQuantities[product.id] || 1

    handleAddProduct(product, quantityToAdd)

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
            <h2>Mesa {selectedTable.number}</h2>
          </div>

          <div className="pos-menu-search">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </header>

        <div className="pos-menu-categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                selectedCategory === category
                  ? "pos-category pos-category--active"
                  : "pos-category"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="pos-products-grid">
          {products.map((product) => (
            <article key={product.id} className="pos-product-card">
              <div className="pos-product-emoji">
                {product.emoji}
              </div>

              <div className="pos-product-info">
                <div className="pos-product-header">
                  <h3 title={product.name}>
                    {product.name}
                  </h3>

                  <span>
                    {formatCurrency(product.price)}
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
                    onClick={() => decreaseTempQuantity(product.id)}
                    disabled={isAccountLocked}
                  >
                    −
                  </button>

                  <span>
                    {getTempQuantity(product.id)}
                  </span>

                  <button
                    type="button"
                    onClick={() => increaseTempQuantity(product.id)}
                    disabled={isAccountLocked}
                  >
                    +
                  </button>
                </div>

                <button
                  className="pos-product-button"
                  type="button"
                  onClick={() => handleProductAdd(product)}
                  disabled={isAccountLocked}
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

            {isAccountLocked && (
              <span className="pos-account-locked-badge">
                En caja — no editable
              </span>
            )}
          </div>

          <div>
            <button
              className="pos-back-button"
              type="button"
              onClick={() => setSelectedTable(null)}
            >
              Regresar
            </button>
          </div>
        </div>

        {isSupportOrder && supportOrderMessage && (
          <div className="pos-support-warning" role="status">
            <strong>Comanda de apoyo</strong>
            <p>{supportOrderMessage}</p>
          </div>
        )}

        {orderItems.length === 0 ? (
          <div className="pos-order-empty">
            <p>
              🍽️ Todavía no agregaste productos
            </p>
          </div>
        ) : (
          <div className="pos-order-items">
            {orderItems.map((item) => {
              const alreadySent = item.sentQuantity > 0
              const pendingQuantity = item.quantity - item.sentQuantity

              return (
                <article key={item.id} className="pos-order-item">
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

                     {(() => {
                        const entregado = (item.sentBatches || []).reduce(
                          (total, batch) =>
                            batch.estadoCocina === "ENTREGADO"
                              ? total + batch.quantity
                              : total,
                          0,
                        )

                        if (entregado === 0) {
                          return null
                        }

                        return (
                          <div className="pos-item-kitchen-badges">
                            <span className="pos-item-badge pos-item-badge--delivered">
                              Entregado: {entregado}
                            </span>
                          </div>
                        )
                      })()}

                      <label className="pos-order-item-note">
                        <span>Nota para cocina</span>
                        <textarea
                          value={item.kitchenNotes || ""}
                          onChange={(event) =>
                            handleUpdateItemNotes(item.id, event.target.value)
                          }
                          placeholder="Ej: sin cebolla, poco picante..."
                          disabled={pendingQuantity <= 0}
                        />
                      </label>
                    </div>

                    <strong>
                      {formatCurrency(item.price * item.quantity)}
                    </strong>
                  </div>

                  <div className="pos-order-item-actions">
                    <div className="pos-quantity-controls">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQuantity(item.id)}
                        disabled={isAccountLocked}
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleIncreaseQuantity(item.id)}
                        disabled={isAccountLocked}
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
                Observación general
              </label>

              <textarea
                className="pos-order-notes-input"
                placeholder="Ej: cliente apurado, servir todo junto..."
                value={orderNotes}
                onChange={(event) =>
                  handleUpdateOrderNotes(event.target.value)
                }
              />
            </div>
          </div>
        )}

        <div className="pos-order-summary">
          <div className="pos-order-row">
            <span>
              Total pedido actual
            </span>

            <strong>
              {formatCurrency(total)}
            </strong>
          </div>
        </div>

        <div className="pos-order-actions">
          <button
            className="pos-send-button"
            type="button"
            onClick={handleSendToKitchen}
            disabled={isSendingToKitchen || !hasPendingItems || isAccountLocked}
          >
            {isSendingToKitchen ? "Enviando..." : "Enviar a cocina"}
          </button>

          <button
            className="pos-payment-button"
            type="button"
            onClick={handleSendToCashier}
            disabled={isAccountLocked}
          >
            {isAccountLocked ? "Ya enviado a caja" : "Enviar a caja"}
          </button>
        </div>      
      </aside>
    </section>
  )
}