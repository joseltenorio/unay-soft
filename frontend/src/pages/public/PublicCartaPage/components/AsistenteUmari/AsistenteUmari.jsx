// frontend/src/pages/public/PublicCartaPage/components/AsistenteUmari/AsistenteUmari.jsx

import { useState } from "react"

import { consultarAsistente } from "../../../../../services/asistenteService"
import FloatingButton from "./FloatingButton"
import ChatWindow from "./ChatWindow"
import "./AsistenteUmari.css"

export default function AsistenteUmari({ cartaIdentifier, monedaSimbolo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  function toggleChat() {
    setIsOpen((prev) => !prev)
  }

  async function handleEnviarMensaje(texto) {
    setErrorMessage("")

    const nuevoMensajeUsuario = {
      rol: "usuario",
      contenido: texto,
      hora: new Date(),
    }

    const historialParaBackend = mensajes.map((m) => ({
      rol: m.rol,
      contenido: m.contenido,
    }))

    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    setIsLoading(true)

    try {
      const resultado = await consultarAsistente(
        cartaIdentifier,
        texto,
        historialParaBackend,
      )

      const mensajeAsistente = {
        rol: "asistente",
        contenido: resultado.respuesta,
        productos: resultado.productos || [],
        hora: new Date(),
      }

      setMensajes((prev) => [...prev, mensajeAsistente])
    } catch (error) {
      const mensajeError = {
        rol: "asistente",
        contenido:
          error.message ||
          "Lo siento, no pude procesar tu consulta. ¿Puedes reformularla?",
        isError: true,
        hora: new Date(),
      }

      setMensajes((prev) => [...prev, mensajeError])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="asistente-umari">
      {isOpen && (
        <ChatWindow
          mensajes={mensajes}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onEnviarMensaje={handleEnviarMensaje}
          onClose={toggleChat}
          monedaSimbolo={monedaSimbolo}
        />
      )}

      <FloatingButton isOpen={isOpen} onClick={toggleChat} />
    </div>
  )
}