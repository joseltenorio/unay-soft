// frontend/src/pages/modules/KdsPage/KdsPage.jsx

import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Check,
  Clock3,
  Filter,
  Menu,
  PhoneCall,
  Search,
  UtensilsCrossed,
} from "lucide-react"

import logoUmari from "../../../assets/icons/logo-umari-dark.svg"
import useToast from "../../../components/common/Toast/useToast"

import {
  createKitchenIncidentServiceCall,
  createReadyOrderServiceCall,
  getKitchenOrders,
  updateKitchenItemStatus,
  updateKitchenOrderStatus,
} from "../../../services/kdsService"

import {
  canToggleKitchenItem,
  getNextItemStatus,
  getNextOrderStatus,
  mapKitchenOrdersToBoard,
} from "../../../utils/kdsMapper"

import "./KdsPage.css"

const TIME_THRESHOLDS = { fresh: 5, normal: 10, warn: 15 }
const READY_ORDER_HIDE_DELAY_MS = 7000
const BOARD_BOTTOM_SAFE_GAP = 58

const H = {
  headerBase: 62,
  splitStrip: 16,
  headerProg: 3,
  itemBase: 47,
  itemNote: 20,
  footer: 66,
  spacer: 14,

  minFirst: 2,
  minSecond: 2,
}

const STATUS_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Nuevos" },
  { id: "process", label: "En proceso" },
  { id: "done", label: "Listos" },
]

const INCIDENT_REASONS = [
  "Falta insumo",
  "Pedido confuso",
  "Corrección de comanda",
  "Apoyo en preparación",
  "Demora por alta carga",
  "Otro",
]

const getServiceActionLabel = (status) =>
  status === "done" ? "Llamar mesero" : "Pedir apoyo"

const getTimeUrgencyClass = (minutes) =>
  minutes <= TIME_THRESHOLDS.fresh
    ? "time--fresh"
    : minutes <= TIME_THRESHOLDS.normal
      ? "time--normal"
      : minutes <= TIME_THRESHOLDS.warn
        ? "time--warn"
        : "time--critical"

const formatElapsed = (order) => order.elapsedLabel || `${order.elapsedMinutes}m`

const getStatusLabel = (status) =>
  ({
    new: "Nuevo",
    process: "En proceso",
    done: "Listo",
  })[status] ?? "Pendiente"

const getPrimaryAction = (status) =>
  ({
    new: "Iniciar",
    process: "Finalizar",
    done: "Listo",
  })[status] ?? "Actualizar"

const getFilterCount = (orders, filterId) =>
  filterId === "all"
    ? orders.length
    : orders.filter((order) => order.status === filterId).length

function orderMatchesSearch(order, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  const searchableValues = [
    order.id,
    order.table,
    order.waiter,
    getStatusLabel(order.status),
    ...order.items.map((item) => item.name),
    ...order.items.flatMap((item) => item.notes),
  ]

  return searchableValues.some((value) =>
    String(value).toLowerCase().includes(normalizedSearch),
  )
}

function orderHasNotes(order) {
  return order.items.some((item) => item.notes.length > 0)
}

function orderHasPendingItems(order) {
  return order.items.some((item) => !item.done)
}

function orderIsCritical(order) {
  return order.elapsedMinutes > TIME_THRESHOLDS.warn
}

const estItemH = (item) => H.itemBase + item.notes.length * H.itemNote

const estHeaderH = (order) =>
  H.headerBase + (order.status === "process" ? H.headerProg : 0)

const estCardH = (order) =>
  estHeaderH(order) +
  order.items.reduce((sum, item) => sum + estItemH(item), 0) +
  H.footer

