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
import "./KdsPage.css"

const TIME_THRESHOLDS = { fresh: 5, normal: 10, warn: 15 }

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

const MOCK_ORDERS = [
  {
    id: "#001",
    table: "M12",
    waiter: "Andrea",
    elapsedMinutes: 17,
    status: "process",
    items: [
      {
        id: 13,
        name: "Sudado de mero",
        quantity: 1,
        notes: ["Bien caliente"],
        done: false,
      },
      {
        id: 14,
        name: "Arroz blanco",
        quantity: 2,
        notes: [],
        done: true,
      },
      {
        id: 15,
        name: "Limonada frozen",
        quantity: 2,
        notes: ["Extra menta"],
        done: false,
      },
      {
        id: 16,
        name: "Ceviche clásico",
        quantity: 1,
        notes: ["Sin ají"],
        done: false,
      },
      {
        id: 17,
        name: "Jalea mixta",
        quantity: 1,
        notes: ["Sin yuyo"],
        done: false,
      },
      {
        id: 18,
        name: "Chaufa de mariscos",
        quantity: 2,
        notes: [],
        done: false,
      },
      {
        id: 19,
        name: "Leche de tigre",
        quantity: 1,
        notes: ["Picante normal"],
        done: false,
      },
      {
        id: 20,
        name: "Causa acevichada",
        quantity: 1,
        notes: ["Sin palta"],
        done: false,
      },
      {
        id: 21,
        name: "Tiradito",
        quantity: 2,
        notes: ["Salsa aparte"],
        done: false,
      },
      {
        id: 22,
        name: "Parihuela",
        quantity: 1,
        notes: ["Bien caliente"],
        done: false,
      },
      {
        id: 23,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
      {
        id: 24,
        name: "Chicharrón de pescado",
        quantity: 1,
        notes: ["Mayonesa aparte"],
        done: false,
      },
    ],
  },
  {
    id: "#003",
    table: "M2",
    waiter: "Luis",
    elapsedMinutes: 7,
    status: "done",
    items: [
      {
        id: 11,
        name: "Ceviche mixto",
        quantity: 1,
        notes: ["Sin cancha"],
        done: true,
      },
      {
        id: 12,
        name: "Inca Kola",
        quantity: 2,
        notes: [],
        done: true,
      },
    ],
  },
  {
    id: "#004",
    table: "M23",
    waiter: "Sofía",
    elapsedMinutes: 11,
    status: "process",
    items: [
      {
        id: 9,
        name: "Parihuela",
        quantity: 2,
        notes: ["Bien caliente"],
        done: true,
      },
      {
        id: 10,
        name: "Chaufa de mariscos",
        quantity: 1,
        notes: ["Sin langostino"],
        done: false,
      },
    ],
  },
  {
    id: "#006",
    table: "M8",
    waiter: "Carlos",
    elapsedMinutes: 8,
    status: "process",
    items: [
      {
        id: 6,
        name: "Tiradito de pescado",
        quantity: 3,
        notes: ["Salsa aparte"],
        done: true,
      },
      {
        id: 7,
        name: "Causa acevichada",
        quantity: 1,
        notes: ["Sin palta"],
        done: false,
      },
      {
        id: 8,
        name: "Maracuyá frozen",
        quantity: 2,
        notes: [],
        done: false,
      },
    ],
  },
  {
    id: "#008",
    table: "M1",
    waiter: "Andrea",
    elapsedMinutes: 2,
    status: "new",
    items: [
      {
        id: 4,
        name: "Leche de tigre",
        quantity: 1,
        notes: ["Picante normal"],
        done: false,
      },
      {
        id: 5,
        name: "Jalea mixta",
        quantity: 1,
        notes: ["Sin yuyo"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      {
        id: 1,
        name: "Ceviche clásico",
        quantity: 2,
        notes: ["Sin ají", "Sin cebolla"],
        done: false,
      },
      {
        id: 2,
        name: "Chicha morada",
        quantity: 1,
        notes: ["Sin hielo"],
        done: false,
      },
      {
        id: 3,
        name: "Arroz con mariscos",
        quantity: 1,
        notes: ["Extra limón"],
        done: false,
      },
    ],
  },
]

const STATUS_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Nuevos" },
  { id: "process", label: "En proceso" },
  { id: "done", label: "Listos" },
]

const getTimeUrgencyClass = (minutes) =>
  minutes <= TIME_THRESHOLDS.fresh
    ? "time--fresh"
    : minutes <= TIME_THRESHOLDS.normal
      ? "time--normal"
      : minutes <= TIME_THRESHOLDS.warn
        ? "time--warn"
        : "time--critical"

const formatElapsed = (minutes) =>
  `${String(Math.floor(minutes)).padStart(2, "0")}:00`

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
    done: "Entregado",
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
            {formatElapsed(order.elapsedMinutes)}
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

function ItemRow({ order, item, isLast, onToggleItem }) {
  return (
    <div className={`kds-card-item${isLast ? " kds-card-item--last" : ""}`}>
      <button
        className={
          item.done
            ? "kds-check-button kds-check-button--done"
            : "kds-check-button"
        }
        type="button"
        aria-label={`${item.done ? "Desmarcar" : "Marcar"} ${item.name}`}
        onClick={() => onToggleItem(order.id, item.id)}
      >
        {item.done && <Check size={12} strokeWidth={3} />}
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

function FooterActions({ order, onAdvance }) {
  return (
    <footer className="kds-card-footer">
      <button className="kds-waiter-button" type="button">
        <PhoneCall size={15} strokeWidth={2.2} />
        Llamar mesero
      </button>

      <button
        className={`kds-action-button kds-action-button--${order.status}`}
        type="button"
        onClick={() => onAdvance(order.id)}
        disabled={order.status === "done"}
      >
        {getPrimaryAction(order.status)}
      </button>
    </footer>
  )
}

function CardComplete({ order, onAdvance, onToggleItem }) {
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
            onToggleItem={onToggleItem}
          />
        ))}
      </div>

      <FooterActions order={order} onAdvance={onAdvance} />
    </article>
  )
}

