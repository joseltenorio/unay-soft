// frontend/src/pages/modules/PosPage/PosPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Utensils,
} from "lucide-react"

import {
  getCurrentPermissions,
  getCurrentUser,
} from "../../../services/authService"

import {
  getPosMenu,
  getPosTables,
} from "../../../services/posService"

import PosPageTables from "./components/PosPageTables"
import PosPageMenu from "./components/PosPageMenu"

import useToast from "../../../components/common/Toast/useToast"

import {
  attendKitchenServiceCall,
  confirmKitchenOrderDelivery,
  getKitchenServiceCalls,
  SERVICE_NOTIFICATION_STATUS,
  SERVICE_NOTIFICATION_TYPES,
} from "../../../services/kdsService"

import { hasPermission } from "../../../utils/permission"

import "./PosPage.css"

const POS_TABS = {
  SALE: "sale",
  KITCHEN_NOTICES: "kitchen-notices",
}

const POLLING_INTERVAL_MS = 15000

function formatDateTime(value) {
  if (!value) {
    return "Sin hora"
  }

  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value))
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function getUserDisplayName(user) {
  const fullName = [
    user?.nombres,
    user?.apellidos,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  return (
    fullName ||
    user?.nombre ||
    user?.username ||
    user?.email ||
    "Mesero"
  )
}

function getNotificationTypeLabel(type) {
  if (type === SERVICE_NOTIFICATION_TYPES.READY_ORDER) {
    return "Pedido listo"
  }

  if (type === SERVICE_NOTIFICATION_TYPES.KITCHEN_INCIDENT) {
    return "Incidencia de cocina"
  }

  return "Aviso de cocina"
}

function getOrderTitle(notification) {
  const orderNumber = notification.orden?.numero_orden
  const tableName = notification.mesa?.nombre
  const tableNumber = notification.mesa?.numero

  const tableLabel =
    tableName || (tableNumber ? `Mesa ${tableNumber}` : "Sin mesa")

  return orderNumber ? `Orden ${orderNumber} · ${tableLabel}` : tableLabel
}

function KitchenNoticeCard({
  notification,
  canAttendNotices,
  canConfirmDelivery,
  attendingId,
  deliveringOrderId,
  onAttend,
  onConfirmDelivery,
}) {
  const isReadyOrder = notification.tipo === SERVICE_NOTIFICATION_TYPES.READY_ORDER
  const isAttending = attendingId === notification.id_notificacion
  const isDelivering = deliveringOrderId === notification.id_orden

  return (
    <article className="pos-notice-card">
      <div className="pos-notice-card__icon" aria-hidden="true">
        {notification.tipo === SERVICE_NOTIFICATION_TYPES.KITCHEN_INCIDENT ? (
          <AlertTriangle size={21} strokeWidth={2.3} />
        ) : (
          <Utensils size={21} strokeWidth={2.3} />
        )}
      </div>

      <div className="pos-notice-card__content">
        <header className="pos-notice-card__header">
          <div>
            <p className="pos-notice-card__type">
              {getNotificationTypeLabel(notification.tipo)}
            </p>

            <h3>{getOrderTitle(notification)}</h3>
          </div>

          <span className="pos-notice-card__time">
            {formatDateTime(notification.created_at)}
          </span>
        </header>

        {(notification.motivo || notification.mensaje) && (
          <div className="pos-notice-card__message">
            {notification.motivo && <strong>{notification.motivo}</strong>}
            {notification.mensaje && <p>{notification.mensaje}</p>}
          </div>
        )}

        {notification.items?.length > 0 && (
          <ul className="pos-notice-card__items">
            {notification.items.map((item) => (
              <li key={item.id_item_orden}>
                <span>
                  {item.cantidad}× {item.producto_nombre}
                </span>

                {item.notas_cocina && <small>{item.notas_cocina}</small>}
              </li>
            ))}
          </ul>
        )}

        <footer className="pos-notice-card__actions">
          {canAttendNotices && (
            <button
              className="pos-notice-card__button pos-notice-card__button--secondary"
              type="button"
              onClick={() => onAttend(notification.id_notificacion)}
              disabled={isAttending || isDelivering}
            >
              {isAttending ? "Atendiendo..." : "Atender aviso"}
            </button>
          )}

          {isReadyOrder && canConfirmDelivery && (
            <button
              className="pos-notice-card__button pos-notice-card__button--primary"
              type="button"
              onClick={() => onConfirmDelivery(notification.id_orden)}
              disabled={isAttending || isDelivering}
            >
              {isDelivering ? "Confirmando..." : "Confirmar entrega"}
            </button>
          )}
        </footer>
      </div>
    </article>
  )
}

export default function PosPage() {
  const { showToast } = useToast()

  const permissions = useMemo(() => getCurrentPermissions(), [])
  const currentUser = useMemo(() => getCurrentUser(), [])
  const currentWaiter = useMemo(
    () => getUserDisplayName(currentUser),
    [currentUser],
  )

  const canViewKitchenNotices = hasPermission(
    permissions,
    "pos.ver_avisos_cocina",
  )

  const canAttendKitchenNotices = hasPermission(
    permissions,
    "pos.atender_avisos_cocina",
  )

  const canConfirmDelivery = hasPermission(
    permissions,
    "pos.confirmar_entrega",
  )

  const [activeTab, setActiveTab] = useState(
    canViewKitchenNotices ? POS_TABS.KITCHEN_NOTICES : POS_TABS.SALE,
  )

  const [selectedTable, setSelectedTable] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")

  const [tablesState, setTablesState] = useState([])
  const [menuProducts, setMenuProducts] = useState([])
  const [categories, setCategories] = useState(["Todos"])

  const [isLoadingSaleData, setIsLoadingSaleData] = useState(true)
  const [saleDataError, setSaleDataError] = useState("")

  const [tableOrders, setTableOrders] = useState({})
  const [savedOrders, setSavedOrders] = useState({})
  const [orderNotes, setOrderNotes] = useState({})

  const [notifications, setNotifications] = useState([])
  const [isLoadingNotices, setIsLoadingNotices] = useState(false)
  const [isRefreshingNotices, setIsRefreshingNotices] = useState(false)
  const [attendingId, setAttendingId] = useState("")
  const [deliveringOrderId, setDeliveringOrderId] = useState("")
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const orderItems = selectedTable
    ? tableOrders[selectedTable.id] || []
    : []

  const pendingReadyOrders = notifications.filter(
    (notification) => notification.tipo === SERVICE_NOTIFICATION_TYPES.READY_ORDER,
  ).length

  const pendingIncidents = notifications.filter(
    (notification) =>
      notification.tipo === SERVICE_NOTIFICATION_TYPES.KITCHEN_INCIDENT,
  ).length

  const floors = useMemo(() => {
    const uniqueFloors = [
      ...new Set(
        tablesState.map((table) => table.floor || "Sin zona"),
      ),
    ]

    return uniqueFloors.length > 0 ? uniqueFloors : ["Sin zona"]
  }, [tablesState])

  const selectedFloorToRender = floors.includes(selectedFloor)
    ? selectedFloor
    : floors[0]

  const filteredTables = useMemo(() => {
    return tablesState.filter(
      (table) => (table.floor || "Sin zona") === selectedFloorToRender,
    )
  }, [tablesState, selectedFloorToRender])

  const selectedCategoryToRender = categories.includes(selectedCategory)
    ? selectedCategory
    : "Todos"

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return menuProducts.filter((product) => {
      const matchesCategory =
        selectedCategoryToRender === "Todos"
          ? true
          : product.category === selectedCategoryToRender

      const matchesSearch = normalizeText(product.name).includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [menuProducts, searchTerm, selectedCategoryToRender])

  useEffect(() => {
    let isMounted = true

    async function loadSaleData() {
      try {
        const [tables, menu] = await Promise.all([
          getPosTables(),
          getPosMenu(),
        ])

        if (!isMounted) return

        setTablesState(tables)
        setMenuProducts(menu.products)
        setCategories(menu.categories)
        setSaleDataError("")
      } catch (error) {
        if (!isMounted) return

        setSaleDataError(error.message || "Error al cargar datos de POS.")

        showToast({
          type: "error",
          title: "Error al cargar POS",
          message: error.message || "No se pudieron obtener mesas y productos.",
        })
      } finally {
        if (isMounted) {
          setIsLoadingSaleData(false)
        }
      }
    }

    loadSaleData()

    return () => {
      isMounted = false
    }
  }, [showToast])

  const loadKitchenNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!canViewKitchenNotices) {
        return
      }

      try {
        if (silent) {
          setIsRefreshingNotices(true)
        } else {
          setIsLoadingNotices(true)
        }

        const data = await getKitchenServiceCalls(
          SERVICE_NOTIFICATION_STATUS.PENDING,
        )

        setNotifications(data)
        setLastUpdatedAt(new Date())
      } catch (error) {
        showToast({
          type: "error",
          title: "No se pudieron cargar los avisos",
          message: error.message || "Ocurrió un error al consultar cocina.",
        })
      } finally {
        setIsLoadingNotices(false)
        setIsRefreshingNotices(false)
      }
    },
    [canViewKitchenNotices, showToast],
  )

  useEffect(() => {
    if (!canViewKitchenNotices) {
      return undefined
    }

    const initialLoadId = window.setTimeout(() => {
      loadKitchenNotifications()
    }, 0)

    const intervalId = window.setInterval(() => {
      loadKitchenNotifications({ silent: true })
    }, POLLING_INTERVAL_MS)

    return () => {
      window.clearTimeout(initialLoadId)
      window.clearInterval(intervalId)
    }
  }, [canViewKitchenNotices, loadKitchenNotifications])

  async function handleAttendNotice(idNotification) {
    if (!canAttendKitchenNotices || attendingId) {
      return
    }

    try {
      setAttendingId(idNotification)

      await attendKitchenServiceCall(idNotification)

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification.id_notificacion !== idNotification,
        ),
      )

      showToast({
        type: "success",
        title: "Aviso atendido",
        message: "El aviso de cocina fue marcado como atendido.",
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo atender el aviso",
        message: error.message || "Intenta nuevamente.",
      })
    } finally {
      setAttendingId("")
    }
  }

  async function handleConfirmDelivery(idOrder) {
    if (!canConfirmDelivery || deliveringOrderId) {
      return
    }

    try {
      setDeliveringOrderId(idOrder)

      await confirmKitchenOrderDelivery(idOrder)

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification.id_orden !== idOrder,
        ),
      )

      showToast({
        type: "success",
        title: "Entrega confirmada",
        message: "La orden fue marcada como entregada.",
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo confirmar la entrega",
        message: error.message || "Verifica que la orden siga lista.",
      })
    } finally {
      setDeliveringOrderId("")
    }
  }

  function handleTableClick(table) {
    if (
      table.disponibilidad === "RESERVADA" ||
      table.disponibilidad === "MANTENIMIENTO"
    ) {
      showToast({
        type: "warning",
        title: "Mesa no disponible",
        message: `La mesa ${table.number} no está disponible para tomar pedidos.`,
      })

      return
    }

    setSelectedTable(table)

    if (savedOrders[table.id]) {
      setTableOrders((prev) => ({
        ...prev,
        [table.id]: savedOrders[table.id],
      }))
    }
  }

  function handleAddProduct(product, quantityToAdd = 1) {
    if (!selectedTable || quantityToAdd < 1) {
      return
    }

    setTableOrders((prev) => {
      const currentOrder = prev[selectedTable.id] || []

      const existingProduct = currentOrder.find(
        (item) => item.id === product.id,
      )

      if (existingProduct) {
        return {
          ...prev,
          [selectedTable.id]: currentOrder.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantityToAdd,
                }
              : item,
          ),
        }
      }

      return {
        ...prev,
        [selectedTable.id]: [
          ...currentOrder,
          {
            id: product.id,
            id_producto: product.id_producto || product.id,
            category: product.category,
            name: product.name,
            price: product.price,
            emoji: product.emoji || "🍽️",
            quantity: quantityToAdd,
            sentQuantity: 0,
            kitchenReady: false,
          },
        ],
      }
    })
  }

  function handleIncreaseQuantity(productId) {
    if (!selectedTable) {
      return
    }

    setTableOrders((prev) => {
      const currentOrder = prev[selectedTable.id] || []

      return {
        ...prev,
        [selectedTable.id]: currentOrder.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        ),
      }
    })
  }

  function handleDecreaseQuantity(productId) {
    if (!selectedTable) {
      return
    }

    setTableOrders((prev) => {
      const currentOrder = prev[selectedTable.id] || []

      const updatedItems = currentOrder
        .map((item) => {
          if (item.id !== productId) {
            return item
          }

          const pendingQuantity = item.quantity - item.sentQuantity

          if (pendingQuantity > 0) {
            return {
              ...item,
              quantity: item.quantity - 1,
            }
          }

          if (item.sentQuantity > 0) {
            if (item.kitchenReady) {
              showToast({
                type: "warning",
                title: "Producto ya preparado",
                message: `${item.name} ya fue preparado por cocina.`,
              })

              return item
            }

            const confirmCancel = window.confirm(
              `¿Deseas cancelar 1 ${item.name} enviado a cocina?`,
            )

            if (!confirmCancel) {
              return item
            }

            return {
              ...item,
              quantity: item.quantity - 1,
              sentQuantity: item.sentQuantity - 1,
            }
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          }
        })
        .filter((item) => item.quantity > 0)

      setSavedOrders((currentSavedOrders) => ({
        ...currentSavedOrders,
        [selectedTable.id]: updatedItems,
      }))

      return {
        ...prev,
        [selectedTable.id]: updatedItems,
      }
    })
  }

  function handleSendToKitchen() {
    if (!selectedTable) {
      return
    }

    if (orderItems.length === 0) {
      showToast({
        type: "warning",
        title: "Pedido vacío",
        message: "Agrega al menos un producto antes de enviar a cocina.",
      })

      return
    }

    const newItems = orderItems
      .map((item) => {
        const quantityToSend = item.quantity - item.sentQuantity

        if (quantityToSend <= 0) {
          return null
        }

        return {
          ...item,
          quantity: quantityToSend,
        }
      })
      .filter(Boolean)

    if (newItems.length === 0) {
      showToast({
        type: "info",
        title: "Sin productos nuevos",
        message: "Todos los productos de esta mesa ya fueron enviados a cocina.",
      })

      return
    }

    setTablesState((prev) =>
      prev.map((table) =>
        table.id === selectedTable.id
          ? {
              ...table,
              occupied: true,
              waiter: currentWaiter,
              time: "Ahora",
              disponibilidad: "OCUPADA",
            }
          : table,
      ),
    )

    setSelectedTable((prev) =>
      prev
        ? {
            ...prev,
            occupied: true,
            waiter: currentWaiter,
            time: "Ahora",
            disponibilidad: "OCUPADA",
          }
        : prev,
    )

    const updatedItems = orderItems.map((item) => ({
      ...item,
      sentQuantity: item.quantity,
    }))

    setTableOrders((prev) => ({
      ...prev,
      [selectedTable.id]: updatedItems,
    }))

    setSavedOrders((prev) => ({
      ...prev,
      [selectedTable.id]: updatedItems,
    }))

    setOrderNotes((prev) => ({
      ...prev,
      [selectedTable.id]: "",
    }))

    showToast({
      type: "success",
      title: "Pedido preparado para envío",
      message: `Pedido de mesa ${selectedTable.number} actualizado localmente. El envío real se conectará en el siguiente commit.`,
    })
  }

  function handleSendToCashier() {
    if (!selectedTable) {
      return
    }

    const alreadySentToKitchen = orderItems.some(
      (item) => item.sentQuantity > 0,
    )

    if (!alreadySentToKitchen) {
      showToast({
        type: "warning",
        title: "Pedido pendiente",
        message: "Primero debes enviar el pedido a cocina.",
      })

      return
    }

    const confirmSend = window.confirm(
      `¿Estás seguro de enviar la mesa ${selectedTable.number} a caja?`,
    )

    if (!confirmSend) {
      return
    }

    setTableOrders((prev) => ({
      ...prev,
      [selectedTable.id]: [],
    }))

    setSavedOrders((prev) => ({
      ...prev,
      [selectedTable.id]: [],
    }))

    setOrderNotes((prev) => ({
      ...prev,
      [selectedTable.id]: "",
    }))

    setTablesState((prev) =>
      prev.map((table) =>
        table.id === selectedTable.id
          ? {
              ...table,
              occupied: false,
              waiter: null,
              time: null,
              disponibilidad: "LIBRE",
            }
          : table,
      ),
    )

    showToast({
      type: "success",
      title: "Mesa enviada a caja",
      message: `Mesa ${selectedTable.number} enviada a caja localmente.`,
    })

    setSelectedTable(null)
  }

  function handleUpdateOrderNotes(notes) {
    if (!selectedTable) {
      return
    }

    setOrderNotes((prev) => ({
      ...prev,
      [selectedTable.id]: notes,
    }))
  }

  return (
    <main className="pos-page">
      <section className="pos-page__shell">
        <header className="pos-page__header">
          <div>
            <p className="pos-page__eyebrow">POS / Salón</p>
            <h1>Gestión de Salón</h1>
            <p>
              Vista operativa para venta y atención de avisos enviados desde
              cocina.
            </p>
          </div>

          <div className="pos-page__summary" aria-label="Resumen de avisos">
            <div>
              <span>Pedidos listos</span>
              <strong>{pendingReadyOrders}</strong>
            </div>

            <div>
              <span>Incidencias</span>
              <strong>{pendingIncidents}</strong>
            </div>
          </div>
        </header>

        <nav className="pos-tabs" aria-label="Pestañas de POS">
          <button
            className={`pos-tabs__button ${
              activeTab === POS_TABS.SALE ? "pos-tabs__button--active" : ""
            }`}
            type="button"
            onClick={() => setActiveTab(POS_TABS.SALE)}
          >
            <ClipboardList size={18} strokeWidth={2.2} />
            Venta
          </button>

          {canViewKitchenNotices && (
            <button
              className={`pos-tabs__button ${
                activeTab === POS_TABS.KITCHEN_NOTICES
                  ? "pos-tabs__button--active"
                  : ""
              }`}
              type="button"
              onClick={() => setActiveTab(POS_TABS.KITCHEN_NOTICES)}
            >
              <Bell size={18} strokeWidth={2.2} />
              Avisos de cocina
              {notifications.length > 0 && (
                <span className="pos-tabs__badge">{notifications.length}</span>
              )}
            </button>
          )}
        </nav>

        {activeTab === POS_TABS.SALE && (
          <section className="pos-sale-panel">
            {isLoadingSaleData ? (
              <div className="pos-notices-state">
                <span className="pos-notices-state__spinner" aria-hidden="true" />
                <p>Cargando mesas y carta...</p>
              </div>
            ) : saleDataError ? (
              <div className="pos-notices-empty">
                <AlertTriangle size={32} strokeWidth={2.1} />
                <h3>No se pudo cargar POS</h3>
                <p>{saleDataError}</p>
              </div>
            ) : !selectedTable ? (
              <PosPageTables
                tables={filteredTables}
                onTableClick={handleTableClick}
                floors={floors}
                selectedFloor={selectedFloorToRender}
                setSelectedFloor={setSelectedFloor}
              />
            ) : (
              <PosPageMenu
                selectedTable={selectedTable}
                products={filteredProducts}
                categories={categories}
                selectedCategory={selectedCategoryToRender}
                setSelectedCategory={setSelectedCategory}
                setSelectedTable={setSelectedTable}
                orderItems={orderItems}
                handleAddProduct={handleAddProduct}
                handleIncreaseQuantity={handleIncreaseQuantity}
                handleDecreaseQuantity={handleDecreaseQuantity}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSendToKitchen={handleSendToKitchen}
                handleSendToCashier={handleSendToCashier}
                orderNotes={orderNotes[selectedTable.id] || ""}
                handleUpdateOrderNotes={handleUpdateOrderNotes}
              />
            )}
          </section>
        )}

        {activeTab === POS_TABS.KITCHEN_NOTICES && canViewKitchenNotices && (
          <section className="pos-kitchen-notices">
            <header className="pos-kitchen-notices__toolbar">
              <div>
                <h2>Avisos de cocina</h2>
                <p>
                  Pedidos listos e incidencias pendientes de atención en salón.
                </p>

                {lastUpdatedAt && (
                  <span>
                    Última actualización: {formatDateTime(lastUpdatedAt)}
                  </span>
                )}
              </div>

              <button
                className="pos-refresh-button"
                type="button"
                onClick={() => loadKitchenNotifications({ silent: true })}
                disabled={isLoadingNotices || isRefreshingNotices}
              >
                <RefreshCw
                  size={17}
                  strokeWidth={2.2}
                  className={isRefreshingNotices ? "is-spinning" : ""}
                />
                Actualizar
              </button>
            </header>

            {isLoadingNotices ? (
              <div className="pos-notices-state">
                <span className="pos-notices-state__spinner" aria-hidden="true" />
                <p>Cargando avisos de cocina...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="pos-notices-empty">
                <CheckCircle2 size={32} strokeWidth={2.1} />
                <h3>No hay avisos pendientes</h3>
                <p>
                  Cuando cocina llame al mesero o solicite apoyo, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="pos-notices-list">
                {notifications.map((notification) => (
                  <KitchenNoticeCard
                    key={notification.id_notificacion}
                    notification={notification}
                    canAttendNotices={canAttendKitchenNotices}
                    canConfirmDelivery={canConfirmDelivery}
                    attendingId={attendingId}
                    deliveringOrderId={deliveringOrderId}
                    onAttend={handleAttendNotice}
                    onConfirmDelivery={handleConfirmDelivery}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  )
}