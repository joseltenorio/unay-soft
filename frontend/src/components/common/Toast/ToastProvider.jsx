// frontend/src/components/common/Toast/ToastProvider.jsx

import { useCallback, useMemo, useRef, useState } from "react"

import { Check, Info, TriangleAlert, X } from "lucide-react"

import ToastContext from "./toastContext"

import "./ToastProvider.css"

const toastIcons = {
  success: Check,
  error: X,
  warning: TriangleAlert,
  info: Info,
}

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const removeToast = useCallback((toastId) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    )

    if (timersRef.current[toastId]) {
      window.clearTimeout(timersRef.current[toastId])
      delete timersRef.current[toastId]
    }
  }, [])

  const showToast = useCallback(
    ({ type = "success", title = "", message = "", duration = 3200 }) => {
      const id = createToastId()

      const nextToast = {
        id,
        type,
        title,
        message,
      }

      setToasts((currentToasts) => [nextToast, ...currentToasts].slice(0, 4))

      timersRef.current[id] = window.setTimeout(() => {
        removeToast(id)
      }, duration)

      return id
    },
    [removeToast],
  )

  const value = useMemo(
    () => ({
      showToast,
      removeToast,
    }),
    [showToast, removeToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="toast-viewport"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => {
          const ToastIcon = toastIcons[toast.type] || toastIcons.info

          return (
              <article
                className={`toast toast--${toast.type}`}
                key={toast.id}
                role={toast.type === "error" ? "alert" : "status"}
              >
                <span className="toast__icon" aria-hidden="true">
                  <ToastIcon size={18} strokeWidth={2} />
                </span>

                <div className="toast__content">
                  {toast.title && <strong>{toast.title}</strong>}
                  {toast.message && <p>{toast.message}</p>}
                </div>

                <button
                  className="toast__close"
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Cerrar notificación"
                  title="Cerrar"
                >
                  ×
              </button>
            </article>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}