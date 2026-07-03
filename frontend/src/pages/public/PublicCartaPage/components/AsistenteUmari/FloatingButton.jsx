// frontend/src/pages/public/PublicCartaPage/components/AsistenteUmari/FloatingButton.jsx

export default function FloatingButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      className="asistente-fab"
      onClick={onClick}
      aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente virtual"}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12C4 7.58 7.8 4 12.5 4C17.2 4 21 7.58 21 12C21 16.42 17.2 20 12.5 20C11.16 20 9.9 19.7 8.79 19.16L4 20L5.24 15.87C4.46 14.76 4 13.43 4 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="12" r="1.1" fill="currentColor" />
          <circle cx="12.5" cy="12" r="1.1" fill="currentColor" />
          <circle cx="16" cy="12" r="1.1" fill="currentColor" />
        </svg>
      )}
    </button>
  )
}