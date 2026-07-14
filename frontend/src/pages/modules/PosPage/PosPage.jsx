// frontend/src/pages/modules/PosPage/PosPage.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  cancelPosOrderItem,
  createPosOrder,
  getPosMenu,
  getPosTables,
  sendOrderToCashier,
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


function getTableResponsibleUser(table) {
  return table?.table_service?.responsible_user || null
}

function isTableSupportOrder(table, currentUser) {
  const responsibleUser = getTableResponsibleUser(table)

  if (!responsibleUser || !currentUser) {
    return false
  }

  return responsibleUser.id_usuario !== currentUser.id_usuario
}

function getUserDisplayName(user) {
  if (!user) {
    return ""
  }

  return [user.nombres, user.apellidos].filter(Boolean).join(" ").trim() ||
    user.username ||
    "Usuario"
}

// Cada producto puede tener varios envíos a cocina (varias filas item_orden
// vivas simultáneamente). Guardamos un lote (sentBatch) por cada uno para no
// perder la trazabilidad de idItemOrden al cancelar.
function buildOrderItemsFromCurrentItems(currentItems = []) {
  const grouped = new Map()

  currentItems.forEach((item) => {
    const key = item.id_producto
    const cantidad = Number(item.cantidad || 0)
    const estadoCocina = item.estado_cocina || "PENDIENTE"

    const batch = {
      idItemOrden: item.id_item_orden,
      quantity: cantidad,
      estadoCocina,
    }

    const existing = grouped.get(key)

    if (existing) {
      existing.quantity += cantidad
      existing.sentQuantity += cantidad
      existing.sentBatches.push(batch)
      return
    }

    grouped.set(key, {
      id: key,
      id_producto: key,
      category: item.categoria || item.category || "",
      name: item.producto_nombre,
      price: Number(item.precio_unitario || 0),
      emoji: item.emoji || "🍽️",
      quantity: cantidad,
      sentQuantity: cantidad,
      sentBatches: [batch],
      kitchenNotes: item.notas_cocina || "",
    })
  })

  return Array.from(grouped.values())
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
          {canAttendNotices && !isReadyOrder && (
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
  const isSendingToKitchenRef = useRef(false)

  const permissions = useMemo(() => getCurrentPermissions(), [])
  const currentUser = useMemo(() => getCurrentUser(), [])

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
  const [isSendingToKitchen, setIsSendingToKitchen] = useState(false)

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

  const isSelectedSupportOrder = isTableSupportOrder(selectedTable, currentUser)

  const isTableSentToCashier = (selectedTable?.active_orders || []).some(
    (order) => order.estado === "ENVIADA_A_CAJA",
  )

  const selectedResponsibleName = getUserDisplayName(
    getTableResponsibleUser(selectedTable),
  )

  const supportOrderMessage = isSelectedSupportOrder
    ? `Esta mesa está siendo atendida por ${selectedResponsibleName}. Puedes agregar una comanda de apoyo y quedará registrada con tu usuario.`
    : ""

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

    const loadSaleDataId = window.setTimeout(() => {
      loadSaleData()
    }, 0)

    return () => {
      isMounted = false
      window.clearTimeout(loadSaleDataId)
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

        // Red de seguridad: si por cualquier motivo llega un aviso de
        // "pedido listo" sin items (todo fue cancelado), no tiene sentido
        // mostrarlo al mesero. Lo auto-atendemos y lo ocultamos.
        const emptyReadyOrders = data.filter(
          (notification) =>
            notification.tipo === SERVICE_NOTIFICATION_TYPES.READY_ORDER &&
            Array.isArray(notification.items) &&
            notification.items.length === 0,
        )

        if (emptyReadyOrders.length > 0 && canAttendKitchenNotices) {
          emptyReadyOrders.forEach((notification) => {
            attendKitchenServiceCall(notification.id_notificacion).catch(() => {})
          })
        }

        const emptyIds = new Set(
          emptyReadyOrders.map((notification) => notification.id_notificacion),
        )

        setNotifications(
          data.filter((notification) => !emptyIds.has(notification.id_notificacion)),
        )
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
    [canViewKitchenNotices, canAttendKitchenNotices, showToast],
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

  useEffect(() => {
    if (!selectedTable) {
      return undefined
    }

    const tableId = selectedTable.id

    async function syncKitchenStatuses() {
      try {
        const refreshedTables = await getPosTables()
        const refreshedTable = refreshedTables.find((t) => t.id === tableId)

        if (!refreshedTable) return

        setTablesState(refreshedTables)

        setTableOrders((prev) => {
          const currentItems = prev[tableId]
          if (!currentItems) return prev

          return {
            ...prev,
            [tableId]: mergeKitchenStatuses(currentItems, refreshedTable.current_items),
          }
        })

        setSavedOrders((prev) => {
          const currentItems = prev[tableId]
          if (!currentItems) return prev

          return {
            ...prev,
            [tableId]: mergeKitchenStatuses(currentItems, refreshedTable.current_items),
          }
        })

        setSelectedTable((current) =>
          current && current.id === tableId ? refreshedTable : current,
        )
      } catch (error) {
        // Polling silencioso: no interrumpir al mesero por un fallo de red puntual.
      }
    }

    const intervalId = window.setInterval(syncKitchenStatuses, 8000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [selectedTable?.id])

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

  // Actualiza solo el estado de cocina (estadoCocina) de los lotes ya
  // enviados, sin tocar cantidades pendientes que el mesero esté editando.
  function mergeKitchenStatuses(items, currentItems) {
    const statusByItemOrden = new Map(
      (currentItems || []).map((ci) => [ci.id_item_orden, ci.estado_cocina]),
    )

    return items.map((item) => {
      const sentBatches = (item.sentBatches || []).map((batch) => {
        const freshStatus = statusByItemOrden.get(batch.idItemOrden)

        if (!freshStatus || freshStatus === batch.estadoCocina) {
          return batch
        }

        return { ...batch, estadoCocina: freshStatus }
      })

      return { ...item, sentBatches }
    })
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

    if (isTableSupportOrder(table, currentUser)) {
      const responsibleName = getUserDisplayName(getTableResponsibleUser(table))

      showToast({
        type: "info",
        title: "Comanda de apoyo",
        message: `La mesa ${table.number} está siendo atendida por ${responsibleName}.`,
      })
    }

    setSelectedTable(table)

    if (savedOrders[table.id]) {
      setTableOrders((prev) => ({
        ...prev,
        [table.id]: savedOrders[table.id],
      }))
      return
    }

    const seededItems = buildOrderItemsFromCurrentItems(table.current_items)

    setTableOrders((prev) => ({
      ...prev,
      [table.id]: seededItems,
    }))

    setSavedOrders((prev) => ({
      ...prev,
      [table.id]: seededItems,
    }))
  }

  async function resyncTableOrder(table) {
    try {
      const refreshedTables = await getPosTables()
      setTablesState(refreshedTables)

      const refreshedTable = refreshedTables.find((t) => t.id === table.id)
      if (!refreshedTable) return

      const seededItems = buildOrderItemsFromCurrentItems(
        refreshedTable.current_items,
      )

      setTableOrders((prev) => ({ ...prev, [table.id]: seededItems }))
      setSavedOrders((prev) => ({ ...prev, [table.id]: seededItems }))

      setSelectedTable((current) =>
        current && current.id === table.id ? refreshedTable : current,
      )
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo sincronizar la mesa",
        message: "Recarga la página para evitar inconsistencias.",
      })
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
            sentBatches: [],
            kitchenReady: false,
            kitchenNotes: "",
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

  async function handleDecreaseQuantity(productId) {
    if (!selectedTable) {
      return
    }

    const currentOrder = tableOrders[selectedTable.id] || []
    const item = currentOrder.find((orderItem) => orderItem.id === productId)

    if (!item) {
      return
    }

    const pendingQuantity = item.quantity - item.sentQuantity

    if (pendingQuantity > 0) {
      setTableOrders((prev) => {
        const updatedItems = (prev[selectedTable.id] || [])
          .map((orderItem) =>
            orderItem.id === productId
              ? { ...orderItem, quantity: orderItem.quantity - 1 }
              : orderItem,
          )
          .filter((orderItem) => orderItem.quantity > 0)

        setSavedOrders((currentSavedOrders) => ({
          ...currentSavedOrders,
          [selectedTable.id]: updatedItems,
        }))

        return { ...prev, [selectedTable.id]: updatedItems }
      })

      return
    }

    if (item.sentQuantity > 0) {
      const sentBatches = item.sentBatches || []

      let targetIndex = -1
      for (let i = sentBatches.length - 1; i >= 0; i--) {
        if (sentBatches[i].quantity > 0 && sentBatches[i].estadoCocina === "PENDIENTE") {
          targetIndex = i
          break
        }
      }

      if (targetIndex === -1) {
        showToast({
          type: "warning",
          title: "Producto ya preparado",
          message: `${item.name} ya fue preparado por cocina y no se puede cancelar.`,
        })

        return
      }

      const targetBatch = sentBatches[targetIndex]

      if (!targetBatch.idItemOrden) {
        showToast({
          type: "error",
          title: "No se pudo identificar el producto enviado",
          message: "Se sincronizará la mesa con el servidor para corregirlo.",
        })

        await resyncTableOrder(selectedTable)
        return
      }

      const confirmCancel = window.confirm(
        `¿Deseas cancelar 1 ${item.name} enviado a cocina?`,
      )

      if (!confirmCancel) {
        return
      }

      try {
        await cancelPosOrderItem(targetBatch.idItemOrden, 1)

        setTableOrders((prev) => {
          const updatedItems = (prev[selectedTable.id] || [])
            .map((orderItem) => {
              if (orderItem.id !== productId) return orderItem

              const newBatches = (orderItem.sentBatches || [])
                .map((batch, index) =>
                  index === targetIndex
                    ? { ...batch, quantity: batch.quantity - 1 }
                    : batch,
                )
                .filter((batch) => batch.quantity > 0)

              return {
                ...orderItem,
                quantity: orderItem.quantity - 1,
                sentQuantity: orderItem.sentQuantity - 1,
                sentBatches: newBatches,
              }
            })
            .filter((orderItem) => orderItem.quantity > 0)

          setSavedOrders((currentSavedOrders) => ({
            ...currentSavedOrders,
            [selectedTable.id]: updatedItems,
          }))

          return { ...prev, [selectedTable.id]: updatedItems }
        })

        showToast({
          type: "success",
          title: "Producto cancelado",
          message: `${item.name} fue cancelado correctamente.`,
        })
      } catch (error) {
        // Error crítico: no confiamos en el estado local tras un fallo de
        // cancelación — resincronizamos con la fuente de verdad del backend.
        showToast({
          type: "error",
          title: "No se pudo cancelar — sincronizando mesa",
          message: error.message || "Verifica si cocina ya empezó a prepararlo.",
        })

        await resyncTableOrder(selectedTable)
      }

      return
    }

    setTableOrders((prev) => {
      const updatedItems = (prev[selectedTable.id] || [])
        .map((orderItem) =>
          orderItem.id === productId
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem,
        )
        .filter((orderItem) => orderItem.quantity > 0)

      return { ...prev, [selectedTable.id]: updatedItems }
    })
  }

  async function handleSendToKitchen() {
    if (!selectedTable || isSendingToKitchenRef.current) {
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

    const tableToSend = selectedTable
    const tableId = tableToSend.id
    const tableNumber = tableToSend.number
    const notes = orderNotes[tableId] || ""
    const itemsSnapshot = orderItems

    const newItems = itemsSnapshot
      .map((item) => {
        const quantityToSend = item.quantity - item.sentQuantity

        if (quantityToSend <= 0) {
          return null
        }

        return {
          id_producto: item.id_producto || item.id,
          cantidad: quantityToSend,
          notas_cocina: item.kitchenNotes?.trim() || null,
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

    try {
      isSendingToKitchenRef.current = true
      setIsSendingToKitchen(true)

      const createdOrder = await createPosOrder({
        id_mesa: tableToSend.id_mesa || tableToSend.id,
        observaciones: notes.trim() || null,
        items: newItems,
      })

      let missingTracking = false

      const updatedItems = itemsSnapshot.map((item) => {
        const quantityToSend = item.quantity - item.sentQuantity

        if (quantityToSend <= 0) {
          return item
        }

        const matchingOrderItem = createdOrder?.items?.find(
          (orderItem) =>
            orderItem.id_producto === (item.id_producto || item.id),
        )

        if (!matchingOrderItem) {
          missingTracking = true

          return {
            ...item,
            sentQuantity: item.quantity,
          }
        }

        const newBatch = {
          idItemOrden: matchingOrderItem.id_item_orden,
          quantity: quantityToSend,
          estadoCocina: "PENDIENTE",
        }

        return {
          ...item,
          sentQuantity: item.quantity,
          sentBatches: [...(item.sentBatches || []), newBatch],
        }
      })

      const refreshedTables = await getPosTables()

      setTablesState(refreshedTables)

      const refreshedTable = refreshedTables.find((table) => table.id === tableId)

      setSelectedTable((currentTable) => {
        if (!currentTable || currentTable.id !== tableId) {
          return currentTable
        }

        return refreshedTable || currentTable
      })

      setTableOrders((prev) => ({
        ...prev,
        [tableId]: updatedItems,
      }))

      setSavedOrders((prev) => ({
        ...prev,
        [tableId]: updatedItems,
      }))

      setOrderNotes((prev) => ({
        ...prev,
        [tableId]: "",
      }))

      showToast({
        type: "success",
        title: "Comanda enviada a cocina",
        message: `Orden ${createdOrder?.numero_orden || ""} registrada para la mesa ${tableNumber}.`,
      })

      // Error crítico silencioso: si el backend no devolvió el id_item_orden
      // esperado para algún producto, no confiamos en el tracking local —
      // resincronizamos de inmediato con la mesa ya refrescada.
      if (missingTracking && refreshedTable) {
        showToast({
          type: "warning",
          title: "Revisa esta mesa",
          message: "No se pudo confirmar el tracking de algún producto. Se sincronizó con el servidor.",
        })

        const seededItems = buildOrderItemsFromCurrentItems(
          refreshedTable.current_items,
        )

        setTableOrders((prev) => ({ ...prev, [tableId]: seededItems }))
        setSavedOrders((prev) => ({ ...prev, [tableId]: seededItems }))
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo enviar a cocina",
        message: error.message || "Verifica la mesa, productos y disponibilidad.",
      })
    } finally {
      isSendingToKitchenRef.current = false
      setIsSendingToKitchen(false)
    }
  }
  
  async function handleSendToCashier() {
    if (!selectedTable) {
      return
    }

    const hasActiveTableOrders =
      Number(selectedTable.active_order_count || 0) > 0 ||
      selectedTable.active_orders?.length > 0

    const hasSentLocalItems = orderItems.some(
      (item) => item.sentQuantity > 0,
    )

    const hasPendingLocalItems = orderItems.some(
      (item) => item.quantity > item.sentQuantity,
    )

    if (hasPendingLocalItems) {
      showToast({
        type: "warning",
        title: "Pedido pendiente",
        message: "Primero envía los productos nuevos a cocina.",
      })

      return
    }

    if (!hasActiveTableOrders && !hasSentLocalItems) {
      showToast({
        type: "warning",
        title: "Sin cuenta activa",
        message: "Esta mesa no tiene órdenes activas para enviar a caja.",
      })

      return
    }

    const confirmSend = window.confirm(
      `¿Estás seguro de enviar a caja la cuenta de la mesa ${selectedTable.number}? Ya no podrás agregar más productos a este pedido.`,
    )

    if (!confirmSend) {
      return
    }

    const tableToSend = selectedTable
    const tableId = tableToSend.id

    try {
      await sendOrderToCashier(tableToSend.id_mesa || tableToSend.id)

      showToast({
        type: "success",
        title: "Pedido enviado a caja",
        message: `La cuenta de la mesa ${tableToSend.number} fue enviada a caja correctamente.`,
      })

      const refreshedTables = await getPosTables()
      setTablesState(refreshedTables)

      const refreshedTable = refreshedTables.find((table) => table.id === tableId)

      setSelectedTable((current) =>
        current && current.id === tableId ? refreshedTable || current : current,
      )
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo enviar a caja",
        message: error.message || "Verifica que todos los pedidos estén entregados.",
      })
    }
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

  function handleUpdateItemNotes(productId, notes) {
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
                kitchenNotes: notes,
              }
            : item,
        ),
      }
    })

    setSavedOrders((prev) => {
      const currentOrder = prev[selectedTable.id] || []

      return {
        ...prev,
        [selectedTable.id]: currentOrder.map((item) =>
          item.id === productId
            ? {
                ...item,
                kitchenNotes: notes,
              }
            : item,
        ),
      }
    })
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
                handleUpdateItemNotes={handleUpdateItemNotes}
                isSendingToKitchen={isSendingToKitchen}
                activeOrders={selectedTable.active_orders || []}
                activeOrderCount={selectedTable.active_order_count || 0}
                activeTotal={selectedTable.active_total || 0}
                isSupportOrder={isSelectedSupportOrder}
                supportOrderMessage={supportOrderMessage}
                isAccountLocked={isTableSentToCashier}
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