function buildColumns(orders, availableHeight) {
  if (!availableHeight || availableHeight <= 0) {
    return [orders.map((order) => ({ kind: "complete", order }))]
  }

  const columns = [[]]
  let usedHeight = 0

  const currentColumn = () => columns[columns.length - 1]
  const remainingHeight = () => Math.max(0, availableHeight - usedHeight)

  function pushBlock(block) {
    currentColumn().push(block)
    usedHeight += block.h
  }

  function startNewColumn() {
    columns.push([])
    usedHeight = 0
  }

  function addFullOrder(order) {
    pushBlock({ kind: "complete", order, h: estCardH(order) })
    pushBlock({ kind: "spacer", h: H.spacer })
  }

  function moveFullOrderToNewColumn(order) {
    if (usedHeight > 0) {
      startNewColumn()
    }

    addFullOrder(order)
  }

  function getSplitInfo(order, heightLimit) {
    const headerHeight = estHeaderH(order)
    const itemHeights = order.items.map(estItemH)
    const totalItems = order.items.length

    if (totalItems < H.minFirst + H.minSecond) {
      return null
    }

    let firstCount = 0
    let splitHeight = headerHeight

    for (let index = 0; index < totalItems; index += 1) {
      if (splitHeight + itemHeights[index] <= heightLimit) {
        splitHeight += itemHeights[index]
        firstCount += 1
      } else {
        break
      }
    }

    firstCount = Math.min(firstCount, totalItems - H.minSecond)

    const secondCount = totalItems - firstCount

    if (firstCount < H.minFirst || secondCount < H.minSecond) {
      return null
    }

    const firstItems = order.items.slice(0, firstCount)
    const secondItems = order.items.slice(firstCount)

    const firstHeight =
      headerHeight +
      itemHeights.slice(0, firstCount).reduce((sum, h) => sum + h, 0)

    const secondHeight =
      H.splitStrip +
      (order.status === "process" ? H.headerProg : 0) +
      itemHeights.slice(firstCount).reduce((sum, h) => sum + h, 0) +
      H.footer

    return {
      firstItems,
      secondItems,
      firstHeight,
      secondHeight,
    }
  }

  for (const order of orders) {
    const cardHeight = estCardH(order)

    if (remainingHeight() >= cardHeight + H.spacer) {
      addFullOrder(order)
      continue
    }

    let split = getSplitInfo(order, remainingHeight())

    if (split) {
      pushBlock({
        kind: "start",
        order,
        items: split.firstItems,
        h: split.firstHeight,
      })

      startNewColumn()

      pushBlock({
        kind: "end",
        order,
        items: split.secondItems,
        h: split.secondHeight,
      })

      pushBlock({ kind: "spacer", h: H.spacer })
      continue
    }

    if (usedHeight > 0) {
      startNewColumn()
    }

    if (remainingHeight() >= cardHeight + H.spacer) {
      addFullOrder(order)
      continue
    }

    split = getSplitInfo(order, remainingHeight())

    if (split) {
      pushBlock({
        kind: "start",
        order,
        items: split.firstItems,
        h: split.firstHeight,
      })

      startNewColumn()

      pushBlock({
        kind: "end",
        order,
        items: split.secondItems,
        h: split.secondHeight,
      })

      pushBlock({ kind: "spacer", h: H.spacer })
      continue
    }

    moveFullOrderToNewColumn(order)
  }

  return columns
}

