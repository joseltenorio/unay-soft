// src/components/common/AuthToast/AuthToast.jsx

import "./AuthToast.css"

export default function AuthToast({ type = "success", title, message, onClose }) {
  return (
    <div className={`auth-toast auth-toast--${type}`} role="status" aria-live="polite">
      <div className="auth-toast__bar" />

      <div className="auth-toast__icon" aria-hidden="true">
        {type === "success" ? "✓" : "×"}
      </div>

      <div className="auth-toast__content">
        <strong>{title}</strong>
        <span>{message}</span>
      </div>

      {onClose && (
        <button className="auth-toast__close" type="button" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  )
}