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


import PosPageTables from "./components/PosPageTables"
import PosPageMenu from "./components/PosPageMenu"

import useToast from "../../../components/common/Toast/useToast"

import { getCurrentPermissions } from "../../../services/authService"

import {
  attendKitchenServiceCall,
  confirmKitchenOrderDelivery,
  getKitchenServiceCalls,
  SERVICE_NOTIFICATION_STATUS,
  SERVICE_NOTIFICATION_TYPES,
} from "../../../services/kdsService"

import { hasPermission } from "../../../utils/permission"

import "./PosPage.css"

// TABS
const POS_TABS = {
  SALE: "sale",
  KITCHEN_NOTICES: "kitchen-notices",
}

// POLLING
const POLLING_INTERVAL_MS = 15000

// MESERO ACTUAL
const currentWaiter = "Lucía"

// MESAS
const initialTables = [
  {
    id: 1,
    number: 1,
    floor: "Piso 1",
    occupied: false,
    waiter: null,
    time: null,
  },

  {
    id: 2,
    number: 2,
    floor: "Piso 1",
    occupied: true,
    waiter: "Ana",
    time: "12 min",
  },

  {
    id: 3,
    number: 3,
    floor: "Piso 1",
    occupied: true,
    waiter: "Ale",
    time: "25 min",
  },

  {
    id: 4,
    number: 4,
    floor: "Piso 1",
    occupied: false,
    waiter: null,
    time: null,
  },

  {
    id: 5,
    number: 5,
    floor: "Piso 1",
    occupied: true,
    waiter: "Lucía",
    time: "8 min",
  },

  {
    id: 6,
    number: 6,
    floor: "Piso 1",
    occupied: false,
    waiter: null,
    time: null,
  },

  {
    id: 7,
    number: 7,
    floor: "Terraza",
    occupied: true,
    waiter: "Lucía",
    time: "16 min",
  },

  {
    id: 8,
    number: 8,
    floor: "Terraza",
    occupied: false,
    waiter: null,
    time: null,
  },
]

// PRODUCTOS
const products = [
  {
    id: 1,
    category: "Fondos",
    name: "Lomo Saltado",
    price: 32,
    emoji: "🥩",
  },

  {
    id: 2,
    category: "Fondos",
    name: "Ají de Gallina",
    price: 28,
    emoji: "🍛",
  },

  {
    id: 3,
    category: "Fondos",
    name: "Arroz Chaufa",
    price: 26,
    emoji: "🍚",
  },

  {
    id: 4,
    category: "Bebidas",
    name: "Chicha Morada",
    price: 8,
    emoji: "🥤",
  },

  {
    id: 5,
    category: "Bebidas",
    name: "Inka Cola",
    price: 7,
    emoji: "🧃",
  },

  {
    id: 6,
    category: "Bebidas",
    name: "Maracuyá Frozen",
    price: 12,
    emoji: "🍹",
  },

  {
    id: 7,
    category: "Postres",
    name: "Cheesecake",
    price: 14,
    emoji: "🍰",
  },

  {
    id: 8,
    category: "Postres",
    name: "Brownie",
    price: 12,
    emoji: "🍫",
  },

  {
    id: 9,
    category: "Postres",
    name: "Tiramisú",
    price: 16,
    emoji: "🍮",
  },
]