function HeaderBand({ order }) {
  const timeClass = getTimeUrgencyClass(order.elapsedMinutes)
  const doneCount = order.items.filter((item) => item.done).length
  const progressPct =
    order.items.length > 0
      ? Math.round((doneCount / order.items.length) * 100)
      : 0

  return (
    <>
      <div className={`kds-card-band kds-card-band--${order.status}`}>
        <div className="kds-card-band__left">
          <strong className="kds-card-id">{order.id}</strong>

          <span className={`kds-card-time ${timeClass}`}>
            <Clock3 size={12} strokeWidth={2.5} />
            {formatElapsed(order)}
          </span>
        </div>

        <div className="kds-card-band__right">
          <small className="kds-card-status-badge">
            {getStatusLabel(order.status)}
          </small>

          <span className="kds-card-table">{order.table}</span>
        </div>
      </div>

      {order.status === "process" && (
        <div className="kds-card-progress" aria-hidden="true">
          <div
            className="kds-card-progress__fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </>
  )
}

function ItemRow({ order, item, isLast, updatingItemId, onToggleItem }) {
  const isUpdating = updatingItemId === item.id
  const isBlockedBeforeStart = order.status === "new" && !item.done
  const isDisabled = isUpdating || item.done || isBlockedBeforeStart

  return (
    <div className={`kds-card-item${isLast ? " kds-card-item--last" : ""}`}>
      <button
        className={
          item.done
            ? "kds-check-button kds-check-button--done"
            : "kds-check-button"
        }
        type="button"
        aria-label={
          isBlockedBeforeStart
            ? `Inicia la comanda antes de marcar ${item.name}`
            : `${item.done ? "Listo" : "Marcar"} ${item.name}`
        }
        title={
          isBlockedBeforeStart
            ? "Primero inicia la preparación de la comanda"
            : undefined
        }
        onClick={() => onToggleItem(order.id, item.id)}
        disabled={isDisabled}
      >
        {item.done && <Check size={12} strokeWidth={3} />}
        {isUpdating && !item.done && <span className="kds-check-button__loader" />}
      </button>

      <div className="kds-card-item__main">
        <div className="kds-card-item__info">
          <strong className={item.done ? "is-done" : ""}>{item.name}</strong>

          {item.notes.length > 0 && (
            <ul className="kds-card-item__notes">
              {item.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>

        <span className="kds-card-item__qty">{item.quantity}×</span>
      </div>
    </div>
  )
}

function FooterActions({
  order,
  updatingOrderId,
  serviceCallOrderId,
  onAdvance,
  onServiceAction,
}) {
  const hasPendingItems = order.items.some((item) => !item.done)
  const isFinishBlocked = order.status === "process" && hasPendingItems
  const isUpdating = updatingOrderId === order.id
  const isServiceCallSubmitting = serviceCallOrderId === order.id
  const isDone = order.status === "done"

  return (
    <footer className="kds-card-footer">
      <button
        className={
          isDone
            ? "kds-waiter-button kds-waiter-button--ready"
            : "kds-waiter-button"
        }
        type="button"
        onClick={() => onServiceAction(order.id)}
        disabled={isServiceCallSubmitting}
        aria-busy={isServiceCallSubmitting}
      >
        <PhoneCall size={15} strokeWidth={2.2} />
        {isServiceCallSubmitting
          ? "Enviando..."
          : getServiceActionLabel(order.status)}
      </button>

      <button
        className={`kds-action-button kds-action-button--${order.status}`}
        type="button"
        onClick={() => onAdvance(order.id)}
        disabled={isDone || isUpdating || isFinishBlocked}
        title={
          isFinishBlocked
            ? "Marca todos los ítems como listos antes de finalizar"
            : undefined
        }
        aria-label={
          isUpdating
            ? "Actualizando estado de comanda"
            : getPrimaryAction(order.status)
        }
      >
        {isUpdating ? (
          <span className="kds-action-button__spinner" aria-hidden="true" />
        ) : (
          getPrimaryAction(order.status)
        )}
      </button>
    </footer>
  )
}

function CardComplete({
  order,
  updatingOrderId,
  updatingItemId,
  serviceCallOrderId,
  onAdvance,
  onToggleItem,
  onServiceAction,
}) {
  return (
    <article className={`kds-order-card kds-order-card--${order.status}`}>
      <HeaderBand order={order} />

      <div className="kds-card-body">
        {order.items.map((item, index) => (
          <ItemRow
            key={item.id}
            order={order}
            item={item}
            isLast={index === order.items.length - 1}
            updatingItemId={updatingItemId}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>

      <FooterActions
        order={order}
        updatingOrderId={updatingOrderId}
        serviceCallOrderId={serviceCallOrderId}
        onAdvance={onAdvance}
        onServiceAction={onServiceAction}
      />
    </article>
  )
}

function CardStart({ order, items, updatingItemId, onToggleItem }) {
    return (
    <article
      className={`kds-order-card kds-order-card--${order.status} kds-order-card--split-start`}
    >
      <HeaderBand order={order} />

      <div className="kds-card-body">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            order={order}
            item={item}
            isLast={false}
            updatingItemId={updatingItemId}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>
    </article>
  )
}

function SplitContinuationStrip({ order }) {
  const doneCount = order.items.filter((item) => item.done).length
  const progressPct =
    order.items.length > 0
      ? Math.round((doneCount / order.items.length) * 100)
      : 0

  return (
    <>
      <div
        className={`kds-split-strip kds-split-strip--${order.status}`}
        aria-hidden="true"
      />

      {order.status === "process" && (
        <div className="kds-card-progress" aria-hidden="true">
          <div
            className="kds-card-progress__fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </>
  )
}

function CardEnd({
  order,
  items,
  updatingOrderId,
  updatingItemId,
  serviceCallOrderId,
  onAdvance,
  onToggleItem,
  onServiceAction,
}) {
    return (
    <article
      className={`kds-order-card kds-order-card--${order.status} kds-order-card--split-end`}
    >
      <SplitContinuationStrip order={order} />

      <div className="kds-card-body">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            order={order}
            item={item}
            isLast={index === items.length - 1}
            updatingItemId={updatingItemId}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>

      <FooterActions
        order={order}
        updatingOrderId={updatingOrderId}
        serviceCallOrderId={serviceCallOrderId}
        onAdvance={onAdvance}
        onServiceAction={onServiceAction}
      />
    </article>
  )
}

export default function KdsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [boardHeight, setBoardHeight] = useState(600)
  const [searchTerm, setSearchTerm] = useState("")
  const [showQuickFilters, setShowQuickFilters] = useState(false)
  const [quickFilters, setQuickFilters] = useState({
    criticalOnly: false,
    withNotes: false,
    pendingItems: false,
    oldestFirst: true,
  })
  const [updatingOrderId, setUpdatingOrderId] = useState("")
  const [updatingItemId, setUpdatingItemId] = useState("")
  const [hiddenReadyOrderIds, setHiddenReadyOrderIds] = useState([])
  const [serviceCallOrderId, setServiceCallOrderId] = useState("")
  const [supportModal, setSupportModal] = useState({
    isOpen: false,
    order: null,
    motivo: INCIDENT_REASONS[0],
    mensaje: "",
  })
  const { showToast } = useToast()

  const hasActiveQuickFilters =
    quickFilters.criticalOnly ||
    quickFilters.withNotes ||
    quickFilters.pendingItems ||
    !quickFilters.oldestFirst

  async function loadKitchenOrders({ showLoading = false } = {}) {
    try {
      if (showLoading) {
        setIsLoadingOrders(true)
      }

      setOrdersError("")

      const kitchenOrders = await getKitchenOrders()
      const boardOrders = mapKitchenOrdersToBoard(kitchenOrders)

      setOrders(boardOrders)
      setLastUpdatedAt(new Date())
    } catch (error) {
      setOrdersError(
        error.message || "No se pudieron cargar las comandas de cocina.",
      )
    } finally {
      setIsLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadKitchenOrders({ showLoading: true })

    const intervalId = window.setInterval(() => {
      loadKitchenOrders()
    }, 30000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const timeoutIds = []

    orders.forEach((order) => {
      if (
        order.status !== "done" ||
        !order.rawId ||
        hiddenReadyOrderIds.includes(order.rawId)
      ) {
        return
      }

      const readyTime = order.readyAt ? new Date(order.readyAt).getTime() : Date.now()
      const elapsedReadyTime = Date.now() - readyTime
      const remainingDelay = Math.max(
        READY_ORDER_HIDE_DELAY_MS - elapsedReadyTime,
        0,
      )

      const timeoutId = window.setTimeout(() => {
        setHiddenReadyOrderIds((currentIds) =>
          currentIds.includes(order.rawId)
            ? currentIds
            : [...currentIds, order.rawId],
        )
      }, remainingDelay)

      timeoutIds.push(timeoutId)
    })

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [orders, hiddenReadyOrderIds])

  useEffect(() => {
    function measure() {
      const toolbar = document.querySelector(".kds-board-toolbar")

      const toolbarBottom = toolbar
        ? toolbar.getBoundingClientRect().bottom
        : 0

      const nextBoardHeight = Math.max(
        window.innerHeight - toolbarBottom - BOARD_BOTTOM_SAFE_GAP,
        320,
      )

      setBoardHeight(nextBoardHeight)
    }

    const measureFrame = window.requestAnimationFrame(measure)

    window.addEventListener("resize", measure)

    return () => {
      window.cancelAnimationFrame(measureFrame)
      window.removeEventListener("resize", measure)
    }
  }, [showQuickFilters])

  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status !== "done" ||
          !hiddenReadyOrderIds.includes(order.rawId),
      ),
    [orders, hiddenReadyOrderIds],
  )

  const filteredOrders = useMemo(() => {
    let result =
      activeFilter === "all"
        ? visibleOrders
        : visibleOrders.filter((order) => order.status === activeFilter)

    result = result.filter((order) => orderMatchesSearch(order, searchTerm))

    if (quickFilters.criticalOnly) {
      result = result.filter(orderIsCritical)
    }

    if (quickFilters.withNotes) {
      result = result.filter(orderHasNotes)
    }

    if (quickFilters.pendingItems) {
      result = result.filter(orderHasPendingItems)
    }

    return [...result].sort((a, b) =>
      quickFilters.oldestFirst
        ? b.elapsedMinutes - a.elapsedMinutes
        : a.elapsedMinutes - b.elapsedMinutes,
    )
  }, [activeFilter, visibleOrders, searchTerm, quickFilters])

  const columns = useMemo(
    () => buildColumns(filteredOrders, boardHeight),
    [filteredOrders, boardHeight],
  )

  async function handleAdvanceStatus(orderId) {
    const selectedOrder = orders.find((order) => order.id === orderId)

    if (!selectedOrder || updatingOrderId) {
      return
    }

    const nextStatus = getNextOrderStatus(selectedOrder.status)

    if (!nextStatus) {
      return
    }

    try {
      setUpdatingOrderId(orderId)

      await updateKitchenOrderStatus(selectedOrder.rawId, nextStatus)
      await loadKitchenOrders()
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo actualizar",
        message: error.message || "No se pudo actualizar el estado de la comanda.",
      })
    } finally {
      setUpdatingOrderId("")
    }
  }

  async function handleServiceAction(orderId) {
    const selectedOrder = orders.find((order) => order.id === orderId)

    if (!selectedOrder || serviceCallOrderId) {
      return
    }

    if (selectedOrder.status === "done") {
      try {
        setServiceCallOrderId(orderId)

        await createReadyOrderServiceCall(selectedOrder.rawId)

        showToast({
          type: "success",
          title: "Mesero notificado",
          message: "El pedido listo fue enviado a los avisos de cocina.",
        })
      } catch (error) {
        showToast({
          type: "error",
          title: "No se pudo llamar al mesero",
          message: error.message || "No se pudo crear el aviso de pedido listo.",
        })
      } finally {
        setServiceCallOrderId("")
      }

      return
    }

    setSupportModal({
      isOpen: true,
      order: selectedOrder,
      motivo: INCIDENT_REASONS[0],
      mensaje: "",
    })
  }

  function handleCloseSupportModal() {
    if (serviceCallOrderId) {
      return
    }

    setSupportModal({
      isOpen: false,
      order: null,
      motivo: INCIDENT_REASONS[0],
      mensaje: "",
    })
  }

  async function handleSubmitSupportRequest(event) {
    event.preventDefault()

    if (!supportModal.order || serviceCallOrderId) {
      return
    }

    try {
      setServiceCallOrderId(supportModal.order.id)

      await createKitchenIncidentServiceCall(supportModal.order.rawId, {
        motivo: supportModal.motivo,
        mensaje: supportModal.mensaje,
      })

      showToast({
        type: "success",
        title: "Apoyo solicitado",
        message: "El aviso fue enviado a salón para su atención.",
      })

      handleCloseSupportModal()
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo pedir apoyo",
        message: error.message || "No se pudo crear la incidencia de cocina.",
      })
    } finally {
      setServiceCallOrderId("")
    }
  }

  async function handleToggleItem(orderId, itemId) {
    const selectedOrder = orders.find((order) => order.id === orderId)

    if (!selectedOrder || updatingItemId) {
      return
    }

    const selectedItem = selectedOrder.items.find((item) => item.id === itemId)

    if (!selectedItem) {
      return
    }

    if (
      !canToggleKitchenItem({
        orderStatus: selectedOrder.status,
        itemDone: selectedItem.done,
      })
    ) {
      return
    }

    const nextStatus = getNextItemStatus({
      orderStatus: selectedOrder.status,
      itemDone: selectedItem.done,
    })

    if (!nextStatus) {
      return
    }

    try {
      setUpdatingItemId(itemId)

      await updateKitchenItemStatus(selectedItem.rawId, nextStatus)
      await loadKitchenOrders()
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo actualizar",
        message: error.message || "No se pudo actualizar el estado del ítem.",
      })
    } finally {
      setUpdatingItemId("")
    }
  }

  function handleToggleQuickFilter(filterKey) {
    setQuickFilters((currentFilters) => ({
      ...currentFilters,
      [filterKey]: !currentFilters[filterKey],
    }))
  }

  function handleToggleOrderDirection() {
    setQuickFilters((currentFilters) => ({
      ...currentFilters,
      oldestFirst: !currentFilters.oldestFirst,
    }))
  }

  return (
    <div className="kds-page">
      <header className="kds-topbar">
        <div className="kds-topbar__brand">
          <button
            className="kds-menu-button"
            type="button"
            aria-label="Abrir navegación"
          >
            <Menu size={21} />
          </button>

          <img
            src={logoUmari}
            alt=""
            className="kds-brand-logo"
            aria-hidden="true"
          />

          <div className="kds-title-block">
            <p>Umarí OS</p>
            <h1>Monitor de Cocina</h1>
          </div>
        </div>

        <div className="kds-topbar__tools">
          <label className="kds-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Buscar comanda, mesa, mesero, plato o nota…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <button
            className="kds-notification-button"
            type="button"
            aria-label="Ver notificaciones"
          >
            <Bell size={19} />
          </button>

          <span className="kds-topbar__divider" aria-hidden="true" />

          <div className="kds-user-summary" aria-label="Usuario actual">
            <div className="kds-user-avatar" aria-hidden="true">
              CA
            </div>

            <div>
              <strong>Chef Agus</strong>
              <span>Cocina</span>
            </div>
          </div>
        </div>
      </header>

      <main className="kds-shell">
        <section className="kds-board-toolbar">
          <div
            className="kds-filter-tabs"
            role="tablist"
            aria-label="Filtros de comandas"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                role="tab"
                aria-selected={activeFilter === filter.id}
                className={
                  activeFilter === filter.id
                    ? "kds-filter-tab kds-filter-tab--active"
                    : "kds-filter-tab"
                }
                type="button"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span className="kds-filter-tab__count">
                  {getFilterCount(visibleOrders, filter.id)}
                </span>
              </button>
            ))}
          </div>

          <div className="kds-toolbar-actions">
            {showQuickFilters && (
              <div className="kds-quick-filters" aria-label="Filtros rápidos">
                <button
                  className={
                    quickFilters.criticalOnly
                      ? "kds-quick-filter kds-quick-filter--active"
                      : "kds-quick-filter"
                  }
                  type="button"
                  onClick={() => handleToggleQuickFilter("criticalOnly")}
                >
                  Críticas
                </button>

                <button
                  className={
                    quickFilters.withNotes
                      ? "kds-quick-filter kds-quick-filter--active"
                      : "kds-quick-filter"
                  }
                  type="button"
                  onClick={() => handleToggleQuickFilter("withNotes")}
                >
                  Con notas
                </button>

                <button
                  className={
                    quickFilters.pendingItems
                      ? "kds-quick-filter kds-quick-filter--active"
                      : "kds-quick-filter"
                  }
                  type="button"
                  onClick={() => handleToggleQuickFilter("pendingItems")}
                >
                  Pendientes
                </button>

                <button
                  className="kds-quick-filter kds-quick-filter--sort"
                  type="button"
                  aria-pressed="true"
                  title="Cambiar orden de las comandas"
                  onClick={handleToggleOrderDirection}
                >
                  Orden:{" "}
                  {quickFilters.oldestFirst ? "Más antiguas" : "Más recientes"}
                </button>
              </div>
            )}

            {lastUpdatedAt && (
              <span className="kds-last-update">
                Actualizado {lastUpdatedAt.toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            <button
              className="kds-secondary-button"
              type="button"
              onClick={() => loadKitchenOrders({ showLoading: true })}
              disabled={isLoadingOrders}
            >
              {isLoadingOrders ? "Actualizando..." : "Actualizar"}
            </button>

            <button
              className={
                showQuickFilters || hasActiveQuickFilters
                  ? "kds-secondary-button kds-secondary-button--active"
                  : "kds-secondary-button"
              }
              type="button"
              onClick={() => setShowQuickFilters((isVisible) => !isVisible)}
            >
              <Filter size={16} />
              Filtrar
              {hasActiveQuickFilters && (
                <span className="kds-filter-active-dot" aria-hidden="true" />
              )}
            </button>
          </div>
        </section>

        {isLoadingOrders && orders.length === 0 ? (
          <section className="kds-state-card">
            <strong>Cargando comandas de cocina...</strong>
            <p>Estamos consultando las órdenes activas del monitor KDS.</p>
          </section>
        ) : ordersError ? (
          <section className="kds-state-card kds-state-card--error">
            <strong>No se pudieron cargar las comandas</strong>
            <p>{ordersError}</p>
            <button
              type="button"
              onClick={() => loadKitchenOrders({ showLoading: true })}
            >
              Reintentar
            </button>
          </section>
        ) : filteredOrders.length === 0 ? (
          <div className="kds-board-empty">
            <UtensilsCrossed size={28} />
            <p>No hay comandas para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="kds-board" style={{ height: `${boardHeight}px` }}>
            {columns.map((columnBlocks, columnIndex) => (
              <div key={columnIndex} className="kds-column">
                {columnBlocks.map((block, blockIndex) => {
                  const key = `${columnIndex}-${blockIndex}-${
                    block.order?.id ?? "spacer"
                  }`

                  if (block.kind === "spacer") {
                    return (
                      <div
                        key={key}
                        className="kds-order-spacer"
                        aria-hidden="true"
                      />
                    )
                  }

                  if (block.kind === "complete") {
                    return (
                      <CardComplete
                        key={key}
                        order={block.order}
                        updatingOrderId={updatingOrderId}
                        updatingItemId={updatingItemId}
                        serviceCallOrderId={serviceCallOrderId}
                        onAdvance={handleAdvanceStatus}
                        onToggleItem={handleToggleItem}
                        onServiceAction={handleServiceAction}
                      />
                    )
                  }

                  if (block.kind === "start") {
                    return (
                      <CardStart
                        key={key}
                        order={block.order}
                        items={block.items}
                        updatingItemId={updatingItemId}
                        onToggleItem={handleToggleItem}
                      />
                    )
                  }

                  if (block.kind === "end") {
                    return (
                      <CardEnd
                        key={key}
                        order={block.order}
                        items={block.items}
                        updatingOrderId={updatingOrderId}
                        updatingItemId={updatingItemId}
                        serviceCallOrderId={serviceCallOrderId}
                        onAdvance={handleAdvanceStatus}
                        onToggleItem={handleToggleItem}
                        onServiceAction={handleServiceAction}
                      />
                    )
                  }

                  return null
                })}
              </div>
            ))}
          </div>
        )}
      </main>

      {supportModal.isOpen && (
        <div className="kds-modal-backdrop" role="presentation">
          <section
            className="kds-support-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kds-support-modal-title"
          >
            <header className="kds-support-modal__header">
              <div>
                <p>Pedir apoyo</p>
                <h2 id="kds-support-modal-title">
                  Solicitar apoyo para {supportModal.order?.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseSupportModal}
                disabled={Boolean(serviceCallOrderId)}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </header>

            <form
              className="kds-support-modal__form"
              onSubmit={handleSubmitSupportRequest}
            >
              <label>
                Motivo
                <select
                  value={supportModal.motivo}
                  onChange={(event) =>
                    setSupportModal((currentModal) => ({
                      ...currentModal,
                      motivo: event.target.value,
                    }))
                  }
                  disabled={Boolean(serviceCallOrderId)}
                >
                  {INCIDENT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Mensaje opcional
                <textarea
                  value={supportModal.mensaje}
                  onChange={(event) =>
                    setSupportModal((currentModal) => ({
                      ...currentModal,
                      mensaje: event.target.value,
                    }))
                  }
                  placeholder="Ejemplo: falta aclarar una nota, hay demora o se necesita apoyo con la comanda."
                  rows={4}
                  disabled={Boolean(serviceCallOrderId)}
                />
              </label>

              <div className="kds-support-modal__actions">
                <button
                  className="kds-support-modal__cancel"
                  type="button"
                  onClick={handleCloseSupportModal}
                  disabled={Boolean(serviceCallOrderId)}
                >
                  Cancelar
                </button>

                <button
                  className="kds-support-modal__submit"
                  type="submit"
                  disabled={Boolean(serviceCallOrderId)}
                >
                  {serviceCallOrderId ? "Enviando..." : "Enviar aviso"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}