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
  const [notifications, setNotifications] = useState([])
  const [isLoadingNotices, setIsLoadingNotices] = useState(false)
  const [isRefreshingNotices, setIsRefreshingNotices] = useState(false)
  const [attendingId, setAttendingId] = useState("")
  const [deliveringOrderId, setDeliveringOrderId] = useState("")
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

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

  useEffect(() => {
    if (!canViewKitchenNotices) {
      return undefined
    }

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
            <div className="pos-sale-panel__content">
              <span className="pos-sale-panel__status">Vista base</span>

              <h2>Venta y toma de pedidos</h2>

              <p>
                Esta pestaña queda reservada para la pantalla de venta del POS.
                La estructura por pestañas ya permite alternar entre la venta y
                los avisos de cocina sin dividir la pantalla.
              </p>
            </div>
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