function CardStart({ order, items, onToggleItem }) {
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

function CardEnd({ order, items, onAdvance, onToggleItem }) {
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
            onToggleItem={onToggleItem}
          />
        ))}
      </div>

      <FooterActions order={order} onAdvance={onAdvance} />
    </article>
  )
}

export default function KdsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [boardHeight, setBoardHeight] = useState(600)
  const [searchTerm, setSearchTerm] = useState("")
  const [showQuickFilters, setShowQuickFilters] = useState(false)
  const [quickFilters, setQuickFilters] = useState({
    criticalOnly: false,
    withNotes: false,
    pendingItems: false,
    oldestFirst: true,
  })

  const hasActiveQuickFilters =
  quickFilters.criticalOnly ||
  quickFilters.withNotes ||
  quickFilters.pendingItems ||
  !quickFilters.oldestFirst

  useEffect(() => {
    function measure() {
      const topbar = document.querySelector(".kds-topbar")
      const toolbar = document.querySelector(".kds-board-toolbar")

      const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 70
      const toolbarHeight = toolbar
        ? toolbar.getBoundingClientRect().height
        : 50

      setBoardHeight(
        Math.max(window.innerHeight - topbarHeight - toolbarHeight - 46, 320),
      )
    }

    measure()
    window.addEventListener("resize", measure)

    return () => window.removeEventListener("resize", measure)
  }, [])

  const filteredOrders = useMemo(() => {
    let result =
      activeFilter === "all"
        ? orders
        : orders.filter((order) => order.status === activeFilter)

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
  }, [activeFilter, orders, searchTerm, quickFilters])

  const columns = useMemo(
    () => buildColumns(filteredOrders, boardHeight),
    [filteredOrders, boardHeight],
  )

  function handleAdvanceStatus(orderId) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order
        }

        const nextStatus = {
          new: "process",
          process: "done",
          done: "done",
        }[order.status]

        return { ...order, status: nextStatus }
      }),
    )
  }

  function handleToggleItem(orderId, itemId) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order
        }

        return {
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item,
          ),
        }
      }),
    )
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
                  {getFilterCount(orders, filter.id)}
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
                  className="kds-quick-filter"
                  type="button"
                  onClick={handleToggleOrderDirection}
                >
                  {quickFilters.oldestFirst ? "Más antiguas" : "Más recientes"}
                </button>
              </div>
            )}

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

        {filteredOrders.length === 0 ? (
          <div className="kds-board-empty">
            <UtensilsCrossed size={28} />
            <p>Sin comandas en esta categoría</p>
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
                        onAdvance={handleAdvanceStatus}
                        onToggleItem={handleToggleItem}
                      />
                    )
                  }

                  if (block.kind === "start") {
                    return (
                      <CardStart
                        key={key}
                        order={block.order}
                        items={block.items}
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
                        onAdvance={handleAdvanceStatus}
                        onToggleItem={handleToggleItem}
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
    </div>
  )
}