// CATEGORIAS
const categories = [
  "Todos",
  "Fondos",
  "Bebidas",
  "Postres",
]

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
  // TOAST Y PERMISOS
  const { showToast } = useToast()

  const permissions = useMemo(() => getCurrentPermissions(), [])

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
  // STATES KITCHEN
  const [activeTab, setActiveTab] = useState(
    canViewKitchenNotices ? POS_TABS.KITCHEN_NOTICES : POS_TABS.SALE,
  )
  const [notifications, setNotifications] = useState([])
  const [isLoadingNotices, setIsLoadingNotices] = useState(false)
  const [isRefreshingNotices, setIsRefreshingNotices] = useState(false)
  const [attendingId, setAttendingId] = useState("")
  const [deliveringOrderId, setDeliveringOrderId] = useState("")
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  
  // STATES
  const [selectedTable, setSelectedTable] =
    useState(null)

  const [selectedCategory, setSelectedCategory] =
    useState("Todos")

  const [searchTerm, setSearchTerm] =
    useState("")

  // MESAS DINAMICAS
  const [tablesState, setTablesState] =
    useState(initialTables)
  
  // PEDIDOS POR MESA
  const [tableOrders, setTableOrders] =
    useState({})

  // PEDIDOS ENVIADOS A COCINA
  const [savedOrders, setSavedOrders] =
    useState({})
  
  // NOTAS POR MESA
  const [orderNotes, setOrderNotes] =
    useState({})

  // DATOS DERIVADOS
  const orderItems =
    selectedTable
      ? tableOrders[selectedTable.id] || []
      : []

  const pendingReadyOrders = notifications.filter(
    (notification) => notification.tipo === SERVICE_NOTIFICATION_TYPES.READY_ORDER,
  ).length

  const pendingIncidents = notifications.filter(
    (notification) =>
      notification.tipo === SERVICE_NOTIFICATION_TYPES.KITCHEN_INCIDENT,
  ).length

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

  // EFFECTS
  useEffect(() => {
    if (!canViewKitchenNotices) {
      return undefined
    }

  // FUNCIONES KITCHEN
    loadKitchenNotifications()

    const intervalId = window.setInterval(() => {
      loadKitchenNotifications({ silent: true })
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
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

  // FUNCIONES POS
  // CLICK EN MESA

  function handleTableClick(table) {

    // VALIDAR MESERO
    if (
      table.occupied &&
      table.waiter !== currentWaiter
    ) {

      alert(
        `No puedes entrar a la mesa ${table.number} porque la atiende ${table.waiter}`,
      )

      return
    }

    setSelectedTable(table)

    // CARGAR SOLO SI YA SE ENVIO A COCINA
    if (savedOrders[table.id]) {

      setTableOrders((prev) => ({

        ...prev,

        [table.id]: savedOrders[table.id],
      }))
    }

    console.log(
      `Entrando a la mesa ${table.number}`,
    )
  }


  // AGREGAR PRODUCTO
  function handleAddProduct(product, quantityToAdd) {

    if (!selectedTable) {
      return
    }

    if (quantityToAdd < 1) {
      return
    }

    const currentOrder =
      tableOrders[selectedTable.id] || []

    const existingProduct =
      currentOrder.find(
        (item) => item.id === product.id,
      )

    let updatedItems = []

    // SI YA EXISTE

    if (existingProduct) {

      updatedItems =
        currentOrder.map((item) =>

          item.id === product.id
            ? {
                ...item,

                quantity:
                  item.quantity + quantityToAdd,
              }
            : item,
        )

    } else {

      // NUEVO PRODUCTO

      updatedItems = [

        ...currentOrder,

        {
          ...product,

          quantity: quantityToAdd,

          // CUANTO SE ENVIO A COCINA

          sentQuantity: 0,

          // SI COCINA YA TERMINO

          kitchenReady: false,
        },
      ]
    }

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))
  }


  // AUMENTAR

  function handleIncreaseQuantity(productId) {

    const currentOrder =
      tableOrders[selectedTable.id] || []

    const updatedItems =
      currentOrder.map((item) =>

        item.id === productId
          ? {
              ...item,

              quantity: item.quantity + 1,
            }
          : item,
      )

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))
  }


  // DISMINUIR

  function handleDecreaseQuantity(productId) {

    const currentOrder =
      tableOrders[selectedTable.id] || []

    const updatedItems = currentOrder

      .map((item) => {

        // PRODUCTO DIFERENTE

        if (item.id !== productId) {
          return item
        }

        // CANTIDAD PENDIENTE

        const pendingQuantity =
          item.quantity - item.sentQuantity

        // SI HAY PRODUCTOS PENDIENTES
        // ELIMINAR NORMAL

        if (pendingQuantity > 0) {

          return {

            ...item,

            quantity: item.quantity - 1,
          }
        }

        // SI TODO YA FUE ENVIADO

        if (item.sentQuantity > 0) {

          // SI COCINA YA TERMINÓ

          if (item.kitchenReady) {

            alert(
              `${item.name} ya fue preparado por cocina`,
            )

            return item
          }

          // CONFIRMAR CANCELACIÓN

          const confirmCancel = window.confirm(
            `¿Deseas cancelar 1 ${item.name} enviado a cocina?`,
          )

          if (!confirmCancel) {
            return item
          }

          // DISMINUIR TODO

          return {

            ...item,

            quantity: item.quantity - 1,

            sentQuantity:
              item.sentQuantity - 1,
          }
        }

        // PRODUCTO NORMAL

        return {

          ...item,

          quantity: item.quantity - 1,
        }
      })

      .filter((item) => item.quantity > 0)

    // ACTUALIZAR MESA

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))

    // ACTUALIZAR PEDIDOS GUARDADOS

    setSavedOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))
  }

  // ENVIAR A COCINA

  function handleSendToKitchen() {

    // VALIDAR

    if (orderItems.length === 0) {

      alert("No hay productos para enviar")

      return
    }

    // SOLO PRODUCTOS NUEVOS

    const newItems = orderItems

      .map((item) => {

        const quantityToSend =
          item.quantity - item.sentQuantity

        if (quantityToSend <= 0) {
          return null
        }

        return {

          ...item,

          quantity: quantityToSend,
        }
      })

      .filter(Boolean)


    // SI YA TODO FUE ENVIADO

    if (newItems.length === 0) {

      alert(
        "El pedido ya se envió a cocina",
      )

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
            }
          : table,
      ),
    )

    setSelectedTable((prev) => ({

      ...prev,

      occupied: true,

      waiter: currentWaiter,

      time: "Ahora",
    }))


    // LOGS

    console.log(
      `NUEVO PEDIDO MESA ${selectedTable.number}`,
    )

    console.table(

      newItems.map((item) => ({

        producto: item.name,

        cantidad: item.quantity,

        precio: item.price,

        subtotal:
          item.quantity * item.price,

        Nota: orderNotes[selectedTable.id] || "Sin notas",
      })),
    )


    // ACTUALIZAR SENT QUANTITY

    const updatedItems =
      orderItems.map((item) => ({

        ...item,

        sentQuantity: item.quantity,
      }))


    // GUARDAR EN MESA

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))


    // GUARDAR PEDIDO ENVIADO

    setSavedOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))

    alert(
      `Pedido enviado a cocina para mesa ${selectedTable.number}`,
    )

    // LIMPIAR NOTAS
    setOrderNotes((prev) => ({

      ...prev,

      [selectedTable.id]: "",
    }))
  }

  // ENVIAR A CAJA

  function handleSendToCashier() {

    // VALIDAR SI YA SE ENVIO A COCINA
    const alreadySentToKitchen =
      orderItems.some(
        (item) => item.sentQuantity > 0,
      )

    if (!alreadySentToKitchen) {

      alert(
        "Primero debes enviar el pedido a cocina",
      )

      return
    }

    // CONFIRMAR ENVIO A CAJA
    const confirmSend = window.confirm(
      `¿Estás seguro de enviar la mesa ${selectedTable.number} a caja?`
    )

    if (!confirmSend) {
      return
    }

    // MENSAJE
    alert(
      `Mesa ${selectedTable.number} enviada a caja`,
    )

    // LIMPIAR PEDIDOS
    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: [],
    }))

    // LIMPIAR GUARDADOS
    setSavedOrders((prev) => ({

      ...prev,

      [selectedTable.id]: [],
    }))

    // LIMPIAR NOTAS
    setOrderNotes((prev) => ({

      ...prev,

      [selectedTable.id]: "",
    }))

    // LIBERAR MESA
    setTablesState((prev) =>

      prev.map((table) =>

        table.id === selectedTable.id
          ? {

              ...table,

              occupied: false,

              waiter: null,

              time: null,
            }
          : table,
      ),
    )

    // REGRESAR A MESAS
    setSelectedTable(null)
  }

  function handleUpdateOrderNotes(notes) {

    setOrderNotes((prev) => ({

      ...prev,

      [selectedTable.id]: notes,
    }))
  }

  // FILTROS
  // FLOORS

  const floors = [
    ...new Set(
      tablesState.map((table) => table.floor),
    ),
  ]

  const [selectedFloor, setSelectedFloor] =
    useState(floors[0])


  // FILTRAR MESAS

  const filteredTables = tablesState.filter(
    (table) =>
      table.floor === selectedFloor,
  )

  // FILTRAR PRODUCTOS

  const filteredProducts = products.filter(
    (product) => {

      // CATEGORIA

      const matchesCategory =
        selectedCategory === "Todos"
          ? true
          : product.category === selectedCategory

      // OMITIR TILDES

      const normalizedProductName =
        product.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()

      const normalizedSearch =
        searchTerm
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()

      const matchesSearch =
        normalizedProductName.includes(
          normalizedSearch,
        )

      return (
        matchesCategory &&
        matchesSearch
      )
    },
  )

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

            {/* MENU */}

            {!selectedTable && (

              <PosPageTables
                tables={filteredTables}
                onTableClick={handleTableClick}
                floors={floors}
                selectedFloor={selectedFloor}
                setSelectedFloor={setSelectedFloor}
              />

            )}

            {/* MENU */}

            {selectedTable && (

              <PosPageMenu
                selectedTable={selectedTable}
                products={filteredProducts}
                categories={categories}
                selectedCategory={selectedCategory}
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