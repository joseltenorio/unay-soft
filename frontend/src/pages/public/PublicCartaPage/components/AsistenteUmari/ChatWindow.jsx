// frontend/src/pages/public/PublicCartaPage/components/AsistenteUmari/ChatWindow.jsx

import { useEffect, useRef, useState } from "react"

const PREGUNTAS_RAPIDAS = [
  "¿Cuáles son sus platos más recomendados?",
  "¿Qué opciones tienen con mariscos?",
  "¿Tienen algo picante?",
  "¿Cuál es el plato más vendido?",
]

function formatHora(fecha) {
  return fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ProductoMiniCard({ producto, monedaSimbolo }) {
  return (
    <div className="asistente-producto-card">
      {producto.imagen_referencial && (
        <img
          src={producto.imagen_referencial}
          alt={producto.nombre}
          loading="lazy"
        />
      )}
      <div className="asistente-producto-card__body">
        <strong>{producto.nombre}</strong>
        <span>
          {monedaSimbolo} {Number(producto.precio_base).toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default function ChatWindow({
  mensajes,
  isLoading,
  errorMessage,
  onEnviarMensaje,
  onClose,
  monedaSimbolo,
}) {
  const [inputValue, setInputValue] = useState("")
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [mensajes, isLoading])

  function handleSubmit(event) {
    event.preventDefault()

    if (!inputValue.trim() || isLoading) return

    onEnviarMensaje(inputValue)
    setInputValue("")
  }

  function handlePreguntaRapida(pregunta) {
    if (isLoading) return
    onEnviarMensaje(pregunta)
  }

  const mostrarPreguntasRapidas = mensajes.length === 0

  return (
    <div className="asistente-chat" role="dialog" aria-label="Asistente Umari">
      <header className="asistente-chat__header">
        <span>Asistente Umari</span>
      </header>

      <div className="asistente-chat__body" ref={listRef}>
        <div className="asistente-msg asistente-msg--bot">
          <div className="asistente-msg__bubble">
            <p>¡Hola! Soy tu asistente de Umari. ¿En qué puedo ayudarte?</p>
            <p className="asistente-msg__hint">
              Puedes preguntarme sobre ingredientes, precios, disponibilidad o
              recomendaciones.
            </p>
          </div>
          <span className="asistente-msg__time">{formatHora(new Date())}</span>
        </div>

        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={`asistente-msg asistente-msg--${
              msg.rol === "asistente" ? "bot" : "user"
            }`}
          >
            <div
              className={`asistente-msg__bubble${
                msg.isError ? " asistente-msg__bubble--error" : ""
              }`}
            >
              <p>{msg.contenido}</p>
            </div>

            {msg.productos?.length > 0 && (
              <div className="asistente-productos">
                {msg.productos.map((producto) => (
                  <ProductoMiniCard
                    key={producto.id_producto}
                    producto={producto}
                    monedaSimbolo={monedaSimbolo}
                  />
                ))}
              </div>
            )}

            <span className="asistente-msg__time">{formatHora(msg.hora)}</span>
          </div>
        ))}

        {isLoading && (
          <div className="asistente-msg asistente-msg--bot">
            <div className="asistente-msg__bubble asistente-msg__bubble--loading">
              <span className="asistente-dot" />
              <span className="asistente-dot" />
              <span className="asistente-dot" />
            </div>
          </div>
        )}

        {mostrarPreguntasRapidas && !isLoading && (
          <div className="asistente-preguntas">
            {PREGUNTAS_RAPIDAS.map((pregunta) => (
              <button
                key={pregunta}
                type="button"
                className="asistente-preguntas__item"
                onClick={() => handlePreguntaRapida(pregunta)}
              >
                {pregunta}
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="asistente-chat__error" role="alert">
          {errorMessage}
        </p>
      )}

      <form className="asistente-chat__footer" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Escribe tu consulta..."
          disabled={isLoading}
          aria-label="Escribe tu consulta"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Enviar consulta"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20L21 12L4 4L4 10L15 12L4 14L4 20Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}